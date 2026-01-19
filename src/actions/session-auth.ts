"use server"

import { auth } from "@/lib/auth"
import { env } from "@/lib/env"
import { headers } from "next/headers"
import { db } from "@/db"
import { sessions } from "@/db/schema"
import { eq } from "drizzle-orm"

/**
 * Session Authentication Actions
 *
 * Handles session-level password protection for demo deployments.
 * This is an optional feature controlled by REQUIRE_SESSION_PASSWORD env var.
 *
 * Authentication state is stored in the database sessions table,
 * so it's tied to the actual Better Auth session lifecycle.
 */

interface VerifyPasswordResult {
  success: boolean
  error?: string
}

interface CheckAuthResult {
  requiresPassword: boolean
  isAuthenticated: boolean
}

/**
 * Verify session password
 *
 * Checks if the provided password matches SESSION_PASSWORD env var.
 * If valid, marks the session as authenticated in the database.
 */
export async function verifySessionPassword(
  password: string
): Promise<VerifyPasswordResult> {
  try {
    // Check if password protection is enabled
    if (!env.REQUIRE_SESSION_PASSWORD) {
      return { success: true }
    }

    if (!env.SESSION_PASSWORD) {
      console.error("SESSION_PASSWORD not configured but REQUIRE_SESSION_PASSWORD is true")
      return { success: false, error: "Password protection not configured" }
    }

    // Verify password
    if (password !== env.SESSION_PASSWORD) {
      return { success: false, error: "Invalid password" }
    }

    // Get current session to verify user is logged in
    const session = await auth.api.getSession({
      headers: await headers(),
    })

    if (!session) {
      return { success: false, error: "No active session" }
    }

    // Update session in database to mark as authenticated
    await db
      .update(sessions)
      .set({ sessionPasswordAuthenticated: true })
      .where(eq(sessions.id, session.session.id))

    return { success: true }
  } catch (error) {
    console.error("Error verifying session password:", error)
    return { success: false, error: "Verification failed" }
  }
}

/**
 * Check if session authentication is required and if user is authenticated
 *
 * Returns:
 * - requiresPassword: Whether password protection is enabled
 * - isAuthenticated: Whether the current session is authenticated
 */
export async function checkSessionAuth(): Promise<CheckAuthResult> {
  try {
    // Check if password protection is enabled
    if (!env.REQUIRE_SESSION_PASSWORD || !env.SESSION_PASSWORD) {
      return { requiresPassword: false, isAuthenticated: true }
    }

    // Get current session to verify user is logged in
    const session = await auth.api.getSession({
      headers: await headers(),
    })

    if (!session) {
      return { requiresPassword: true, isAuthenticated: false }
    }

    // Check authentication flag in database
    const dbSession = await db.query.sessions.findFirst({
      where: eq(sessions.id, session.session.id),
    })

    const isAuthenticated = dbSession?.sessionPasswordAuthenticated === true

    return { requiresPassword: true, isAuthenticated }
  } catch (error) {
    console.error("Error checking session auth:", error)
    return { requiresPassword: true, isAuthenticated: false }
  }
}
