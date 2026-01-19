import {
  resultPersistenceInputSchema,
  resultPersistenceOutputSchema,
  type ResultPersistenceInput,
  type ResultPersistenceOutput,
} from "@/lib/schemas"
import { insertAgentRun } from "@/db/queries"

/**
 * Result Persistence Tool
 *
 * Persists a completed agent run to the database.
 * Called after the agent produces a final answer.
 *
 * This tool:
 * - Writes to DATABASE_SCHEMA
 * - Validates input with Zod
 * - Returns the created run ID
 */
export async function resultPersistenceTool(
  rawInput: unknown
): Promise<ResultPersistenceOutput> {
  // Validate input with Zod
  const input = resultPersistenceInputSchema.parse(rawInput)

  // Insert the agent run into the database
  const agentRun = await insertAgentRun({
    userId: input.userId,
    question: input.question,
    plan: input.plan,
    memoryDecision: input.memoryDecision,
    retrievedMemories: input.retrievedMemories,
    reasoningSteps: input.reasoningSteps,
    toolsUsed: input.toolsUsed,
    answer: input.answer,
  })

  const output: ResultPersistenceOutput = {
    runId: agentRun.id,
    persistedAt: agentRun.createdAt.toISOString(),
  }

  // Validate output before returning
  return resultPersistenceOutputSchema.parse(output)
}

/**
 * Type-safe wrapper that accepts validated input directly.
 */
export async function persistResult(
  input: ResultPersistenceInput
): Promise<ResultPersistenceOutput> {
  return resultPersistenceTool(input)
}
