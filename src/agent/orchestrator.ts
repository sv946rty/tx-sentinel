import type {
  QuestionInput,
  AgentPlan,
  MemoryDecision,
  MemoryExistenceCheck,
  MemoryDependencyDecision,
  ReasoningStep,
  ToolUsage,
  RetrievedMemory,
  StreamEvent,
} from "@/lib/schemas"
import {
  generatePlan,
  checkMemoryExistence,
  makeMemoryDependencyDecision,
  performReasoningLoop,
  generateAnswerStream,
} from "./steps"
import { retrieveMemory } from "./tools"
import { validateMemoryDecisions, formatValidationResult } from "./validation"

/**
 * Agent Run State
 *
 * Tracks the complete state of an agent run.
 * This is mutable during execution and becomes immutable after completion.
 */
export interface AgentRunState {
  userId: string
  question: string
  plan: AgentPlan | null
  memoryDecision: MemoryDecision | null
  retrievedMemories: RetrievedMemory[]
  reasoningSteps: ReasoningStep[]
  toolsUsed: ToolUsage[]
  answer: string | null
  status: "pending" | "planning" | "executing" | "completed" | "error"
  error: string | null
}

/**
 * Create initial agent run state.
 */
export function createAgentRunState(
  userId: string,
  question: string
): AgentRunState {
  return {
    userId,
    question,
    plan: null,
    memoryDecision: null,
    retrievedMemories: [],
    reasoningSteps: [],
    toolsUsed: [],
    answer: null,
    status: "pending",
    error: null,
  }
}

/**
 * Stream callback type.
 * Used to send events to the client during execution.
 */
export type StreamCallback = (event: StreamEvent) => void

/**
 * Answer chunk callback type.
 * Used to stream answer content to the client.
 */
export type AnswerChunkCallback = (chunk: string) => void

/**
 * Agent Orchestrator
 *
 * The SINGLE agent that demonstrates:
 * - Explicit planning
 * - Explicit tool usage
 * - Supabase-backed memory
 * - An explicit iterative reasoning loop (at least one iteration)
 *
 * Agent behavior is implemented directly in this code.
 * Agent logic is NOT hidden inside third-party abstractions.
 */
