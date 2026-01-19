import {
  memoryRetrievalInputSchema,
  memoryRetrievalOutputSchema,
  type MemoryRetrievalInput,
  type MemoryRetrievalOutput,
} from "@/lib/schemas"
import { searchMemory } from "@/db/queries"

/**
 * Memory Retrieval Tool
 *
 * Searches the database for relevant prior questions and answers.
 * Uses text similarity to find related memories.
 *
 * This tool:
 * - Reads from DATABASE_SCHEMA
 * - Validates input and output with Zod
 * - Returns matching prior Q&A pairs
 */
export async function memoryRetrievalTool(
  rawInput: unknown
): Promise<MemoryRetrievalOutput> {
  // Validate input with Zod
  const input = memoryRetrievalInputSchema.parse(rawInput)

  // Search for similar questions in the database
  const memories = await searchMemory({
    userId: input.userId,
    query: input.query,
    limit: input.limit,
  })

  const output: MemoryRetrievalOutput = {
    memories,
    searchedAt: new Date().toISOString(),
  }

  // Validate output before returning
  return memoryRetrievalOutputSchema.parse(output)
}

/**
 * Type-safe wrapper that accepts validated input directly.
 */
export async function retrieveMemory(
  input: MemoryRetrievalInput
): Promise<MemoryRetrievalOutput> {
  return memoryRetrievalTool(input)
}
