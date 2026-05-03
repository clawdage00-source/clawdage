import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { internalApiError } from "@/lib/server/api-error";
import { canWriteKitchenData, getKitchenContext } from "@/lib/server/kitchen-access";

type UpdateIngredientPayload = {
  userId?: string;
  name?: string;
  category?: string;
  unit?: string;
  sku?: string;
  vendorName?: string;
  parLevel?: number;
  currentStock?: number;
  costPerUnit?: number;
  isArchived?: boolean;
};

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ ingredientId: string }> },
) {
  try {
    const { ingredientId } = await params;
    const payload = (await request.json()) as UpdateIngredientPayload;
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

    const result = await db.query(
      `
    UPDATE "ingredients"
    SET
      name = COALESCE($1, name),
      category = COALESCE($2, category),
      unit = COALESCE($3, unit),
      sku = COALESCE($4, sku),
      vendor_name = COALESCE($5, vendor_name),
      par_level = COALESCE($6, par_level),
      current_stock = COALESCE($7, current_stock),
      cost_per_unit = COALESCE($8, cost_per_unit),
      is_archived = COALESCE($9, is_archived),
      updated_at = NOW()
    WHERE id = $10::uuid AND kitchen_id = $11::uuid
    RETURNING id
    `,
    [
      payload.name?.trim() || null,
      payload.category?.trim() || null,
      payload.unit?.trim() || null,
      payload.sku?.trim() || null,
      payload.vendorName?.trim() || null,
      payload.parLevel ?? null,
      payload.currentStock ?? null,
      payload.costPerUnit ?? null,
      payload.isArchived ?? null,
      ingredientId,
      context.kitchenId,
      ],
    );

    if (result.rowCount === 0) {
      return NextResponse.json({ error: "Ingredient not found" }, { status: 404 });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    return internalApiError("/api/ingredients/[ingredientId] PATCH", error);
  }
}
