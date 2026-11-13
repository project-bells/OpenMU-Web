import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const MIGRATIONS_DIR = path.join(__dirname, "migrations");

export async function runMigrations(pool) {
  const files = (await fs.readdir(MIGRATIONS_DIR))
    .filter((file) => file.endsWith(".sql"))
    .sort((a, b) => a.localeCompare(b));

  const client = await pool.connect();
  try {
    await client.query("CREATE SCHEMA IF NOT EXISTS web;");
    await client.query(`
      CREATE TABLE IF NOT EXISTS web.schema_migrations (
        version TEXT PRIMARY KEY,
        applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);

    const appliedResult = await client.query("SELECT version FROM web.schema_migrations;");
    const applied = new Set(appliedResult.rows.map((r) => r.version));

    for (const file of files) {
      if (applied.has(file)) continue;
      const sql = await fs.readFile(path.join(MIGRATIONS_DIR, file), "utf8");
      await client.query("BEGIN");
      try {
        await client.query(sql);
        await client.query(
          "INSERT INTO web.schema_migrations (version) VALUES ($1) ON CONFLICT (version) DO NOTHING;",
          [file]
        );
        await client.query("COMMIT");
      } catch (error) {
        await client.query("ROLLBACK");
        throw error;
      }
    }
  } finally {
    client.release();
  }
}

