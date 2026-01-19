import { openai, modelConfig } from "@/lib/openai"
import { memoryDecisionSchema, type MemoryDecision } from "@/lib/schemas"

/**
 * Memory Decision Step
 *
 * Makes an explicit decision about whether to retrieve prior memory.
 * This decision is auditable and explainable.
 *
 * The decision includes:
 * - shouldRetrieveMemory: Boolean decision
 * - reason: Explanation for the decision
 * - searchQuery: Query to use if memory is needed
 */
export async function makeMemoryDecision(
  question: string,
  planRequiresMemory: boolean
): Promise<MemoryDecision> {
  const response = await openai.chat.completions.create({
    model: modelConfig.memoryDecision.model,
    temperature: modelConfig.memoryDecision.temperature,
    messages: [
      {
        role: "system",
        content: `You are a memory decision assistant. Given a user's question and a hint from the planning step, decide whether to search prior conversation history.

The planning step suggested: ${planRequiresMemory ? "memory might be relevant" : "memory is likely not needed"}

Make a final decision and provide:
1. Whether to retrieve memory (true/false)
2. A clear reason for your decision
3. If retrieving, a concise search query to find relevant prior Q&A

Respond with a JSON object:
{
  "shouldRetrieveMemory": boolean,
  "reason": "string - explanation for decision",
  "searchQuery": "string (optional) - query if memory is needed"
}

Be conservative: only retrieve memory when there's a clear benefit.
Memory retrieval has a cost, so avoid it for self-contained questions.`,
      },
      {
        role: "user",
        content: question,
      },
    ],
    response_format: { type: "json_object" },
  })

  const content = response.choices[0]?.message?.content
  if (!content) {
    throw new Error("No response from memory decision model")
  }

  const parsed = JSON.parse(content)
  return memoryDecisionSchema.parse(parsed)
}
