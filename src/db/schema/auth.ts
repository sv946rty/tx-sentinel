import { text, timestamp, boolean } from "drizzle-orm/pg-core"
import { appSchema } from "./agent-runs"

/**
 * Better Auth Database Schema
 *
 * IMPORTANT: Better Auth generates its own string IDs, NOT UUIDs.
 * All ID columns MUST be text type, not uuid.
 *
 * These tables are required by Better Auth for authentication.
 * All tables live in the DATABASE_SCHEMA schema (e.g., "ai_agent").
 *
 * Tables:
 * - users: User accounts
 * - sessions: Active sessions
 * - accounts: OAuth provider connections
 * - verifications: Email/token verification
 */

/**
 * Users Table
 *
 * Stores user account information.
 */
export const users = appSchema.table("users", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").notNull().default(false),
  image: text("image"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
})

/**
 * Sessions Table
 *
 * Manages active user sessions.
 */
export const sessions = appSchema.table("sessions", {
  id: text("id").primaryKey(),
  expiresAt: timestamp("expires_at").notNull(),
  token: text("token").notNull().unique(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  // Session password authentication flag (for demo deployments)
  sessionPasswordAuthenticated: boolean("session_password_authenticated").default(false),
})

/**
 * Accounts Table
 *
 * Handles OAuth provider connections (Google, GitHub).
 */
export const accounts = appSchema.table("accounts", {
  id: text("id").primaryKey(),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: timestamp("access_token_expires_at"),
  refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
  scope: text("scope"),
  password: text("password"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
})

/**
 * Verifications Table
 *
 * Tracks verification requests (email, password reset, etc.).
 */
export const verifications = appSchema.table("verifications", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
})

/* -------------------------------------------------------------------------- */
/*                ✅ Better Auth REQUIRED singular model aliases               */
/* -------------------------------------------------------------------------- */

// These singular exports are REQUIRED because we rely on
// Better Auth's own internal auth logic.
// Better Auth checks for singular model names by default,
// not plural table names.
//
// DO NOT rename or remove these exports.
export const user = users
export const session = sessions
export const account = accounts
export const verification = verifications

/**
 * Type exports for use in application code.
 */
export type User = typeof users.$inferSelect
export type NewUser = typeof users.$inferInsert
export type Session = typeof sessions.$inferSelect
export type Account = typeof accounts.$inferSelect
export type Verification = typeof verifications.$inferSelect
