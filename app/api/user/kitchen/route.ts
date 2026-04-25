import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(request: NextRequest) {
  const userId = request.nextUrl.searchParams.get("userId");

  if (!userId) {
    return NextResponse.json({ error: "userId is required" }, { status: 400 });
  }

  const result = await db.query(
    `
    SELECT k.name
    FROM "users" u
    LEFT JOIN "kitchens" k ON k.id = u.kitchen_id
    WHERE u.id = $1::uuid
    LIMIT 1
    `,
    [userId],
  );

  if (result.rowCount === 0) {
    return NextResponse.json({ kitchenName: null }, { status: 404 });
  }

  const kitchenName = (result.rows[0] as { name: string | null }).name;
  return NextResponse.json({ kitchenName });
}
