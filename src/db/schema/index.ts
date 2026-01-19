/**
 * Database schema exports.
 *
 * All Drizzle table definitions are exported from this file.
 * This file is referenced by drizzle.config.ts for migrations.
 *
 * All tables live in the DATABASE_SCHEMA schema (e.g., "ai_agent").
 * The `public` schema is NEVER used.
 */

// Agent runs table
export {
  appSchema,
  agentRuns,
  type AgentRun,
  type NewAgentRun,
} from "./agent-runs"

// Better Auth tables (plural - actual table names)
export {
  users,
  sessions,
  accounts,
  verifications,
  type User,
  type NewUser,
  type Session,
  type Account,
  type Verification,
} from "./auth"

// Better Auth REQUIRED singular model aliases
// These are required by Better Auth's internal logic
export {
  user,
  session,
  account,
  verification,
} from "./auth"
