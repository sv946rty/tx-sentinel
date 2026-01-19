"use server"

import { questionInputSchema } from "@/lib/schemas"
import {
  getAgentRunByIdForUser,
  listAgentRunsForUser,
  deleteAgentRunForUser,
  deleteAllAgentRunsForUser,
} from "@/db/queries"
import { requireAuth } from "@/lib/auth/session"

/**
 * Server Action: Submit Question
 *
 * Validates input, creates an agent run, and returns a runId.
 * The actual agent execution happens via the streaming API route.
 *
 * Requires authentication.
 */
export async function submitQuestion(rawInput: unknown): Promise<{
  success: boolean
  runId?: string
  error?: string
}> {
  try {
    // Require authenticated user
    const session = await requireAuth()
    const _userId = session.user.id

    // Validate input with Zod - ensures question is valid before streaming
    const _input = questionInputSchema.parse(rawInput)

    // Generate a run ID - the actual run will be created during streaming
    // This allows us to return immediately while the agent executes
    const runId = crypto.randomUUID()

    // The question and userId will be passed to the streaming endpoint
    // which will execute the agent and persist the result
    return {
      success: true,
      runId,
    }
  } catch (error) {
    if (error instanceof Error) {
      return {
        success: false,
        error: error.message,
      }
    }
    return {
      success: false,
      error: "An unexpected error occurred",
    }
  }
}

/**
 * Server Action: Get Agent Run
 *
 * Fetches a completed agent run by ID.
 * Used to display prior questions in the sidebar.
 *
 * Requires authentication. Only returns runs owned by the authenticated user.
 */
export async function getAgentRun(runId: string): Promise<{
  success: boolean
  data?: {
    id: string
    question: string
    answer: string
    createdAt: string
  }
  error?: string
}> {
  try {
    // Require authenticated user
    const session = await requireAuth()
    const userId = session.user.id

    const run = await getAgentRunByIdForUser(runId, userId)

    if (!run) {
      return {
        success: false,
        error: "Agent run not found",
      }
    }

    return {
      success: true,
      data: {
        id: run.id,
        question: run.question,
        answer: run.answer,
        createdAt: run.createdAt.toISOString(),
      },
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    }
  }
}

/**
 * Server Action: List Agent Runs
 *
 * Fetches paginated list of agent runs for the authenticated user.
 * Used to populate the sidebar memory panel.
 *
 * Requires authentication.
 */
export async function listAgentRuns(options: {
  page?: number
  limit?: number
  search?: string
}): Promise<{
  success: boolean
  data?: {
    runs: Array<{
      id: string
      question: string
      createdAt: string
    }>
    total: number
    page: number
    totalPages: number
  }
  error?: string
}> {
  try {
    // Require authenticated user
    const session = await requireAuth()
    const userId = session.user.id

    const result = await listAgentRunsForUser({
      userId,
      page: options.page,
      limit: options.limit ?? 10,
      search: options.search,
    })

    return {
      success: true,
      data: {
        runs: result.runs.map((run) => ({
          id: run.id,
          question: run.question,
          createdAt: run.createdAt.toISOString(),
        })),
        total: result.total,
        page: result.page,
        totalPages: result.totalPages,
      },
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    }
  }
}

/**
 * Server Action: Delete Agent Run
 *
 * Deletes an agent run by ID for the authenticated user.
 * Returns success if deleted, error if not found or unauthorized.
 *
 * Requires authentication.
 */
export async function deleteAgentRun(runId: string): Promise<{
  success: boolean
  error?: string
}> {
  try {
    // Require authenticated user
    const session = await requireAuth()
    const userId = session.user.id

    const deleted = await deleteAgentRunForUser(runId, userId)

    if (!deleted) {
      return {
        success: false,
        error: "Agent run not found or already deleted",
      }
    }

    return { success: true }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    }
  }
}

/**
 * Server Action: Delete All Agent Runs
 *
 * Deletes ALL agent runs for the authenticated user.
 * Returns the number of runs deleted.
 *
 * Requires authentication.
 */
export async function deleteAllAgentRuns(): Promise<{
  success: boolean
  count?: number
  error?: string
}> {
  try {
    // Require authenticated user
    const session = await requireAuth()
    const userId = session.user.id

    const count = await deleteAllAgentRunsForUser(userId)

    return { success: true, count }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    }
  }
}
