import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { canWriteKitchenData, getKitchenContext } from "@/lib/server/kitchen-access";

type RecipeLineInput = {
  ingredientId: string;
  quantity: number;
  unit: string;
};

type UpdateRecipePayload = {
  userId?: string;
  name?: string;
  instructions?: string;
  targetYield?: number;
  yieldUnit?: string;
  isArchived?: boolean;
  lines?: RecipeLineInput[];
};

export async function GET(
  request: Request,
  { params }: { params: Promise<{ recipeId: string }> },
) {
  const { recipeId } = await params;
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("userId");
  if (!userId) {
    return NextResponse.json({ error: "userId is required" }, { status: 400 });
  }
  const context = await getKitchenContext(userId);
  if (!context) {
    return NextResponse.json({ error: "Kitchen context not found" }, { status: 404 });
  }

  const recipeResult = await db.query(
    `
    SELECT id, name, instructions, target_yield AS "targetYield", yield_unit AS "yieldUnit", version, is_archived AS "isArchived"
    FROM "recipes_v2"
    WHERE id = $1::uuid AND kitchen_id = $2::uuid
    LIMIT 1
    `,
    [recipeId, context.kitchenId],
  );
  if (recipeResult.rowCount === 0) {
    return NextResponse.json({ error: "Recipe not found" }, { status: 404 });
  }

  const linesResult = await db.query(
    `
    SELECT
      ri.id,
      ri.ingredient_id AS "ingredientId",
      i.name AS "ingredientName",
      ri.quantity,
      ri.unit,
      i.cost_per_unit AS "costPerUnit"
    FROM "recipe_ingredients_v2" ri
    JOIN "ingredients" i ON i.id = ri.ingredient_id
    WHERE ri.recipe_id = $1::uuid
    ORDER BY i.name ASC
    `,
    [recipeId],
  );

  return NextResponse.json({ recipe: recipeResult.rows[0], lines: linesResult.rows });
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ recipeId: string }> },
) {
  const { recipeId } = await params;
  const payload = (await request.json()) as UpdateRecipePayload;
  const userId = payload.userId?.trim();

  if (!userId) {
    return NextResponse.json({ error: "userId is required" }, { status: 400 });
  }

  const context = await getKitchenContext(userId);
  if (!context) {
    return NextResponse.json({ error: "Kitchen context not found" }, { status: 404 });
  }
  if (!canWriteKitchenData(context.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const client = await db.connect();
  await client.query("BEGIN");
  try {
    const updateResult = await client.query(
      `
      UPDATE "recipes_v2"
      SET
        name = COALESCE($1, name),
        instructions = COALESCE($2, instructions),
        target_yield = COALESCE($3, target_yield),
        yield_unit = COALESCE($4, yield_unit),
        is_archived = COALESCE($5, is_archived),
        version = version + 1,
        updated_at = NOW()
      WHERE id = $6::uuid AND kitchen_id = $7::uuid
      RETURNING id
      `,
      [
        payload.name?.trim() || null,
        payload.instructions?.trim() || null,
        payload.targetYield ?? null,
        payload.yieldUnit?.trim() || null,
        payload.isArchived ?? null,
        recipeId,
        context.kitchenId,
      ],
    );
    if (updateResult.rowCount === 0) {
      await client.query("ROLLBACK");
      return NextResponse.json({ error: "Recipe not found" }, { status: 404 });
    }

    if (payload.lines) {
      await client.query('DELETE FROM "recipe_ingredients_v2" WHERE recipe_id = $1::uuid', [recipeId]);
      for (const line of payload.lines) {
        await client.query(
          `
          INSERT INTO "recipe_ingredients_v2" (id, recipe_id, ingredient_id, quantity, unit, created_at, updated_at)
          VALUES ($1::uuid, $2::uuid, $3::uuid, $4, $5, NOW(), NOW())
          `,
          [randomUUID(), recipeId, line.ingredientId, line.quantity, line.unit],
        );
      }
    }

    await client.query("COMMIT");
    return NextResponse.json({ ok: true });
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}
