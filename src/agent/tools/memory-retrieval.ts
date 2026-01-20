import {
  memoryRetrievalInputSchema,
  memoryRetrievalOutputSchema,
  type MemoryRetrievalInput,
  type MemoryRetrievalOutput,
} from "@/lib/schemas"
import { searchMemory } from "@/db/queries"
import { searchByVector } from "@/db/queries/vector-search"

/**
 * Memory Retrieval Tool
 *
 * Searches the database for relevant prior questions and answers.
 * Uses HYBRID SEARCH: vector similarity (primary) with text fallback.
 *
 * This tool:
 * - Reads from DATABASE_SCHEMA
 * - Validates input and output with Zod
 * - Returns matching prior Q&A pairs with relevance scores
 */
export async function memoryRetrievalTool(
  rawInput: unknown
): Promise<MemoryRetrievalOutput> {
  // Validate input with Zod
  const input = memoryRetrievalInputSchema.parse(rawInput)

  // Try vector search first (semantic similarity)
  const vectorResults = await searchByVector(input.userId, input.query, {
    limit: input.limit,
    similarityThreshold: 0.6, // Lower threshold for context retrieval
  })

  let memories
  let searchMethod: 'vector_similarity' | 'text_search'

  if (vectorResults.length > 0) {
    // Use vector search results
    memories = vectorResults.map(r => ({
      runId: r.id,
      question: r.question,
      answer: r.answer,
      createdAt: r.createdAt.toISOString(),
      relevanceScore: r.similarity,
    }))
    searchMethod = 'vector_similarity'
  } else {
    // Fallback to text search for records without embeddings
    memories = await searchMemory({
      userId: input.userId,
      query: input.query,
      limit: input.limit,
    })
    searchMethod = 'text_search'
  }

  const output: MemoryRetrievalOutput = {
    memories,
    searchedAt: new Date().toISOString(),
    searchMethod,
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
