import OpenAI from "openai"
import { env } from "@/lib/env"

/**
 * OpenAI Client
 *
 * Server-only OpenAI client configuration.
 * Uses the validated OPENAI_API_KEY from environment.
 */
export const openai = new OpenAI({
  apiKey: env.OPENAI_API_KEY,
})

/**
 * Default model for agent operations.
 * Using gpt-4o for best reasoning capabilities.
 */
export const DEFAULT_MODEL = "gpt-4o"

/**
 * Model configuration for different agent operations.
 */
export const modelConfig = {
  /**
   * Planning: Structured output for explicit plan generation.
   */
  planning: {
    model: DEFAULT_MODEL,
    temperature: 0.3, // Lower temperature for more consistent planning
  },

  /**
   * Memory Decision: Deterministic decision about memory relevance.
   */
  memoryDecision: {
    model: DEFAULT_MODEL,
    temperature: 0.1, // Very low temperature for consistent decisions
  },

  /**
   * Reasoning: Iterative reasoning loop.
   */
  reasoning: {
    model: DEFAULT_MODEL,
    temperature: 0.5, // Moderate temperature for reasoning
  },

  /**
   * Answer Generation: Final answer with streaming.
   */
  answer: {
    model: DEFAULT_MODEL,
    temperature: 0.7, // Slightly higher for natural responses
  },
}
