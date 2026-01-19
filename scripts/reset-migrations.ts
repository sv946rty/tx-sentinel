#!/usr/bin/env tsx

/**
 * ⚠️  DESTRUCTIVE DEV-ONLY SCRIPT
 *
 * This script is intended for LOCAL / CI / DEVELOPMENT environments ONLY.
 *
 * Safety rules:
 * - If NODE_ENV === "production", this script will abort immediately.
 *
 * Operations performed:
 *
 * 1) If `DATABASE_SCHEMA` is explicitly set (e.g. "ai_agent"):
 *    - Drops ALL tables in the specified schema (CASCADE)
 *    - Drops specific ENUM types in that schema:
 *        • team_role
 *        • user_role
 *
 * 2) If `DATABASE_SCHEMA` is NOT set:
 *    - NO tables are dropped
 *    - NO ENUMs are dropped
 *    - The `public` schema is never modified
 *
 * 3) In all cases:
 *    - Clears Drizzle migration history by truncating:
 *        drizzle.__drizzle_migrations
 *
 * ❌ DO NOT RUN THIS SCRIPT IN PRODUCTION
 */

import { db } from "../src/db"
import { sql } from "drizzle-orm"
import { env } from "../src/lib/env"

// ⛔ Hard stop in production
if (process.env.NODE_ENV === "production") {
  console.error(`
❌ ERROR: reset-migrations.ts was invoked in PRODUCTION

This script performs destructive database operations and is
explicitly blocked from running when NODE_ENV=production.

Aborting immediately.
`)
  process.exit(1)
}

/**
 * Only allow destructive operations when DATABASE_SCHEMA is explicitly set.
 * Never drop tables or enums implicitly in \`public\`.
 */
const schema =
  env.DATABASE_SCHEMA && /^[a-zA-Z_][a-zA-Z0-9_]*$/.test(env.DATABASE_SCHEMA)
    ? env.DATABASE_SCHEMA
    : null

async function resetMigrations() {
  console.log("🔄 Resetting migration state...\n")

  try {
    if (schema) {
      console.log(`🔥 Destructive reset for schema "${schema}"\n`)

      // 1️⃣ Drop all tables in the specified schema
      console.log("🧹 Dropping all tables...\n")

      await db.execute(
        sql.raw(`
          DO $$
          DECLARE
            r RECORD;
          BEGIN
            FOR r IN
              SELECT tablename
              FROM pg_tables
              WHERE schemaname = '${schema}'
            LOOP
              EXECUTE
                'DROP TABLE IF EXISTS '
                || quote_ident('${schema}')
                || '.'
                || quote_ident(r.tablename)
                || ' CASCADE';
            END LOOP;
          END $$;
        `)
      )

      console.log("✅ Tables dropped\n")

      // 2️⃣ Drop ENUM types in the schema
      console.log("🧹 Dropping ENUM types...\n")

      await db.execute(
        sql.raw(`DROP TYPE IF EXISTS "${schema}"."team_role" CASCADE;`)
      )
      await db.execute(
        sql.raw(`DROP TYPE IF EXISTS "${schema}"."user_role" CASCADE;`)
      )

      console.log("✅ ENUM types dropped\n")
    } else {
      console.log("⚠️  DATABASE_SCHEMA not set — skipping table & enum drops\n")
    }

    // 3️⃣ Clear drizzle migration history (always)
    console.log("🧹 Clearing drizzle migration history...\n")

    await db.execute(sql`TRUNCATE TABLE drizzle.__drizzle_migrations;`)

    console.log("✅ Migration history cleared\n")
    console.log("Next step:")
    console.log("  pnpm db:migrate\n")

    process.exit(0)
  } catch (error) {
    console.error("❌ Reset failed:")
    console.error(error)
    process.exit(1)
  }
}

resetMigrations()
