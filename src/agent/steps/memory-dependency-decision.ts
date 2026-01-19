import { openai, modelConfig } from "@/lib/openai"
import { memoryDependencyDecisionSchema, type MemoryDependencyDecision, type MemoryExistenceCheck } from "@/lib/schemas"
import { getRecentQuestionsForUser } from "@/db/queries"

/**
 * Memory Dependency Decision Step
 *
 * Decides whether prior memory is REQUIRED to answer the current question correctly.
 * This is SEPARATE from checking whether similar questions exist.
 *
 * MANDATORY PRONOUN RESOLUTION:
 * If the question contains pronouns or implicit references (he, she, it, they, this, that, etc.),
 * the agent MUST attempt to resolve them using prior memory.
 *
 * The agent MUST:
 * 1. Detect pronouns and implicit references
 * 2. Search recent questions for entities to resolve them
 * 3. Prefer the most recent relevant entity
 * 4. Explain resolution decision in reasoning timeline
 * 5. Only ask for clarification if resolution is ambiguous or impossible
 */
export async function makeMemoryDependencyDecision(
  userId: string,
  question: string,
  existenceCheck: MemoryExistenceCheck,
  planRequiresMemory: boolean
): Promise<MemoryDependencyDecision> {
  // Get recent questions for pronoun resolution context
  const recentQuestions = await getRecentQuestionsForUser(userId, 10)

  const response = await openai.chat.completions.create({
    model: modelConfig.memoryDecision.model,
    temperature: modelConfig.memoryDecision.temperature,
    messages: [
      {
        role: "system",
        content: `You are a memory dependency analyzer. Your job is to determine whether prior memory is REQUIRED to answer the current question correctly.

This is SEPARATE from whether similar questions exist. A question can:
- Have been asked before (similar exists) but NOT require memory (self-contained)
- NOT have been asked before but REQUIRE memory (follow-up or reference)

MANDATORY PRONOUN & IMPLICIT REFERENCE RESOLUTION:

If the question contains ANY of these:
- Pronouns: he, she, it, they, him, her, them, his, hers, their, theirs
- Demonstratives: this, that, these, those
- Implicit references: "the person", "the company", "the project", "the same", etc.

You MUST:
1. Identify ALL pronouns and implicit references
2. Attempt to resolve them using recent prior questions
3. **CRITICAL: ALWAYS resolve to the entity from the MOST RECENT question (index 0 in the array)**
4. Explain your resolution decision clearly
5. Only mark as unresolved if truly ambiguous

**CRITICAL RESOLUTION RULES - READ CAREFULLY:**
- The recentQuestions array is ordered from MOST RECENT (index 0) to OLDEST (last index)
- **ALWAYS look at index 0 FIRST** - this is the user's immediately previous question
- **ALWAYS prefer the entity from index 0** if it contains a person, company, place, or topic
- Example: If recentQuestions[0] is about "Elon Musk" and the user asks "how old is he?", resolve "he" → "Elon Musk"
- Do NOT skip to older questions when the most recent question contains a relevant entity
- Ignore older mentions of different entities (like "Tim Cook" from days ago) when resolving current pronouns
- A clear resolution means you found a specific entity/topic in the MOST RECENT question
- Proceed with resolved context - DO NOT ask user for clarification if resolution is clear
- Only mark as ambiguous if the MOST RECENT question contains NO relevant entity

Context Available:
- Existence check result: ${existenceCheck.similarQuestionExists ? `Similar question found: "${existenceCheck.existingQuestion}"` : "No similar question found"}
- Planning hint: ${planRequiresMemory ? "Memory might be relevant" : "Memory likely not needed"}
- Recent questions: You have access to recent Q&A pairs for pronoun resolution

Respond with a JSON object:
{
  "requiresMemory": boolean,
  "reason": "string - why memory is or isn't required for REASONING (not just existence)",
  "contextNeeded": ["array of strings - specific prior context needed, if any"],
  "pronounResolution": {
    "hasPronouns": boolean,
    "pronounsFound": ["array of pronouns/references found"],
    "resolutionAttempted": boolean,
    "resolved": boolean (true if pronouns were resolved),
    "resolvedEntities": [
      {
        "pronoun": "string - the pronoun/reference",
        "resolvedTo": "string - what it refers to",
        "confidence": number (0-1)
      }
    ],
    "resolutionExplanation": "string - explain how you resolved or why you couldn't"
  }
}

Examples:

Question: "What is the capital of France?"
- No pronouns, self-contained → requiresMemory: false

Question: "Tell me more about it"
- Has pronoun "it"
- Look at recentQuestions[0] (most recent) first
- If recentQuestions[0] was "What is TypeScript?", resolve "it" → "TypeScript"
- requiresMemory: true, with resolution details

Question: "How old is he?"
- Has pronoun "he"
- **CRITICAL**: Look at recentQuestions[0] first - this is the MOST RECENT question
- If recentQuestions[0] = "Who is Elon Musk?" → resolve "he" → "Elon Musk"
- Even if recentQuestions[5] = "Who is Tim Cook?" exists, IGNORE IT - use the MOST RECENT entity
- requiresMemory: true

Question: "What's the population there?"
- Has implicit reference "there"
- Look at recentQuestions[0] for a location
- If recentQuestions[0] was "Tell me about Tokyo", resolve "there" → "Tokyo"
- requiresMemory: true

Question: "Who is the CEO of that company?"
- Has implicit reference "that company"
- Look at recentQuestions[0] for a company name
- If recentQuestions[0] was "What does Apple do?", resolve "that company" → "Apple"
- requiresMemory: true`,
      },
      {
        role: "user",
        content: JSON.stringify({
          currentQuestion: question,
          existenceCheck,
          planRequiresMemory,
          // IMPORTANT: Array is ordered from MOST RECENT (index 0) to OLDEST
          // Index 0 = immediately previous question, Index 1 = second most recent, etc.
          recentQuestions_ORDERED_MOST_RECENT_FIRST: recentQuestions.map((q, index) => ({
            recencyRank: index, // 0 = most recent, higher = older
            question: q.question,
            answer: q.answer,
            createdAt: q.createdAt.toISOString(),
          })),
        }),
      },
    ],
    response_format: { type: "json_object" },
  })

  const content = response.choices[0]?.message?.content
  if (!content) {
    throw new Error("No response from memory dependency decision model")
  }

  const parsed = JSON.parse(content)
  return memoryDependencyDecisionSchema.parse(parsed)
}
