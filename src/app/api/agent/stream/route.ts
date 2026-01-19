import { NextRequest } from "next/server"
import { z } from "zod"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { runAgent } from "@/agent"
import { persistResult } from "@/agent/tools"
import type { StreamEvent } from "@/lib/schemas"

/**
 * Request body schema for the streaming endpoint.
 */
const streamRequestSchema = z.object({
  question: z.string().min(1).max(2000),
})

/**
 * Streaming API Route
 *
 * Route: POST /api/agent/stream
 *
 * This is the ONLY API route used for streaming.
 * It executes the agent and streams:
 * - Reasoning timeline steps
 * - Answer chunks
 * - Completion/error events
 *
 * The route is read-only from the client's perspective,
 * but internally persists the completed run to the database.
 */
export async function POST(request: NextRequest) {
  try {
    // Authenticate the request
    const session = await auth.api.getSession({
      headers: await headers(),
    })

    if (!session?.user?.id) {
      return new Response(JSON.stringify({ error: "Authentication required" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      })
    }

    const userId = session.user.id

    // Parse and validate request body
    const body = await request.json()
    const parsed = streamRequestSchema.safeParse(body)

    if (!parsed.success) {
      return new Response(
        JSON.stringify({ error: "Invalid request", details: parsed.error.flatten() }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      )
    }

    const { question } = parsed.data

    // Create a ReadableStream for SSE
    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder()

        // Helper to send SSE events
        const sendEvent = (event: StreamEvent) => {
          const data = `data: ${JSON.stringify(event)}\n\n`
          controller.enqueue(encoder.encode(data))
        }

        try {
          // Run the agent with streaming callbacks
          const state = await runAgent(
            { question },
            userId,
            (event) => {
              sendEvent(event)
            }
          )

          // Persist the completed run
          if (state.status === "completed" && state.plan && state.memoryDecision && state.answer) {
            const persistResult$ = await persistResult({
              userId,
              question: state.question,
              plan: state.plan,
              memoryDecision: state.memoryDecision,
              retrievedMemories: state.retrievedMemories,
              reasoningSteps: state.reasoningSteps,
              toolsUsed: state.toolsUsed,
              answer: state.answer,
            })

            // Send completion event with the persisted run ID
            sendEvent({
              type: "complete",
              data: { runId: persistResult$.runId },
            })
          }
        } catch (error) {
          // Send error event
          sendEvent({
            type: "error",
            data: {
              message: error instanceof Error ? error.message : "Unknown error",
            },
          })
        } finally {
          controller.close()
        }
      },
    })

    // Return SSE response
    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    })
  } catch (error) {
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Internal server error",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    )
  }
}
