import { openai, modelConfig } from "@/lib/openai"
import type { AgentPlan, RetrievedMemory } from "@/lib/schemas"

/**
 * Reasoning Iteration Result
 *
 * The output of one iteration of the reasoning loop.
 */
export interface ReasoningResult {
  thoughts: string
  needsMoreReasoning: boolean
  confidence: number
}

/**
 * Reasoning Step
 *
 * Performs one iteration of the reasoning loop.
 * Incorporates the question, plan, and any retrieved memories.
 *
 * The agent MUST perform at least one reasoning iteration.
 * Additional iterations occur if confidence is low or more analysis is needed.
 */
export async function performReasoningIteration(
  question: string,
  plan: AgentPlan,
  memories: RetrievedMemory[],
  previousThoughts: string[],
  iterationNumber: number,
  resolvedContext?: string
): Promise<ReasoningResult> {
  const memoryContext =
    memories.length > 0
      ? `\n\nRelevant prior context:\n${memories
          .map(
            (m) =>
              `- Previous Q: "${m.question}"\n  Previous A: "${m.answer}"`
          )
          .join("\n")}`
      : ""

  const previousContext =
    previousThoughts.length > 0
      ? `\n\nPrevious reasoning:\n${previousThoughts
          .map((t, i) => `Iteration ${i + 1}: ${t}`)
          .join("\n")}`
      : ""

  const resolvedPronouns = resolvedContext
    ? `\n\n**CRITICAL RESOLVED CONTEXT:** ${resolvedContext}`
    : ""

  const response = await openai.chat.completions.create({
    model: modelConfig.reasoning.model,
    temperature: modelConfig.reasoning.temperature,
    messages: [
      {
        role: "system",
        content: `You are a reasoning assistant performing iteration ${iterationNumber} of an analysis.

Your task:
1. Analyze the question using the provided plan
2. Consider any prior context or memories
3. **IMPORTANT**: If resolved context is provided (pronouns/references resolved), use that information as the definitive subject of the question
4. Determine if you have enough information to provide a confident answer

Respond with a JSON object:
{
  "thoughts": "string - your reasoning for this iteration",
  "needsMoreReasoning": boolean - true if another iteration would improve the answer,
  "confidence": number between 0 and 1 - how confident you are in answering
}

Guidelines:
- Be thorough but concise in your reasoning
- If memories are provided, consider how they inform the current question
- **If resolved context shows pronouns were resolved, ALWAYS use that resolved information**
- Set needsMoreReasoning=false if confidence > 0.8 or iteration >= 2
- Maximum 3 iterations allowed`,
      },
      {
        role: "user",
        content: `Question: ${question}

Plan:
- Objective: ${plan.objective}
- Steps: ${plan.steps.map((s) => `${s.step}. ${s.action}`).join("; ")}
${resolvedPronouns}${memoryContext}${previousContext}

Perform reasoning iteration ${iterationNumber}.`,
      },
    ],
    response_format: { type: "json_object" },
  })

  const content = response.choices[0]?.message?.content
  if (!content) {
    throw new Error("No response from reasoning model")
  }

  const parsed = JSON.parse(content)

  return {
    thoughts: parsed.thoughts || "",
    needsMoreReasoning:
      iterationNumber < 3 && parsed.needsMoreReasoning === true,
    confidence: Math.min(1, Math.max(0, parsed.confidence || 0.5)),
  }
}

/**
 * Perform the complete reasoning loop.
 *
 * Executes at least one iteration, continuing until:
 * - Confidence is high enough (> 0.8)
 * - Maximum iterations reached (3)
 * - Model indicates no more reasoning needed
 */
export async function performReasoningLoop(
  question: string,
  plan: AgentPlan,
  memories: RetrievedMemory[],
  resolvedContext?: string
): Promise<{
  allThoughts: string[]
  finalConfidence: number
  iterations: number
}> {
  const allThoughts: string[] = []
  let finalConfidence = 0
  let iteration = 1
  let continueReasoning = true

  while (continueReasoning && iteration <= 3) {
    const result = await performReasoningIteration(
      question,
      plan,
      memories,
      allThoughts,
      iteration,
      resolvedContext
    )

    allThoughts.push(result.thoughts)
    finalConfidence = result.confidence

    // Must do at least one iteration
    if (iteration === 1) {
      continueReasoning = result.needsMoreReasoning
    } else {
      continueReasoning = result.needsMoreReasoning && result.confidence < 0.8
    }

    iteration++
  }

  return {
    allThoughts,
    finalConfidence,
    iterations: iteration - 1,
  }
}
