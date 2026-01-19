import { headers } from "next/headers"
import { auth } from "./index"

/**
 * Get the current session in Server Components or Server Actions.
 *
 * Returns null if the user is not authenticated.
 */
export async function getSession() {
  const session = await auth.api.getSession({
    headers: await headers(),
  })
  return session
}

/**
 * Get the current user in Server Components or Server Actions.
 *
 * Returns null if the user is not authenticated.
 */
export async function getCurrentUser() {
  const session = await getSession()
  return session?.user ?? null
}

/**
 * Require authentication in Server Components or Server Actions.
 *
 * Throws an error if the user is not authenticated.
 * Use this for protected routes/actions.
 */
export async function requireAuth() {
  const session = await getSession()

  if (!session?.user) {
    throw new Error("Authentication required")
  }

  return session
}

/**
 * Check if the user is authenticated.
 *
 * Returns true if authenticated, false otherwise.
 */
export async function isAuthenticated(): Promise<boolean> {
  const session = await getSession()
  return session?.user != null
}
