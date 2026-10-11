import "dotenv/config";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import path from "node:path";
import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import postgres from "postgres";

// Applies the SQL migrations in /drizzle.
//
// The database was originally created with `drizzle-kit push`, which doesn't
// record migration history. If the tables exist but no history does, we first
// record the initial migration (0000) as applied, then let drizzle run the rest.
// Safe to run repeatedly.

const MIGRATIONS_FOLDER = path.join(process.cwd(), "drizzle");

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is not set.");
  const client = postgres(url, { max: 1, prepare: false, onnotice: () => {} });

  const [{ has_tables }] = await client`
    SELECT to_regclass('public.events') IS NOT NULL AS has_tables`;
  await client`CREATE SCHEMA IF NOT EXISTS drizzle`;
  await client`
    CREATE TABLE IF NOT EXISTS drizzle.__drizzle_migrations (
      id SERIAL PRIMARY KEY,
      hash text NOT NULL,
      created_at bigint
    )`;
  const [{ count }] = await client`
    SELECT count(*)::int AS count FROM drizzle.__drizzle_migrations`;

  if (has_tables && count === 0) {
    const journal = JSON.parse(
      readFileSync(path.join(MIGRATIONS_FOLDER, "meta/_journal.json"), "utf8"),
    ) as { entries: { tag: string; when: number }[] };
    const initial = journal.entries[0];
    const sql = readFileSync(
      path.join(MIGRATIONS_FOLDER, `${initial.tag}.sql`),
      "utf8",
    );
    const hash = createHash("sha256").update(sql).digest("hex");
    await client`
      INSERT INTO drizzle.__drizzle_migrations (hash, created_at)
      VALUES (${hash}, ${initial.when})`;
    console.log(
      `Existing database detected; marked ${initial.tag} as applied.`,
    );
  }

  await migrate(drizzle(client), { migrationsFolder: MIGRATIONS_FOLDER });
  console.log("Migrations complete.");
  await client.end();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
