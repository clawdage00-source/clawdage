import { NextResponse } from "next/server";
import { db } from "@/lib/db";

type Payload = {
  userId?: string;
  email?: string;
  fullName?: string;
};

export async function POST(request: Request) {
  const body = (await request.json()) as Payload;
  const userId = body.userId?.trim();
  const email = body.email?.trim().toLowerCase();
  const fullName = body.fullName?.trim();

  if (!userId || !email || !fullName) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  await db.query(
    `
    INSERT INTO "users" (id, email, full_name, role, created_at)
    VALUES ($1::uuid, $2, $3, 'owner', NOW())
    ON CONFLICT (id)
    DO UPDATE SET
      email = EXCLUDED.email,
      full_name = EXCLUDED.full_name
    `,
    [userId, email, fullName],
  );

  return NextResponse.json({ ok: true });
}
