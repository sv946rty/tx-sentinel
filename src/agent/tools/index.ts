/**
 * Agent Tools
 *
 * The agent has access to exactly THREE tools:
 *
 * 1. Memory Retrieval Tool
 *    - Reads from DATABASE_SCHEMA
 *    - Finds relevant prior questions/answers
 *
 * 2. Result Persistence Tool
 *    - Writes to DATABASE_SCHEMA
 *    - Stores completed agent runs
 *
 * 3. Structured Decision Tool (Internal)
 *    - Makes explicit, auditable decisions
 *    - Used when the agent needs to choose between options
 *
 * The agent MUST NOT:
 * - Call external APIs
 * - Perform web browsing
 * - Execute arbitrary code
 * - Use Supabase HTTP APIs
 */

export { memoryRetrievalTool, retrieveMemory } from "./memory-retrieval"
export { resultPersistenceTool, persistResult } from "./result-persistence"
export { decisionTool, makeDecision } from "./decision"
