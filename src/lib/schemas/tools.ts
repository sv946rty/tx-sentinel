import { z } from "zod"
import { retrievedMemorySchema } from "./agent"

/**
 * Memory Retrieval Tool
 *
 * Reads from DATABASE_SCHEMA to find relevant prior questions/answers.
 * Used when the agent decides memory may be helpful.
 */

export const memoryRetrievalInputSchema = z.object({
  userId: z.string().describe("The user ID to search memory for"),
  query: z
    .string()
    .min(1)
    .max(500)
    .describe("Search query derived from the current question"),
  limit: z
    .number()
    .int()
    .min(1)
    .max(10)
    .default(5)
    .describe("Maximum number of memories to retrieve"),
})

export type MemoryRetrievalInput = z.infer<typeof memoryRetrievalInputSchema>

export const memoryRetrievalOutputSchema = z.object({
  memories: z.array(retrievedMemorySchema),
  searchedAt: z.string().datetime(),
  searchMethod: z.enum(["vector_similarity", "text_search"]).optional().describe("Search method used"),
})

export type MemoryRetrievalOutput = z.infer<typeof memoryRetrievalOutputSchema>

/**
 * Result Persistence Tool
 *
 * Writes the completed agent run to DATABASE_SCHEMA.
 * Called after the agent produces a final answer.
 */

export const resultPersistenceInputSchema = z.object({
  userId: z.string(),
  question: z.string(),
  plan: z.object({
    objective: z.string(),
    steps: z.array(
      z.object({
        step: z.number(),
        action: z.string(),
        reasoning: z.string(),
      })
    ),
    requiresMemory: z.boolean(),
  }),
  memoryDecision: z.object({
    existenceCheck: z.object({
      similarQuestionExists: z.boolean(),
      existingRunId: z.string().uuid().optional(),
      existingQuestion: z.string().optional(),
      existingAnswer: z.string().optional(),
      searchQuery: z.string(),
      explanation: z.string(),
    }),
    dependencyDecision: z.object({
      requiresMemory: z.boolean(),
      reason: z.string(),
      contextNeeded: z.array(z.string()).optional(),
      pronounResolution: z.object({
        hasPronouns: z.boolean(),
        pronounsFound: z.array(z.string()).optional(),
        resolutionAttempted: z.boolean(),
        resolved: z.boolean().optional(),
        resolvedEntities: z.array(z.object({
          pronoun: z.string(),
          resolvedTo: z.string(),
          confidence: z.number().min(0).max(1),
        })).optional(),
        resolutionExplanation: z.string().optional(),
      }).optional(),
    }),
    shouldRetrieveMemory: z.boolean(),
    searchQuery: z.string().optional(),
  }),
  retrievedMemories: z.array(
    z.object({
      runId: z.string().uuid(),
      question: z.string(),
      answer: z.string(),
      createdAt: z.string().datetime(),
      relevanceScore: z.number().optional(),
    })
  ),
  reasoningSteps: z.array(
    z.object({
      step: z.number(),
      type: z.enum([
        "planning",
        "memory_existence_check",
        "memory_dependency_decision",
        "pronoun_resolution",
        "memory_retrieval",
        "reasoning",
        "generating_answer",
      ]),
      description: z.string(),
      timestamp: z.string().datetime(),
    })
  ),
  toolsUsed: z.array(
    z.object({
      toolName: z.enum(["memory_retrieval", "result_persistence", "decision"]),
      invokedAt: z.string().datetime(),
      success: z.boolean(),
    })
  ),
  answer: z.string(),
})

export type ResultPersistenceInput = z.infer<typeof resultPersistenceInputSchema>

export const resultPersistenceOutputSchema = z.object({
  runId: z.string().uuid(),
  persistedAt: z.string().datetime(),
})

export type ResultPersistenceOutput = z.infer<
  typeof resultPersistenceOutputSchema
>

/**
 * Structured Decision Tool (Internal)
 *
 * Used when the agent needs to make an explicit decision.
 * For example: deciding whether memory is relevant.
 */

export const decisionInputSchema = z.object({
  context: z.string().describe("The context for the decision"),
  question: z.string().describe("The decision question"),
  options: z
    .array(z.string())
    .min(2)
    .max(5)
    .describe("Available options to choose from"),
})

export type DecisionInput = z.infer<typeof decisionInputSchema>

export const decisionOutputSchema = z.object({
  selectedOption: z.string(),
  confidence: z.number().min(0).max(1),
  reasoning: z.string().describe("Explanation for the decision"),
})

export type DecisionOutput = z.infer<typeof decisionOutputSchema>
