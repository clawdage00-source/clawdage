import { readdir, readFile } from "node:fs/promises";
import { resolve } from "node:path";
import pg from "pg";

const { Client } = pg;

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  console.error("DATABASE_URL is not set.");
  process.exit(1);
}

const migrationsDir = resolve(process.cwd(), "db/migrations");

const client = new Client({
  connectionString: databaseUrl,
  ssl: {
    rejectUnauthorized: false,
  },
});

try {
  await client.connect();
  await client.query(`
    CREATE TABLE IF NOT EXISTS "_migrations" (
      "name" varchar PRIMARY KEY,
      "applied_at" timestamp NOT NULL DEFAULT NOW()
    )
  `);

  const files = (await readdir(migrationsDir))
    .filter((file) => file.endsWith(".sql"))
    .sort((a, b) => a.localeCompare(b));

  if (files.length === 0) {
    console.log("No migration files found.");
    process.exit(0);
  }

  const appliedResult = await client.query('SELECT name FROM "_migrations"');
  const applied = new Set(appliedResult.rows.map((row) => row.name));

  for (const file of files) {
    if (applied.has(file)) {
      console.log(`Skipping ${file} (already applied).`);
      continue;
    }

    const sql = await readFile(resolve(migrationsDir, file), "utf8");
    await client.query("BEGIN");
    try {
      await client.query(sql);
      await client.query('INSERT INTO "_migrations" (name) VALUES ($1)', [file]);
      await client.query("COMMIT");
      console.log(`Applied ${file}.`);
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    }
  }

  console.log("Migration run complete.");
} catch (error) {
  console.error("Migration failed.");
  console.error(error);
  process.exitCode = 1;
} finally {
  await client.end();
}
