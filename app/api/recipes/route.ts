import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { internalApiError } from "@/lib/server/api-error";
import { canWriteKitchenData, getKitchenContext } from "@/lib/server/kitchen-access";

type RecipeLineInput = {
  ingredientId: string;
  quantity: number;
  unit: string;
};

type CreateRecipePayload = {
  userId?: string;
  name?: string;
  instructions?: string;
  targetYield?: number;
  yieldUnit?: string;
  lines?: RecipeLineInput[];
};

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

  if (!userId) {
    return NextResponse.json({ error: "userId is required" }, { status: 400 });
  }
    const context = await getKitchenContext(userId);
    if (!context) {
      return NextResponse.json({ error: "Kitchen context not found" }, { status: 404 });
    }

    const result = await db.query(
      `
    SELECT
      r.id,
      r.name,
      r.instructions,
      r.target_yield AS "targetYield",
      r.yield_unit AS "yieldUnit",
      r.version,
      r.is_archived AS "isArchived",
      COALESCE(SUM(ri.quantity * COALESCE(i.cost_per_unit, 0)), 0) AS "theoreticalCost"
    FROM "recipes_v2" r
    LEFT JOIN "recipe_ingredients_v2" ri ON ri.recipe_id = r.id
    LEFT JOIN "ingredients" i ON i.id = ri.ingredient_id
    WHERE r.kitchen_id = $1::uuid
    GROUP BY r.id
    ORDER BY r.updated_at DESC
    `,
      [context.kitchenId],
    );

    return NextResponse.json({ items: result.rows });
  } catch (error) {
    return internalApiError("/api/recipes GET", error);
  }
}

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as CreateRecipePayload;
    const userId = payload.userId?.trim();

  if (!userId || !payload.name?.trim()) {
    return NextResponse.json({ error: "userId and name are required" }, { status: 400 });
  }
    const context = await getKitchenContext(userId);
    if (!context) {
      return NextResponse.json({ error: "Kitchen context not found" }, { status: 404 });
    }
    if (!canWriteKitchenData(context.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const recipeId = randomUUID();
    const client = await db.connect();
    await client.query("BEGIN");
    try {
    await client.query(
      `
      INSERT INTO "recipes_v2"
        (id, kitchen_id, name, instructions, target_yield, yield_unit, version, is_archived, created_by, created_at, updated_at)
      VALUES
        ($1::uuid, $2::uuid, $3, $4, $5, $6, 1, false, $7::uuid, NOW(), NOW())
      `,
      [
        recipeId,
        context.kitchenId,
        payload.name.trim(),
        payload.instructions?.trim() || null,
        payload.targetYield ?? 1,
        payload.yieldUnit?.trim() || "portion",
        context.userId,
      ],
    );

    for (const line of payload.lines ?? []) {
      await client.query(
        `
        INSERT INTO "recipe_ingredients_v2" (id, recipe_id, ingredient_id, quantity, unit, created_at, updated_at)
        VALUES ($1::uuid, $2::uuid, $3::uuid, $4, $5, NOW(), NOW())
        `,
        [randomUUID(), recipeId, line.ingredientId, line.quantity, line.unit],
      );
    }

      await client.query("COMMIT");
      return NextResponse.json({ ok: true, id: recipeId });
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    return internalApiError("/api/recipes POST", error);
  }
}
