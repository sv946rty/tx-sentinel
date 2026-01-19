import {
  decisionInputSchema,
  decisionOutputSchema,
  type DecisionInput,
  type DecisionOutput,
} from "@/lib/schemas"

/**
 * Structured Decision Tool (Internal)
 *
 * Used when the agent needs to make an explicit, auditable decision.
 * The decision is structured and validated, not free-form text.
 *
 * Implementation will be completed in Phase 5 with AI integration.
 */
export async function decisionTool(rawInput: unknown): Promise<DecisionOutput> {
  // Validate input with Zod
  const input = decisionInputSchema.parse(rawInput)

  // TODO: Implement LLM-based decision in Phase 5
  // For now, return a placeholder that selects the first option
  const output: DecisionOutput = {
    selectedOption: input.options[0],
    confidence: 0.5,
    reasoning: "Placeholder decision - will be implemented in Phase 5",
  }

  // Validate output before returning
  return decisionOutputSchema.parse(output)
}

/**
 * Type-safe wrapper that accepts validated input directly.
 */
export async function makeDecision(
  input: DecisionInput
): Promise<DecisionOutput> {
  return decisionTool(input)
}
