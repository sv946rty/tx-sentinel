/**
 * Agent Module
 *
 * This module contains the SINGLE AI agent implementation.
 *
 * Key exports:
 * - runAgent: The main orchestrator function
 * - AgentRunState: The state tracked during execution
 * - Tools: memory retrieval, result persistence, decision
 */

export {
  runAgent,
  createAgentRunState,
  type AgentRunState,
  type StreamCallback,
  type AnswerChunkCallback,
} from "./orchestrator"

// Re-export tools for direct access if needed
export * from "./tools"
