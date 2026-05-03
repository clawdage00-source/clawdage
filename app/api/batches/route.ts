import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { internalApiError } from "@/lib/server/api-error";
import { canWriteKitchenData, getKitchenContext } from "@/lib/server/kitchen-access";

type CreateBatchPayload = {
  userId?: string;
  recipeId?: string;
  expectedYield?: number;
  notes?: string;
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
      b.id,
      b.recipe_id AS "recipeId",
      r.name AS "recipeName",
      b.status,
      b.expected_yield AS "expectedYield",
      b.actual_yield AS "actualYield",
      b.waste_quantity AS "wasteQuantity",
      b.per_unit_cost_snapshot AS "perUnitCostSnapshot",
      b.created_at AS "createdAt"
    FROM "production_batches" b
    JOIN "recipes_v2" r ON r.id = b.recipe_id
    WHERE b.kitchen_id = $1::uuid
    ORDER BY b.created_at DESC
    `,
      [context.kitchenId],
    );
    return NextResponse.json({ items: result.rows });
  } catch (error) {
    return internalApiError("/api/batches GET", error);
  }
}

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as CreateBatchPayload;
    const userId = payload.userId?.trim();
  if (!userId || !payload.recipeId) {
    return NextResponse.json({ error: "userId and recipeId are required" }, { status: 400 });
  }
    const context = await getKitchenContext(userId);
    if (!context) {
      return NextResponse.json({ error: "Kitchen context not found" }, { status: 404 });
    }
    if (!canWriteKitchenData(context.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const recipeResult = await db.query(
      `
    SELECT
      r.target_yield,
      COALESCE(SUM(ri.quantity * COALESCE(i.cost_per_unit, 0)), 0) AS total_cost
    FROM "recipes_v2" r
    LEFT JOIN "recipe_ingredients_v2" ri ON ri.recipe_id = r.id
    LEFT JOIN "ingredients" i ON i.id = ri.ingredient_id
    WHERE r.id = $1::uuid AND r.kitchen_id = $2::uuid
    GROUP BY r.id
    LIMIT 1
    `,
      [payload.recipeId, context.kitchenId],
    );
    if (recipeResult.rowCount === 0) {
      return NextResponse.json({ error: "Recipe not found" }, { status: 404 });
    }

    const recipe = recipeResult.rows[0] as { target_yield: string; total_cost: string };
    const expectedYield = payload.expectedYield ?? Number(recipe.target_yield);
    const totalCost = Number(recipe.total_cost);
    const perUnitCostSnapshot = expectedYield > 0 ? totalCost / expectedYield : 0;

    const batchId = randomUUID();
    await db.query(
      `
    INSERT INTO "production_batches"
      (id, kitchen_id, recipe_id, status, expected_yield, per_unit_cost_snapshot, notes, started_at, created_by, created_at, updated_at)
    VALUES
      ($1::uuid, $2::uuid, $3::uuid, 'in_progress', $4, $5, $6, NOW(), $7::uuid, NOW(), NOW())
    `,
      [batchId, context.kitchenId, payload.recipeId, expectedYield, perUnitCostSnapshot, payload.notes?.trim() || null, context.userId],
    );

    return NextResponse.json({ ok: true, id: batchId });
  } catch (error) {
    return internalApiError("/api/batches POST", error);
  }
}
