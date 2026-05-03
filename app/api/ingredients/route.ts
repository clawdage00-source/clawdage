import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { internalApiError } from "@/lib/server/api-error";
import { canWriteKitchenData, getKitchenContext } from "@/lib/server/kitchen-access";

type CreateIngredientPayload = {
  userId?: string;
  name?: string;
  category?: string;
  unit?: string;
  sku?: string;
  vendorName?: string;
  parLevel?: number;
  currentStock?: number;
  costPerUnit?: number;
};

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    const q = searchParams.get("q")?.trim() || null;
    const lowStockOnly = searchParams.get("lowStockOnly") === "true";

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
      id,
      name,
      category,
      unit,
      sku,
      vendor_name AS "vendorName",
      par_level AS "parLevel",
      current_stock AS "currentStock",
      cost_per_unit AS "costPerUnit",
      is_archived AS "isArchived",
      updated_at AS "updatedAt"
    FROM "ingredients"
    WHERE kitchen_id = $1::uuid
      AND ($2::text IS NULL OR name ILIKE '%' || $2 || '%')
      AND ($3::boolean = false OR current_stock < COALESCE(par_level, 0))
    ORDER BY is_archived ASC, updated_at DESC NULLS LAST, name ASC
    `,
      [context.kitchenId, q, lowStockOnly],
    );

    return NextResponse.json({ items: result.rows });
  } catch (error) {
    return internalApiError("/api/ingredients GET", error);
  }
}

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as CreateIngredientPayload;
    const userId = payload.userId?.trim();

  if (!userId || !payload.name?.trim() || !payload.unit?.trim()) {
    return NextResponse.json({ error: "userId, name and unit are required" }, { status: 400 });
  }

    const context = await getKitchenContext(userId);
    if (!context) {
      return NextResponse.json({ error: "Kitchen context not found" }, { status: 404 });
    }
    if (!canWriteKitchenData(context.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const ingredientId = randomUUID();
    const now = new Date();
    await db.query(
      `
    INSERT INTO "ingredients"
      (id, kitchen_id, name, category, unit, sku, vendor_name, par_level, current_stock, cost_per_unit, is_archived, created_by, created_at, updated_at)
    VALUES
      ($1::uuid, $2::uuid, $3, $4, $5, $6, $7, $8, $9, $10, false, $11::uuid, $12, $12)
    `,
    [
      ingredientId,
      context.kitchenId,
      payload.name.trim(),
      payload.category?.trim() || null,
      payload.unit.trim(),
      payload.sku?.trim() || null,
      payload.vendorName?.trim() || null,
      payload.parLevel ?? null,
      payload.currentStock ?? 0,
      payload.costPerUnit ?? null,
      context.userId,
      now,
      ],
    );

    return NextResponse.json({ ok: true, id: ingredientId });
  } catch (error) {
    return internalApiError("/api/ingredients POST", error);
  }
}
