import { drizzle } from "drizzle-orm/postgres-js"
import postgres from "postgres"
import { env } from "@/lib/env"
import * as schema from "@/db/schema"

/**
 * PostgreSQL connection using the postgres.js driver.
 * Connection string comes from validated environment variables.
 */
const client = postgres(env.DATABASE_URL, {
  max: 10,
  idle_timeout: 20,
  connect_timeout: 10,
})

/**
 * Drizzle ORM instance.
 * Use this for all database operations.
 *
 * IMPORTANT: Schema is passed to enable db.query relational queries.
 */
export const db = drizzle(client, { schema })

/**
 * Export the raw client for advanced use cases.
 * Prefer using `db` for most operations.
 */
export { client }
