import { db } from "@/db"
import { agentRuns, type NewAgentRun, type AgentRun } from "@/db/schema"
import { eq, desc, ilike, and, sql } from "drizzle-orm"
import { generateEmbedding } from "@/lib/embeddings"

/**
 * Insert a new agent run into the database.
 * Automatically generates vector embedding for semantic search.
 */
export async function insertAgentRun(data: NewAgentRun): Promise<AgentRun> {
  // Generate embedding for the question
  const embeddingResult = await generateEmbedding(data.question)

  const [result] = await db
    .insert(agentRuns)
    .values({
      ...data,
      questionEmbedding: embeddingResult.embedding,
      embeddingModel: embeddingResult.model,
    })
    .returning()

  return result
}

/**
 * Get an agent run by ID.
 */
export async function getAgentRunById(
  id: string
): Promise<AgentRun | undefined> {
  const [result] = await db
    .select()
    .from(agentRuns)
    .where(eq(agentRuns.id, id))
    .limit(1)

  return result
}

/**
 * Get agent run by ID for a specific user (security check).
 */
export async function getAgentRunByIdForUser(
  id: string,
  userId: string
): Promise<AgentRun | undefined> {
  const [result] = await db
    .select()
    .from(agentRuns)
    .where(and(eq(agentRuns.id, id), eq(agentRuns.userId, userId)))
    .limit(1)

  return result
}

/**
 * List agent runs for a user with pagination.
 */
export async function listAgentRunsForUser(options: {
  userId: string
  page?: number
  limit?: number
  search?: string
}): Promise<{
  runs: AgentRun[]
  total: number
  page: number
  totalPages: number
}> {
  const { userId, page = 1, limit = 10, search } = options
  const offset = (page - 1) * limit

  // Build where conditions
  const whereConditions = search
    ? and(eq(agentRuns.userId, userId), ilike(agentRuns.question, `%${search}%`))
    : eq(agentRuns.userId, userId)

  // Execute queries in parallel
  const [runs, countResult] = await Promise.all([
    db
      .select()
      .from(agentRuns)
      .where(whereConditions)
      .orderBy(desc(agentRuns.createdAt))
      .limit(limit)
      .offset(offset),
    db
      .select({ count: sql<number>`count(*)::int` })
      .from(agentRuns)
      .where(whereConditions),
  ])

  const total = countResult[0]?.count ?? 0
  const totalPages = Math.ceil(total / limit)

  return {
    runs,
    total,
    page,
    totalPages,
  }
}

/**
 * Search for similar questions in memory.
 * Uses simple text matching for now.
 * Could be enhanced with vector similarity in the future.
 */
export async function searchMemory(options: {
  userId: string
  query: string
  limit?: number
}): Promise<
  Array<{
    runId: string
    question: string
    answer: string
    createdAt: string
    relevanceScore: number
  }>
> {
  const { userId, query, limit = 5 } = options

  // Simple text similarity search using ILIKE
  // In production, this could use pg_trgm or vector embeddings
  const results = await db
    .select({
      id: agentRuns.id,
      question: agentRuns.question,
      answer: agentRuns.answer,
      createdAt: agentRuns.createdAt,
    })
    .from(agentRuns)
    .where(
      and(eq(agentRuns.userId, userId), ilike(agentRuns.question, `%${query}%`))
    )
    .orderBy(desc(agentRuns.createdAt))
    .limit(limit)

  // Map to expected format with placeholder relevance score
  return results.map((row) => ({
    runId: row.id,
    question: row.question,
    answer: row.answer,
    createdAt: row.createdAt.toISOString(),
    relevanceScore: 0.5, // Placeholder - would be actual similarity score
  }))
}

/**
 * Get recent questions for a user (for context in agent reasoning).
 */
export async function getRecentQuestionsForUser(
  userId: string,
  limit: number = 5
): Promise<Array<{ question: string; answer: string; createdAt: Date }>> {
  const results = await db
    .select({
      question: agentRuns.question,
      answer: agentRuns.answer,
      createdAt: agentRuns.createdAt,
    })
    .from(agentRuns)
    .where(eq(agentRuns.userId, userId))
    .orderBy(desc(agentRuns.createdAt))
    .limit(limit)

  return results
}

/**
 * Delete an agent run by ID for a specific user.
 * Returns true if deleted, false if not found.
 */
export async function deleteAgentRunForUser(
  id: string,
  userId: string
): Promise<boolean> {
  const result = await db
    .delete(agentRuns)
    .where(and(eq(agentRuns.id, id), eq(agentRuns.userId, userId)))
    .returning({ id: agentRuns.id })

  return result.length > 0
}

/**
 * Delete ALL agent runs for a specific user.
 * Returns the number of runs deleted.
 */
export async function deleteAllAgentRunsForUser(
  userId: string
): Promise<number> {
  const result = await db
    .delete(agentRuns)
    .where(eq(agentRuns.userId, userId))
    .returning({ id: agentRuns.id })

  return result.length
}
