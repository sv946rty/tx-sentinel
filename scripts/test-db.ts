#!/usr/bin/env tsx

import { db } from "../src/db"
import { sql } from "drizzle-orm"
import { env } from "../src/lib/env"

async function testDatabase() {
  console.log("🔍 Testing database connection...\n")

  try {
    // Test 1: Basic connection and version check
    console.log("1️⃣ Testing basic connection...")
    const result = await db.execute(
      sql`SELECT NOW() as current_time, version() as version`
    )

    const rows = Array.isArray(result) ? result : result.rows || []
    if (rows.length === 0) {
      throw new Error("No data returned from database query")
    }

    const row = rows[0] as any
    console.log("   ✅ Connection successful")
    console.log(`   📅 Current time: ${row.current_time}`)
    console.log(`   🗄️  PostgreSQL version: ${row.version}\n`)

    // Test 2: Schema verification
    console.log("2️⃣ Verifying schema...")
    const schemaName = env.DATABASE_SCHEMA
    console.log(`   📁 Schema name: ${schemaName}\n`)

    // Test 3: List tables
    console.log("3️⃣ Listing tables in schema...")
    const tablesResult = await db.execute(
      sql`
        SELECT table_name
        FROM information_schema.tables
        WHERE table_schema = ${schemaName}
        ORDER BY table_name
      `
    )

    const tablesRows = Array.isArray(tablesResult)
      ? tablesResult
      : tablesResult.rows || []
    const tables = tablesRows.map((t: any) => t.table_name)

    if (tables.length === 0) {
      console.log(`   ⚠️  No tables found in schema "${schemaName}"`)
      console.log("   💡 Run: pnpm db:generate && pnpm db:migrate\n")
    } else {
      console.log(`   ✅ Found ${tables.length} tables:`)
      tables.forEach((table: string) => {
        console.log(`      - ${table}`)
      })
      console.log()
    }

    console.log("✅ All database tests passed!\n")
    process.exit(0)
  } catch (error: any) {
    console.error("❌ Database test failed!\n")
    console.error("Error:", error.message)
    console.error("\n💡 Troubleshooting:")
    console.error("   1. Check DATABASE_URL in .env file")
    console.error("   2. Verify PostgreSQL is running")
    console.error("   3. Confirm database credentials are correct")
    console.error("   4. Check network connectivity\n")
    process.exit(1)
  }
}

testDatabase()
