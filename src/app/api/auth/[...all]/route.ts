import { auth } from "@/lib/auth"
import { toNextJsHandler } from "better-auth/next-js"

/**
 * Better Auth API Route Handler
 *
 * Handles all authentication requests:
 * - OAuth callbacks (Google, GitHub)
 * - Session management
 * - Sign out
 *
 * Mounted at: /api/auth/[...all]
 */
export const { GET, POST } = toNextJsHandler(auth)
