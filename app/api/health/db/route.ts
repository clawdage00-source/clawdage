import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  const result = await db.query("select now() as now");
  return NextResponse.json({ ok: true, now: result.rows[0]?.now ?? null });
}
