import { z } from "zod"

/**
 * Server-side environment variables schema.
 * These are validated at application startup and must never be exposed to the client.
 */
const serverEnvSchema = z.object({
  // Database
  DATABASE_URL: z
    .string()
    .min(1, "DATABASE_URL is required")
    .url("DATABASE_URL must be a valid URL"),
  DATABASE_SCHEMA: z
    .string()
    .min(1, "DATABASE_SCHEMA is required")
    .regex(
      /^[a-zA-Z_][a-zA-Z0-9_]*$/,
      "DATABASE_SCHEMA must be a valid PostgreSQL identifier"
    ),

  // Authentication (Better Auth)
  AUTH_SECRET: z.string().min(32, "AUTH_SECRET must be at least 32 characters"),

  // OpenAI
  OPENAI_API_KEY: z
    .string()
    .min(1, "OPENAI_API_KEY is required")
    .startsWith("sk-", "OPENAI_API_KEY must start with 'sk-'"),

  // Better Auth
  BETTER_AUTH_URL: z
    .string()
    .url("BETTER_AUTH_URL must be a valid URL")
    .default("http://localhost:3000"),

  // OAuth Providers
  GOOGLE_CLIENT_ID: z.string().min(1, "GOOGLE_CLIENT_ID is required"),
  GOOGLE_CLIENT_SECRET: z.string().min(1, "GOOGLE_CLIENT_SECRET is required"),
  GITHUB_CLIENT_ID: z.string().min(1, "GITHUB_CLIENT_ID is required"),
  GITHUB_CLIENT_SECRET: z.string().min(1, "GITHUB_CLIENT_SECRET is required"),

  // Session Password Protection (Optional - for demo deployment)
  REQUIRE_SESSION_PASSWORD: z
    .string()
    .optional()
    .transform((val) => val === "true"),
  SESSION_PASSWORD: z.string().optional(),

  // Node environment
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
})

/**
 * Public environment variables schema.
 * These can be exposed to the client via NEXT_PUBLIC_ prefix.
 * Keep this minimal — no secrets.
 */
const publicEnvSchema = z.object({
  NEXT_PUBLIC_APP_URL: z
    .string()
    .url("NEXT_PUBLIC_APP_URL must be a valid URL")
    .optional(),
})

/**
 * Validate and parse server environment variables.
 * This will throw at startup if any required variables are missing or invalid.
 */
function validateServerEnv() {
  const parsed = serverEnvSchema.safeParse(process.env)

  if (!parsed.success) {
    console.error("❌ Invalid server environment variables:")
    console.error(parsed.error.flatten().fieldErrors)
    throw new Error("Invalid server environment variables")
  }

  return parsed.data
}

/**
 * Validate and parse public environment variables.
 */
function validatePublicEnv() {
  const parsed = publicEnvSchema.safeParse({
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
  })

  if (!parsed.success) {
    console.error("❌ Invalid public environment variables:")
    console.error(parsed.error.flatten().fieldErrors)
    throw new Error("Invalid public environment variables")
  }

  return parsed.data
}

/**
 * Validated server environment variables.
 * Import this instead of using process.env directly.
 */
export const env = validateServerEnv()

/**
 * Validated public environment variables.
 * Safe to use in client components.
 */
export const publicEnv = validatePublicEnv()

/**
 * Type definitions for environment variables.
 */
export type ServerEnv = z.infer<typeof serverEnvSchema>
export type PublicEnv = z.infer<typeof publicEnvSchema>
