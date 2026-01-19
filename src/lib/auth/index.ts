import { betterAuth } from "better-auth"
import { drizzleAdapter } from "better-auth/adapters/drizzle"
import { db } from "@/db"
import { env } from "@/lib/env"
import * as schema from "@/db/schema"

/**
 * Better Auth Configuration
 *
 * Authentication is used ONLY for:
 * - Identifying the user
 * - Associating agent runs with a user
 *
 * Authentication MUST NOT influence agent reasoning.
 */
export const auth = betterAuth({
  /**
   * Base URL for authentication callbacks.
   */
  baseURL: env.BETTER_AUTH_URL,

  /**
   * Trusted origins for OAuth callbacks.
   * This prevents state_mismatch errors during OAuth flow.
   */
  trustedOrigins: [env.BETTER_AUTH_URL],

  /**
   * Database adapter using Drizzle ORM with PostgreSQL.
   * Tables are created in the DATABASE_SCHEMA schema.
   */
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: {
      user: schema.user,
      session: schema.session,
      account: schema.account,
      verification: schema.verification,
    },
  }),

  /**
   * Secret key for signing tokens and encrypting data.
   */
  secret: env.AUTH_SECRET,

  /**
   * OAuth Providers: Google and GitHub
   */
  socialProviders: {
    google: {
      clientId: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
    },
    github: {
      clientId: env.GITHUB_CLIENT_ID,
      clientSecret: env.GITHUB_CLIENT_SECRET,
    },
  },

  /**
   * Session configuration
   */
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // Update session every 24 hours
    cookieCache: {
      enabled: true,
      maxAge: 60 * 5, // 5 minutes
    },
  },

})

/**
 * Auth type exports for use in application code.
 */
export type Session = typeof auth.$Infer.Session
export type User = typeof auth.$Infer.Session.user
