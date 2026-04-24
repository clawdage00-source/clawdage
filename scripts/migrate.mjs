import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import pg from "pg";

const { Client } = pg;

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  console.error("DATABASE_URL is not set.");
  process.exit(1);
}

const migrationFile = resolve(process.cwd(), "Untitled-2.sql");
const sql = await readFile(migrationFile, "utf8");

const client = new Client({
  connectionString: databaseUrl,
  ssl: {
    rejectUnauthorized: false,
  },
});

try {
  await client.connect();
  const existingCoreTable = await client.query(
    "select to_regclass('public.kitchens') is not null as exists",
  );

  if (existingCoreTable.rows[0]?.exists) {
    console.log(
      "Migration skipped: schema already exists (found public.kitchens).",
    );
    process.exit(0);
  }

  await client.query("BEGIN");
  await client.query(sql);
  await client.query("COMMIT");
  console.log("Migration applied successfully.");
} catch (error) {
  try {
    await client.query("ROLLBACK");
  } catch {
    // Ignore rollback errors when transaction was not started.
  }
  console.error("Migration failed.");
  console.error(error);
  process.exitCode = 1;
} finally {
  await client.end();
}
