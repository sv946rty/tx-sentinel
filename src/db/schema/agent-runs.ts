import {
  pgSchema,
  uuid,
  text,
  timestamp,
  jsonb,
} from "drizzle-orm/pg-core"
import { env } from "@/lib/env"

/**
 * Dynamic schema based on DATABASE_SCHEMA environment variable.
 * All application tables live in this schema, never in `public`.
 */
const schemaName = env.DATABASE_SCHEMA
export const appSchema = pgSchema(schemaName)

/**
 * Agent Runs Table
 *
 * Stores completed agent runs with full context for:
 * - Memory retrieval (searching prior Q&A)
 * - Audit trail (reasoning transparency)
 * - History display (sidebar)
 */
export const agentRuns = appSchema.table("agent_runs", {
  id: uuid("id").primaryKey().defaultRandom(),

  // User association (foreign key added after Better Auth setup in Phase 4)
  userId: text("user_id").notNull(),

  // The original question
  question: text("question").notNull(),

  // Agent's explicit plan
  plan: jsonb("plan").notNull().$type<{
    objective: string
    steps: Array<{
      step: number
      action: string
      reasoning: string
    }>
    requiresMemory: boolean
  }>(),

  // Memory decision (with existence check and dependency decision)
  memoryDecision: jsonb("memory_decision").notNull().$type<{
    existenceCheck: {
      similarQuestionExists: boolean
      existingRunId?: string
      existingQuestion?: string
      existingAnswer?: string
      searchQuery: string
      explanation: string
    }
    dependencyDecision: {
      requiresMemory: boolean
      reason: string
      contextNeeded?: string[]
      pronounResolution?: {
        hasPronouns: boolean
        pronounsFound?: string[]
        resolutionAttempted: boolean
        resolved?: boolean
        resolvedEntities?: Array<{
          pronoun: string
          resolvedTo: string
          confidence: number
        }>
        resolutionExplanation?: string
      }
    }
    shouldRetrieveMemory: boolean
    searchQuery?: string
  }>(),

  // Retrieved memories (if any)
  retrievedMemories: jsonb("retrieved_memories")
    .notNull()
    .default([])
    .$type<
      Array<{
        runId: string
        question: string
        answer: string
        createdAt: string
        relevanceScore?: number
      }>
    >(),

  // Reasoning steps (user-facing)
  reasoningSteps: jsonb("reasoning_steps")
    .notNull()
    .default([])
    .$type<
      Array<{
        step: number
        type:
          | "planning"
          | "memory_existence_check"
          | "memory_dependency_decision"
          | "pronoun_resolution"
          | "memory_retrieval"
          | "reasoning"
          | "generating_answer"
        description: string
        timestamp: string
      }>
    >(),

  // Tools used during execution
  toolsUsed: jsonb("tools_used")
    .notNull()
    .default([])
    .$type<
      Array<{
        toolName: "memory_retrieval" | "result_persistence" | "decision"
        invokedAt: string
        success: boolean
      }>
    >(),

  // Final answer
  answer: text("answer").notNull(),

  // Timestamps
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
})

/**
 * Type exports for use in application code.
 */
export type AgentRun = typeof agentRuns.$inferSelect
export type NewAgentRun = typeof agentRuns.$inferInsert
