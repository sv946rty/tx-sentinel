/**
 * Schema exports.
 *
 * All Zod schemas are exported from this file for consistent imports.
 * Schemas are used for:
 * - Server Action payload validation
 * - Agent input/output validation
 * - Tool input/output validation
 * - Database write validation
 */

// Agent schemas
export {
  questionInputSchema,
  agentPlanSchema,
  memoryExistenceCheckSchema,
  memoryDependencyDecisionSchema,
  memoryDecisionSchema,
  reasoningStepSchema,
  toolUsageSchema,
  retrievedMemorySchema,
  agentRunResultSchema,
  streamEventSchema,
} from "./agent"

export type {
  QuestionInput,
  AgentPlan,
  MemoryExistenceCheck,
  MemoryDependencyDecision,
  MemoryDecision,
  ReasoningStep,
  ToolUsage,
  RetrievedMemory,
  AgentRunResult,
  StreamEvent,
} from "./agent"

// Tool schemas
export {
  memoryRetrievalInputSchema,
  memoryRetrievalOutputSchema,
  resultPersistenceInputSchema,
  resultPersistenceOutputSchema,
  decisionInputSchema,
  decisionOutputSchema,
} from "./tools"

export type {
  MemoryRetrievalInput,
  MemoryRetrievalOutput,
  ResultPersistenceInput,
  ResultPersistenceOutput,
  DecisionInput,
  DecisionOutput,
} from "./tools"
