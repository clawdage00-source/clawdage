import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(request: NextRequest) {
  const userId = request.nextUrl.searchParams.get("userId");

  if (!userId) {
    return NextResponse.json({ error: "userId is required" }, { status: 400 });
  }

  const userResult = await db.query(
    'SELECT id, full_name, kitchen_id FROM "users" WHERE id = $1 LIMIT 1',
    [userId],
  );

  if (userResult.rowCount === 0) {
    return NextResponse.json({
      hasProfile: false,
      hasKitchen: false,
    });
  }

  const user = userResult.rows[0] as {
    full_name: string | null;
    kitchen_id: string | null;
  };

  return NextResponse.json({
    hasProfile: Boolean(user.full_name),
    hasKitchen: Boolean(user.kitchen_id),
  });
}
