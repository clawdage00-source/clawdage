import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { internalApiError } from "@/lib/server/api-error";
import { canWriteKitchenData, getKitchenContext } from "@/lib/server/kitchen-access";

type MenuItemInput = {
  recipeId: string;
  sellPrice: number;
  isAvailable?: boolean;
};

type CreateMenuPayload = {
  userId?: string;
  name?: string;
  channel?: string;
  serviceWindow?: string;
  isPublished?: boolean;
  items?: MenuItemInput[];
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
      m.id,
      m.name,
      m.channel,
      m.service_window AS "serviceWindow",
      m.is_published AS "isPublished",
      m.is_archived AS "isArchived",
      COUNT(mi.id)::int AS "itemCount"
    FROM "menus_v2" m
    LEFT JOIN "menu_items_v2" mi ON mi.menu_id = m.id
    WHERE m.kitchen_id = $1::uuid
    GROUP BY m.id
    ORDER BY m.updated_at DESC
    `,
      [context.kitchenId],
    );

    return NextResponse.json({ items: result.rows });
  } catch (error) {
    return internalApiError("/api/menus GET", error);
  }
}

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as CreateMenuPayload;
    const userId = payload.userId?.trim();
  if (!userId || !payload.name?.trim()) {
    return NextResponse.json({ error: "userId and name are required" }, { status: 400 });
  }
    const context = await getKitchenContext(userId);
    if (!context) {
      return NextResponse.json({ error: "Kitchen context not found" }, { status: 404 });
    }
    if (!canWriteKitchenData(context.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const menuId = randomUUID();
    const client = await db.connect();
    await client.query("BEGIN");
    try {
    await client.query(
      `
      INSERT INTO "menus_v2"
        (id, kitchen_id, name, channel, service_window, is_published, is_archived, created_by, created_at, updated_at)
      VALUES
        ($1::uuid, $2::uuid, $3, $4, $5, $6, false, $7::uuid, NOW(), NOW())
      `,
      [
        menuId,
        context.kitchenId,
        payload.name.trim(),
        payload.channel?.trim() || "inhouse",
        payload.serviceWindow?.trim() || "all_day",
        payload.isPublished ?? false,
        context.userId,
      ],
    );

    for (const item of payload.items ?? []) {
      await client.query(
        `
        INSERT INTO "menu_items_v2" (id, menu_id, recipe_id, sell_price, is_available, created_at, updated_at)
        VALUES ($1::uuid, $2::uuid, $3::uuid, $4, $5, NOW(), NOW())
        `,
        [randomUUID(), menuId, item.recipeId, item.sellPrice, item.isAvailable ?? true],
      );
    }

      await client.query("COMMIT");
      return NextResponse.json({ ok: true, id: menuId });
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    return internalApiError("/api/menus POST", error);
  }
}
