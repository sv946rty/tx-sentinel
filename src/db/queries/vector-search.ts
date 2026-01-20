import { db } from "@/db"
import { agentRuns } from "@/db/schema"
import { eq, and, sql, isNotNull } from "drizzle-orm"
import { generateEmbedding } from "@/lib/embeddings"

export interface VectorSearchResult {
  id: string
  question: string
  answer: string
  createdAt: Date
  similarity: number
}

/**
 * Vector similarity search using pgvector.
 * Uses cosine distance (1 - cosine similarity) for ranking.
 *
 * This is the core semantic search function that enables:
 * - Finding "wife" when searching for "spouse"
 * - Matching paraphrased questions
 * - Understanding synonyms and related concepts
 */
export async function searchByVector(
  userId: string,
  query: string,
  options: {
    limit?: number
    similarityThreshold?: number
  } = {}
): Promise<VectorSearchResult[]> {
  const { limit = 5, similarityThreshold = 0.7 } = options

  // Generate embedding for query
  const queryEmbedding = await generateEmbedding(query)

  // Vector similarity search using pgvector <=> operator (cosine distance)
  // <=> calculates cosine distance, so we use 1 - distance to get similarity
  const results = await db
    .select({
      id: agentRuns.id,
      question: agentRuns.question,
      answer: agentRuns.answer,
      createdAt: agentRuns.createdAt,
      // Calculate similarity (1 - cosine distance)
      // Cast to numeric to ensure proper type handling
      similarity: sql<number>`(1 - (${agentRuns.questionEmbedding} <=> ${sql`${JSON.stringify(queryEmbedding.embedding)}::vector`}))::numeric`,
    })
    .from(agentRuns)
    .where(
      and(
        eq(agentRuns.userId, userId),
        // Only search records that have embeddings
        isNotNull(agentRuns.questionEmbedding)
      )
    )
    // Order by cosine distance (ascending = most similar first)
    .orderBy(
      sql`${agentRuns.questionEmbedding} <=> ${sql`${JSON.stringify(queryEmbedding.embedding)}::vector`}`
    )
    .limit(limit)

  // Filter by similarity threshold and convert to number
  return results
    .filter((r) => Number(r.similarity) >= similarityThreshold)
    .map((r) => ({
      ...r,
      similarity: Number(r.similarity),
    }))
}

/**
 * Find exact or near-exact matches using very high similarity threshold.
 * Used for detecting duplicate questions.
 */
export async function findDuplicateQuestion(
  userId: string,
  question: string
): Promise<VectorSearchResult | null> {
  const results = await searchByVector(userId, question, {
    limit: 1,
    similarityThreshold: 0.95, // Very high threshold for duplicates
  })

  return results[0] || null
}
