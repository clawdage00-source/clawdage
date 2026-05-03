import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { canWriteKitchenData, getKitchenContext } from "@/lib/server/kitchen-access";

type MenuItemInput = {
  recipeId: string;
  sellPrice: number;
  isAvailable?: boolean;
};

type UpdateMenuPayload = {
  userId?: string;
  name?: string;
  channel?: string;
  serviceWindow?: string;
  isPublished?: boolean;
  isArchived?: boolean;
  items?: MenuItemInput[];
};

export async function GET(
  request: Request,
  { params }: { params: Promise<{ menuId: string }> },
) {
  const { menuId } = await params;
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("userId");
  if (!userId) {
    return NextResponse.json({ error: "userId is required" }, { status: 400 });
  }
  const context = await getKitchenContext(userId);
  if (!context) {
    return NextResponse.json({ error: "Kitchen context not found" }, { status: 404 });
  }

  const menuResult = await db.query(
    `
    SELECT
      id,
      name,
      channel,
      service_window AS "serviceWindow",
      is_published AS "isPublished",
      is_archived AS "isArchived"
    FROM "menus_v2"
    WHERE id = $1::uuid AND kitchen_id = $2::uuid
    LIMIT 1
    `,
    [menuId, context.kitchenId],
  );
  if (menuResult.rowCount === 0) {
    return NextResponse.json({ error: "Menu not found" }, { status: 404 });
  }

  const itemsResult = await db.query(
    `
    SELECT
      mi.id,
      mi.recipe_id AS "recipeId",
      r.name AS "recipeName",
      mi.sell_price AS "sellPrice",
      mi.is_available AS "isAvailable",
      COALESCE(costs.total_cost, 0) AS "recipeCost"
    FROM "menu_items_v2" mi
    JOIN "recipes_v2" r ON r.id = mi.recipe_id
    LEFT JOIN (
      SELECT ri.recipe_id, SUM(ri.quantity * COALESCE(i.cost_per_unit, 0)) AS total_cost
      FROM "recipe_ingredients_v2" ri
      LEFT JOIN "ingredients" i ON i.id = ri.ingredient_id
      GROUP BY ri.recipe_id
    ) costs ON costs.recipe_id = mi.recipe_id
    WHERE mi.menu_id = $1::uuid
    ORDER BY r.name ASC
    `,
    [menuId],
  );

  return NextResponse.json({ menu: menuResult.rows[0], items: itemsResult.rows });
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ menuId: string }> },
) {
  const { menuId } = await params;
  const payload = (await request.json()) as UpdateMenuPayload;
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
  await client.query("BEGIN");
  try {
    const updateResult = await client.query(
      `
      UPDATE "menus_v2"
      SET
        name = COALESCE($1, name),
        channel = COALESCE($2, channel),
        service_window = COALESCE($3, service_window),
        is_published = COALESCE($4, is_published),
        is_archived = COALESCE($5, is_archived),
        updated_at = NOW()
      WHERE id = $6::uuid AND kitchen_id = $7::uuid
      RETURNING id
      `,
      [
        payload.name?.trim() || null,
        payload.channel?.trim() || null,
        payload.serviceWindow?.trim() || null,
        payload.isPublished ?? null,
        payload.isArchived ?? null,
        menuId,
        context.kitchenId,
      ],
    );
    if (updateResult.rowCount === 0) {
      await client.query("ROLLBACK");
      return NextResponse.json({ error: "Menu not found" }, { status: 404 });
    }

    if (payload.items) {
      await client.query('DELETE FROM "menu_items_v2" WHERE menu_id = $1::uuid', [menuId]);
      for (const item of payload.items) {
        await client.query(
          `
          INSERT INTO "menu_items_v2" (id, menu_id, recipe_id, sell_price, is_available, created_at, updated_at)
          VALUES ($1::uuid, $2::uuid, $3::uuid, $4, $5, NOW(), NOW())
          `,
          [randomUUID(), menuId, item.recipeId, item.sellPrice, item.isAvailable ?? true],
        );
      }
    }

    await client.query("COMMIT");
    return NextResponse.json({ ok: true });
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}
