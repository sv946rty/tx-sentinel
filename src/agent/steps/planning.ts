import { openai, modelConfig } from "@/lib/openai"
import { agentPlanSchema, type AgentPlan } from "@/lib/schemas"

/**
 * Planning Step
 *
 * Analyzes the user's question and generates an explicit, structured plan.
 * This is the first step in the agent's reasoning process.
 *
 * The plan includes:
 * - Objective: What the agent is trying to accomplish
 * - Steps: Ordered list of actions with reasoning
 * - RequiresMemory: Whether prior context may be relevant
 */
export async function generatePlan(question: string): Promise<AgentPlan> {
  const response = await openai.chat.completions.create({
    model: modelConfig.planning.model,
    temperature: modelConfig.planning.temperature,
    messages: [
      {
        role: "system",
        content: `You are a planning assistant. Given a user's question, create an explicit plan to answer it.

Your plan must include:
1. A clear objective statement
2. A list of 2-4 steps to accomplish the objective
3. Whether checking prior conversation memory might be helpful

Respond with a JSON object matching this structure:
{
  "objective": "string - what you're trying to accomplish",
  "steps": [
    {
      "step": 1,
      "action": "string - what to do",
      "reasoning": "string - why this step is needed"
    }
  ],
  "requiresMemory": boolean
}

Consider requiresMemory=true when:
- The question references previous discussions ("as I mentioned", "like before", "again")
- The question is a follow-up or clarification
- The topic might benefit from prior context

Consider requiresMemory=false when:
- The question is self-contained
- It's a new topic with no apparent connection to history
- It's a simple factual question`,
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
    throw new Error("No response from planning model")
  }

  const parsed = JSON.parse(content)
  return agentPlanSchema.parse(parsed)
}
