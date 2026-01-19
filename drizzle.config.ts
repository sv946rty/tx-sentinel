import { defineConfig } from "drizzle-kit"

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is required")
}

if (!process.env.DATABASE_SCHEMA) {
  throw new Error("DATABASE_SCHEMA is required")
}

export default defineConfig({
  schema: "./src/db/schema/index.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL,
  },
  schemaFilter: [process.env.DATABASE_SCHEMA],
  verbose: true,
  strict: true,
})
