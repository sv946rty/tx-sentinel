import { createAuthClient } from "better-auth/react"

/**
 * Better Auth Client
 *
 * Used for client-side authentication operations:
 * - Sign in with OAuth providers
 * - Sign out
 * - Get current session
 *
 * This client is used in "use client" components only.
 */
export const authClient = createAuthClient({
  /**
   * Base URL is automatically inferred from the current origin.
   * The auth API is mounted at /api/auth/[...all]
   */
})

/**
 * Export commonly used hooks and functions.
 */
export const { signIn, signOut, useSession } = authClient
