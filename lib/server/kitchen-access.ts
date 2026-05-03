import { db } from "@/lib/db";

type KitchenContext = {
  userId: string;
  kitchenId: string;
  role: string | null;
};

export async function getKitchenContext(userId: string): Promise<KitchenContext | null> {
  const result = await db.query(
    'SELECT id, kitchen_id, role FROM "users" WHERE id = $1::uuid LIMIT 1',
    [userId],
  );

  if (result.rowCount === 0) {
    return null;
  }

  const row = result.rows[0] as { id: string; kitchen_id: string | null; role: string | null };

  if (!row.kitchen_id) {
    return null;
  }

  return {
    userId: row.id,
    kitchenId: row.kitchen_id,
    role: row.role,
  };
}

export function canWriteKitchenData(role: string | null) {
  return role !== "viewer";
}
