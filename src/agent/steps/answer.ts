import { openai, modelConfig } from "@/lib/openai"
import type { AgentPlan, RetrievedMemory } from "@/lib/schemas"

/**
 * Answer Generation Step
 *
 * Generates the final answer based on:
 * - The original question
 * - The execution plan
 * - Retrieved memories (if any)
 * - Reasoning from the loop
 * - Resolved pronoun context (if any)
 *
 * Returns a streaming response for real-time output.
 */
export async function generateAnswerStream(
  question: string,
  plan: AgentPlan,
  memories: RetrievedMemory[],
  reasoningThoughts: string[],
  resolvedContext?: string
): Promise<AsyncIterable<string>> {
  const memoryContext =
    memories.length > 0
      ? `\n\nRelevant prior context from memory:\n${memories
          .map(
            (m) =>
              `- Previous question: "${m.question}"\n  Previous answer: "${m.answer}"`
          )
          .join("\n")}`
      : ""

  const reasoningContext =
    reasoningThoughts.length > 0
      ? `\n\nReasoning performed:\n${reasoningThoughts
          .map((t, i) => `${i + 1}. ${t}`)
          .join("\n")}`
      : ""

  const resolvedPronouns = resolvedContext
    ? `\n\n**CRITICAL RESOLVED CONTEXT:** ${resolvedContext}`
    : ""

  const stream = await openai.chat.completions.create({
    model: modelConfig.answer.model,
    temperature: modelConfig.answer.temperature,
    stream: true,
    messages: [
      {
        role: "system",
        content: `You are a helpful assistant providing a clear, well-structured answer.

Based on the question, plan, any prior context, and reasoning provided, give a comprehensive answer.

Guidelines:
- Be direct and helpful
- **CRITICAL**: If resolved context is provided (showing what pronouns/references mean), use that as the definitive subject of the question
- If prior context is relevant, incorporate it naturally
- Structure your answer for readability
- Don't mention the internal planning or reasoning process
- Focus on answering the user's question`,
      },
      {
        role: "user",
        content: `Question: ${question}

Plan objective: ${plan.objective}
${resolvedPronouns}${memoryContext}${reasoningContext}

Please provide a helpful answer.`,
      },
    ],
  })

  return streamToAsyncIterable(stream)
}

/**
 * Generate answer without streaming (for cases where full answer is needed).
 */
export async function generateAnswer(
  question: string,
  plan: AgentPlan,
  memories: RetrievedMemory[],
  reasoningThoughts: string[],
  resolvedContext?: string
): Promise<string> {
  const chunks: string[] = []
  const stream = await generateAnswerStream(
    question,
    plan,
    memories,
    reasoningThoughts,
    resolvedContext
  )

  for await (const chunk of stream) {
    chunks.push(chunk)
  }

  return chunks.join("")
}

/**
 * Convert OpenAI stream to async iterable of text chunks.
 */
async function* streamToAsyncIterable(
  stream: AsyncIterable<OpenAI.Chat.Completions.ChatCompletionChunk>
): AsyncIterable<string> {
  for await (const chunk of stream) {
    const content = chunk.choices[0]?.delta?.content
    if (content) {
      yield content
    }
  }
}

// Type import for the stream
import type OpenAI from "openai"
