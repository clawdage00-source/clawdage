import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";

type Payload = {
  userId?: string;
  kitchenName?: string;
  city?: string;
  address?: string;
};

export async function POST(request: Request) {
  const body = (await request.json()) as Payload;
  const userId = body.userId?.trim();
  const kitchenName = body.kitchenName?.trim();
  const city = body.city?.trim() || null;
  const address = body.address?.trim() || null;

  if (!userId || !kitchenName) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const kitchenId = randomUUID();
  const client = await db.connect();

  await client.query("BEGIN");
  try {
    await client.query(
      `
      INSERT INTO "kitchens" (id, name, city, address, created_at)
      VALUES ($1::uuid, $2, $3, $4, NOW())
      `,
      [kitchenId, kitchenName, city, address],
    );

    await client.query('UPDATE "users" SET kitchen_id = $1::uuid WHERE id = $2::uuid', [
      kitchenId,
      userId,
    ]);

    await client.query("COMMIT");
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }

  return NextResponse.json({ ok: true, kitchenId });
}
