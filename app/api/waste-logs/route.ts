import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { internalApiError } from "@/lib/server/api-error";
import { canWriteKitchenData, getKitchenContext } from "@/lib/server/kitchen-access";

type CreateWasteLogPayload = {
  userId?: string;
  ingredientId?: string;
  quantityWasted?: number;
  reason?: string;
  wasteDate?: string;
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
        w.id,
        w.ingredient_id AS "ingredientId",
        i.name AS "ingredientName",
        w.quantity_wasted AS "quantityWasted",
        w.reason,
        w.waste_date AS "wasteDate"
      FROM "waste_logs" w
      JOIN "ingredients" i ON i.id = w.ingredient_id
      WHERE w.kitchen_id = $1::uuid
      ORDER BY w.waste_date DESC, w.id DESC
      `,
      [context.kitchenId],
    );

    return NextResponse.json({ items: result.rows });
  } catch (error) {
    return internalApiError("/api/waste-logs GET", error);
  }
}

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as CreateWasteLogPayload;
    const userId = payload.userId?.trim();
    const ingredientId = payload.ingredientId?.trim();
    const reason = payload.reason?.trim();
    const wasteDate = payload.wasteDate?.trim();

    if (!userId || !ingredientId || !reason || !wasteDate || !payload.quantityWasted) {
      return NextResponse.json(
        { error: "userId, ingredientId, quantityWasted, reason and wasteDate are required" },
        { status: 400 },
      );
    }

    const context = await getKitchenContext(userId);
    if (!context) {
      return NextResponse.json({ error: "Kitchen context not found" }, { status: 404 });
    }
    if (!canWriteKitchenData(context.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await db.query(
      `
      INSERT INTO "waste_logs" (id, kitchen_id, ingredient_id, quantity_wasted, reason, waste_date)
      VALUES ($1::uuid, $2::uuid, $3::uuid, $4, $5, $6::date)
      `,
      [randomUUID(), context.kitchenId, ingredientId, payload.quantityWasted, reason, wasteDate],
    );

    return NextResponse.json({ ok: true });
  } catch (error) {
    return internalApiError("/api/waste-logs POST", error);
  }
}
