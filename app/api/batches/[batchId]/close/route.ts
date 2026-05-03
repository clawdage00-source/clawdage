import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { internalApiError } from "@/lib/server/api-error";
import { canWriteKitchenData, getKitchenContext } from "@/lib/server/kitchen-access";

type CloseBatchPayload = {
  userId?: string;
  actualYield?: number;
  wasteQuantity?: number;
  notes?: string;
  status?: "completed" | "discarded";
};

export async function POST(
  request: Request,
  { params }: { params: Promise<{ batchId: string }> },
) {
  try {
    const { batchId } = await params;
    const payload = (await request.json()) as CloseBatchPayload;
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

    const nextStatus = payload.status ?? "completed";
    if (!["completed", "discarded"].includes(nextStatus)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    const result = await db.query(
      `
    UPDATE "production_batches"
    SET
      status = $1,
      actual_yield = COALESCE($2, actual_yield),
      waste_quantity = COALESCE($3, waste_quantity),
      notes = COALESCE($4, notes),
      completed_at = NOW(),
      updated_at = NOW()
    WHERE id = $5::uuid AND kitchen_id = $6::uuid
    RETURNING id
    `,
      [
        nextStatus,
        payload.actualYield ?? null,
        payload.wasteQuantity ?? null,
        payload.notes?.trim() || null,
        batchId,
        context.kitchenId,
      ],
    );

    if (result.rowCount === 0) {
      return NextResponse.json({ error: "Batch not found" }, { status: 404 });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    return internalApiError("/api/batches/[batchId]/close POST", error);
  }
}