export async function runAgent(
  input: QuestionInput,
  userId: string,
  onStream?: StreamCallback,
  onAnswerChunk?: AnswerChunkCallback
): Promise<AgentRunState> {
  const state = createAgentRunState(userId, input.question)

  try {
    // =========================================
    // STEP 1: Planning
    // =========================================
    state.status = "planning"
    emitReasoningStep(
      state,
      onStream,
      "planning",
      "Analyzing your question and creating a plan..."
    )

    const plan = await generatePlan(input.question)
    state.plan = plan

    emitReasoningStep(
      state,
      onStream,
      "planning",
      `Plan created: ${plan.objective}`
    )

    // =========================================
    // STEP 2: Memory Existence Check
    // =========================================
    emitReasoningStep(
      state,
      onStream,
      "memory_existence_check",
      "Checking if a similar question was asked before..."
    )

    const existenceCheck = await checkMemoryExistence(userId, input.question)

    // Emit existence check result
    if (existenceCheck.similarQuestionExists) {
      emitReasoningStep(
        state,
        onStream,
        "memory_existence_check",
        `Similar question found: "${existenceCheck.existingQuestion?.substring(0, 80)}${(existenceCheck.existingQuestion?.length ?? 0) > 80 ? "..." : ""}"`
      )
    } else {
      emitReasoningStep(
        state,
        onStream,
        "memory_existence_check",
        "No similar question found. This appears to be a new question."
      )
    }

    // =========================================
    // STEP 3: Memory Dependency Decision
    // =========================================
    emitReasoningStep(
      state,
      onStream,
      "memory_dependency_decision",
      "Deciding whether prior context is required for reasoning..."
    )

    const dependencyDecision = await makeMemoryDependencyDecision(
      userId,
      input.question,
      existenceCheck,
      plan.requiresMemory
    )

    // Validate memory decisions to prevent reasoning correctness bugs
    const validationResult = validateMemoryDecisions(existenceCheck, dependencyDecision)
    if (!validationResult.valid) {
      console.error("Memory decision validation failed:", formatValidationResult(validationResult))
      throw new Error(`Memory decision validation failed: ${validationResult.errors.join(", ")}`)
    }
    if (validationResult.warnings.length > 0) {
      console.warn("Memory decision warnings:", formatValidationResult(validationResult))
    }

    // Emit pronoun resolution if applicable and build resolved question
    let resolvedQuestion: string | undefined
    if (dependencyDecision.pronounResolution?.hasPronouns) {
      const resolution = dependencyDecision.pronounResolution
      if (resolution.resolved && resolution.resolvedEntities && resolution.resolvedEntities.length > 0) {
        const entities = resolution.resolvedEntities
          .map(e => `"${e.pronoun}" → "${e.resolvedTo}"`)
          .join(", ")
        emitReasoningStep(
          state,
          onStream,
          "pronoun_resolution",
          `Resolved references: ${entities}`
        )

        // Build resolved question by replacing pronouns with their resolved entities
        resolvedQuestion = input.question
        for (const entity of resolution.resolvedEntities) {
          // Replace pronoun with resolved entity (case-insensitive)
          const pronounRegex = new RegExp(`\\b${entity.pronoun}\\b`, 'gi')
          resolvedQuestion = resolvedQuestion.replace(pronounRegex, entity.resolvedTo)
        }
      } else if (resolution.resolutionAttempted && !resolution.resolved) {
        emitReasoningStep(
          state,
          onStream,
          "pronoun_resolution",
          `Could not resolve all references: ${resolution.resolutionExplanation}`
        )
      }
    }

    // Emit dependency decision result with clear reasoning
    if (existenceCheck.similarQuestionExists && !dependencyDecision.requiresMemory) {
      emitReasoningStep(
        state,
        onStream,
        "memory_dependency_decision",
        `This question was asked previously. Prior context is not required, so the existing answer will be reused.`
      )
    } else if (existenceCheck.similarQuestionExists && dependencyDecision.requiresMemory) {
      emitReasoningStep(
        state,
        onStream,
        "memory_dependency_decision",
        `Using prior context from a previous question to answer: ${dependencyDecision.reason}`
      )
    } else if (!existenceCheck.similarQuestionExists && !dependencyDecision.requiresMemory) {
      emitReasoningStep(
        state,
        onStream,
        "memory_dependency_decision",
        `No prior memory found. This is a self-contained question.`
      )
    } else {
      // !existenceCheck.similarQuestionExists && dependencyDecision.requiresMemory
      emitReasoningStep(
        state,
        onStream,
        "memory_dependency_decision",
        `No prior memory found. Answering from scratch with available context: ${dependencyDecision.reason}`
      )
    }

    // Combine existence check and dependency decision into full memoryDecision
    const memoryDecision: MemoryDecision = {
      existenceCheck,
      dependencyDecision,
      shouldRetrieveMemory: dependencyDecision.requiresMemory,
      searchQuery: dependencyDecision.requiresMemory ? existenceCheck.searchQuery : undefined,
    }
    state.memoryDecision = memoryDecision

    // If similar question exists, add it to retrieved memories
    if (existenceCheck.similarQuestionExists && existenceCheck.existingRunId) {
      state.retrievedMemories.push({
        runId: existenceCheck.existingRunId,
        question: existenceCheck.existingQuestion!,
        answer: existenceCheck.existingAnswer!,
        createdAt: new Date().toISOString(), // Would come from DB in real scenario
        relevanceScore: 1.0, // Exact match
      })
    }

    // =========================================
    // STEP 3.5: Re-check memory with resolved question
    // =========================================
    // If pronouns were resolved, check if we have a stored answer for the RESOLVED question
    // Example: "How big is it?" resolves to "How big is Yosemite National Park?"
    // We should check if we've answered "How big is Yosemite National Park?" before
    let resolvedQuestionMemory: MemoryExistenceCheck | undefined
    if (resolvedQuestion && resolvedQuestion !== input.question) {
      emitReasoningStep(
        state,
        onStream,
        "memory_existence_check",
        `Checking if resolved question was asked before: "${resolvedQuestion.substring(0, 80)}${resolvedQuestion.length > 80 ? "..." : ""}"`
      )

      resolvedQuestionMemory = await checkMemoryExistence(userId, resolvedQuestion)

      if (resolvedQuestionMemory.similarQuestionExists && resolvedQuestionMemory.existingAnswer) {
        emitReasoningStep(
          state,
          onStream,
          "memory_existence_check",
          `Found stored answer for resolved question!`
        )

        // Add the resolved question's answer to retrieved memories
        if (resolvedQuestionMemory.existingRunId) {
          state.retrievedMemories.push({
            runId: resolvedQuestionMemory.existingRunId,
            question: resolvedQuestionMemory.existingQuestion!,
            answer: resolvedQuestionMemory.existingAnswer!,
            createdAt: new Date().toISOString(),
            relevanceScore: 1.0,
          })
        }
      }
    }

    // =========================================
    // STEP 4: Memory Retrieval (if additional context needed)
    // =========================================
    if (memoryDecision.shouldRetrieveMemory && memoryDecision.searchQuery) {
      emitReasoningStep(
        state,
        onStream,
        "memory_retrieval",
        "Retrieving additional relevant context from memory..."
      )

      const memoryResult = await retrieveMemory({
        userId,
        query: memoryDecision.searchQuery,
        limit: 5,
      })

      // Add any additional memories not already included
      const existingIds = new Set(state.retrievedMemories.map(m => m.runId))
      const newMemories = memoryResult.memories.filter(m => !existingIds.has(m.runId))
      state.retrievedMemories.push(...newMemories)

      state.toolsUsed.push({
        toolName: "memory_retrieval",
        invokedAt: memoryResult.searchedAt,
        success: true,
      })

      if (newMemories.length > 0) {
        emitReasoningStep(
          state,
          onStream,
          "memory_retrieval",
          `Found ${newMemories.length} additional relevant question(s)`
        )
      } else {
        emitReasoningStep(
          state,
          onStream,
          "memory_retrieval",
          "No additional relevant context found"
        )
      }
    }

    // =========================================
    // STEP 5: Check if we can reuse existing answer
    // =========================================
    // We can reuse a stored answer in three scenarios:
    // 1. Similar question exists AND no additional memory needed (simple case)
    // 2. Pronouns were resolved AND we have a stored answer for the resolved question
    // 3. Direct repetition with pronouns (resolved question was answered before)

    let answerToReuse: string | undefined

    // Scenario 1: Direct match, no memory needed
    if (existenceCheck.similarQuestionExists &&
        !dependencyDecision.requiresMemory &&
        existenceCheck.existingAnswer) {
      answerToReuse = existenceCheck.existingAnswer
    }

    // Scenario 2 & 3: Pronouns resolved and we have the resolved question's answer
    if (!answerToReuse &&
        resolvedQuestionMemory?.similarQuestionExists &&
        resolvedQuestionMemory.existingAnswer) {
      answerToReuse = resolvedQuestionMemory.existingAnswer
    }

    if (answerToReuse) {
      emitReasoningStep(
        state,
        onStream,
        "generating_answer",
        "Retrieving stored answer from previous question..."
      )

      // Stream the existing answer as if it's being generated
      // This provides a consistent UX
      state.answer = answerToReuse

      // Stream the answer in chunks for consistent UX
      if (onAnswerChunk || onStream) {
        const chunkSize = 10 // characters per chunk
        for (let i = 0; i < answerToReuse.length; i += chunkSize) {
          const chunk = answerToReuse.slice(i, i + chunkSize)
          if (onAnswerChunk) {
            onAnswerChunk(chunk)
          }
          if (onStream) {
            onStream({
              type: "answer_chunk",
              data: { chunk },
            })
          }
          // Small delay to simulate streaming
          await new Promise(resolve => setTimeout(resolve, 20))
        }
      }

      state.status = "completed"
      return state
    }

    // =========================================
    // STEP 6: Iterative Reasoning Loop
    // =========================================
    state.status = "executing"
    emitReasoningStep(
      state,
      onStream,
      "reasoning",
      "Processing and reasoning about your question..."
    )

    // Build resolved context string from pronoun resolution
    let resolvedContext: string | undefined
    if (dependencyDecision.pronounResolution?.resolved &&
        dependencyDecision.pronounResolution.resolvedEntities &&
        dependencyDecision.pronounResolution.resolvedEntities.length > 0) {
      const entities = dependencyDecision.pronounResolution.resolvedEntities
        .map(e => `"${e.pronoun}" refers to "${e.resolvedTo}"`)
        .join(", ")
      resolvedContext = `The following pronouns/references have been resolved: ${entities}. Use this information to understand what the question is asking about.`
    }

    const reasoningResult = await performReasoningLoop(
      input.question,
      plan,
      state.retrievedMemories,
      resolvedContext
    )

    emitReasoningStep(
      state,
      onStream,
      "reasoning",
      `Completed ${reasoningResult.iterations} reasoning iteration(s) with ${Math.round(reasoningResult.finalConfidence * 100)}% confidence`
    )

    // =========================================
    // STEP 7: Generate Final Answer
    // =========================================
    emitReasoningStep(
      state,
      onStream,
      "generating_answer",
      "Generating final answer..."
    )

    const answerStream = await generateAnswerStream(
      input.question,
      plan,
      state.retrievedMemories,
      reasoningResult.allThoughts,
      resolvedContext
    )

    // Collect answer and stream chunks
    const answerChunks: string[] = []
    for await (const chunk of answerStream) {
      answerChunks.push(chunk)
      if (onAnswerChunk) {
        onAnswerChunk(chunk)
      }
      if (onStream) {
        onStream({
          type: "answer_chunk",
          data: { chunk },
        })
      }
    }

    state.answer = answerChunks.join("")
    state.status = "completed"

    return state
  } catch (error) {
    state.status = "error"
    state.error = error instanceof Error ? error.message : "Unknown error"

    if (onStream) {
      onStream({
        type: "error",
        data: { message: state.error },
      })
    }

    return state
  }
}

/**
 * Helper to emit a reasoning step and track it in state.
 */
function emitReasoningStep(
  state: AgentRunState,
  onStream: StreamCallback | undefined,
  type: ReasoningStep["type"],
  description: string
): void {
  const step: ReasoningStep = {
    step: state.reasoningSteps.length + 1,
    type,
    description,
    timestamp: new Date().toISOString(),
  }

  state.reasoningSteps.push(step)

  if (onStream) {
    onStream({
      type: "reasoning_step",
      data: step,
    })
  }
}
