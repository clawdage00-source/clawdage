import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { internalApiError } from "@/lib/server/api-error";
import { canWriteKitchenData, getKitchenContext } from "@/lib/server/kitchen-access";
import { seedSampleKitchenData } from "@/lib/server/seed-sample-kitchen";

type Body = {
  userId?: string;
};

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as Body;
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
    try {
      await client.query("BEGIN");
      const summary = await seedSampleKitchenData(client, {
        userId: context.userId,
        kitchenId: context.kitchenId,
      });
      await client.query("COMMIT");
      return NextResponse.json({ ok: true, ...summary });
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    return internalApiError("/api/sample-data POST", error);
  }
}
