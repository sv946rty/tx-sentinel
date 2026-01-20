import { openai, modelConfig } from "@/lib/openai"
import { memoryExistenceCheckSchema, type MemoryExistenceCheck } from "@/lib/schemas"
import { searchMemory } from "@/db/queries"
import { searchByVector } from "@/db/queries/vector-search"

/**
 * Memory Existence Check Step
 *
 * Checks whether a similar question has been asked before.
 * This is SEPARATE from deciding whether memory is needed for reasoning.
 *
 * This step ALWAYS executes and:
 * 1. Searches for similar prior questions
 * 2. Acknowledges if a similar question exists
 * 3. Prepares context for memory dependency decision
 *
 * This ensures the agent feels attentive and not forgetful.
 */
export async function checkMemoryExistence(
  userId: string,
  question: string
): Promise<MemoryExistenceCheck> {
  // First, generate a search query for finding similar questions
  const searchQueryResponse = await openai.chat.completions.create({
    model: modelConfig.memoryDecision.model,
    temperature: 0.3, // Lower temperature for consistent search query generation
    messages: [
      {
        role: "system",
        content: `You are a search query generator. Given a user's question, generate a concise search query to find similar prior questions.

Extract the key concepts and entities from the question to create an effective search query.
Focus on the main subject and intent, not on pronouns or references.

Respond with a JSON object:
{
  "searchQuery": "string - concise query for finding similar questions"
}`,
      },
      {
        role: "user",
        content: question,
      },
    ],
    response_format: { type: "json_object" },
  })

  const searchQueryContent = searchQueryResponse.choices[0]?.message?.content
  if (!searchQueryContent) {
    throw new Error("No response from search query generation")
  }

  const { searchQuery } = JSON.parse(searchQueryContent) as { searchQuery: string }

  // Search for similar questions in memory using HYBRID STRATEGY
  // Try vector search first (semantic), fall back to text search if no embeddings exist

  // Strategy 1: Vector Similarity Search (PRIMARY - best for semantic matching)
  // This will find "wife" when searching for "spouse", paraphrases, etc.
  let vectorResults = await searchByVector(userId, question, {
    limit: 5,
    similarityThreshold: 0.75, // Lower threshold for finding candidates
  })

  // Convert vector results to the format expected by the LLM
  let similarMemories = vectorResults.map(r => ({
    runId: r.id,
    question: r.question,
    answer: r.answer,
    createdAt: r.createdAt.toISOString(),
    relevanceScore: r.similarity,
  }))

  // Strategy 2: Text search fallback (if no vector results - old records without embeddings)
  if (similarMemories.length === 0) {
    similarMemories = await searchMemory({
      userId,
      query: searchQuery,
      limit: 3,
    })
  }

  // Strategy 3: If still no results, search with original question text
  // This catches exact or near-exact matches that might be missed by keyword search
  if (similarMemories.length === 0) {
    // Extract key words from the question (removing common words)
    const questionWords = question
      .toLowerCase()
      .replace(/[?.,!]/g, "")
      .split(/\s+/)
      .filter(word =>
        word.length > 2 &&
        !["the", "a", "an", "is", "was", "were", "are", "has", "have", "had", "where", "what", "when", "who", "how", "why", "he", "she", "it", "they", "him", "her", "his", "their"].includes(word)
      )

    // Try searching with meaningful words from the question
    if (questionWords.length > 0) {
      similarMemories = await searchMemory({
        userId,
        query: questionWords.join(" "),
        limit: 3,
      })
    }
  }

  // Strategy 3: If still no results, try searching with individual keywords
  // This is crucial for paraphrased questions (e.g., "invented" vs "created")
  // We search for questions containing ANY of the key nouns/entities
  if (similarMemories.length === 0) {
    const questionWords = question
      .toLowerCase()
      .replace(/[?.,!]/g, "")
      .split(/\s+/)
      .filter(word =>
        word.length > 3 &&
        !["the", "a", "an", "is", "was", "were", "are", "has", "have", "had", "where", "what", "when", "who", "how", "why", "does", "did", "will", "would", "could", "should", "he", "she", "it", "they", "him", "her", "his", "their", "with", "from", "this", "that", "these", "those"].includes(word)
      )

    // Try each significant word individually and combine results
    const memoryMap = new Map<string, typeof similarMemories[0]>()
    for (const word of questionWords) {
      const wordResults = await searchMemory({
        userId,
        query: word,
        limit: 5,
      })
      // Deduplicate by runId
      for (const result of wordResults) {
        if (!memoryMap.has(result.runId)) {
          memoryMap.set(result.runId, result)
        }
      }
    }
    if (memoryMap.size > 0) {
      // Sort by createdAt descending (newest first) after combining from multiple queries
      similarMemories = Array.from(memoryMap.values())
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 5)
    }
  }

  // Strategy 4: If still no results, try the full original question
  if (similarMemories.length === 0) {
    similarMemories = await searchMemory({
      userId,
      query: question,
      limit: 3,
    })
  }

  // Determine which search method was used
  const searchMethod = vectorResults.length > 0 ? 'vector_similarity' : 'text_search'

  // Now use LLM to determine if any of these are truly similar
  const similarityResponse = await openai.chat.completions.create({
    model: modelConfig.memoryDecision.model,
    temperature: 0.2,
    messages: [
      {
        role: "system",
        content: `You are a similarity checker. Given a current question and a list of prior questions, determine if any prior question is substantially similar to the current question.

Two questions are "substantially similar" if they:
- Ask about the same topic or entity (even if worded differently)
- Have the same intent or goal
- Would have the same or very similar answers
- Use synonyms or paraphrasing (e.g., "right now" vs "currently", "where" vs "what location", "wife" vs "spouse")

**IMPORTANT EXAMPLES:**
- "Where does he live right now?" ≈ "Where does he live currently?" → SIMILAR (same intent, synonyms)
- "Where was he born?" ≈ "What is his birthplace?" → SIMILAR (same question, different wording)
- "Who is Tim Cook?" ≈ "Tell me about Tim Cook" → SIMILAR (same subject, similar intent)
- "Who is his wife?" ≈ "Who is his spouse?" → SIMILAR (synonyms - wife/spouse)
- "What is Python?" ≈ "How does Python work?" → DIFFERENT (different intents)

Be generous with similarity - if questions ask the same thing with different words, mark them as similar.

${searchMethod === 'vector_similarity' ? '**NOTE:** These results were found using semantic vector search, which already indicates high similarity. Trust the relevanceScore provided.' : ''}

Respond with a JSON object:
{
  "similarQuestionExists": boolean,
  "existingRunId": "string (optional) - UUID of the most similar question",
  "existingQuestion": "string (optional) - the similar question text",
  "existingAnswer": "string (optional) - the previous answer",
  "searchQuery": "string - the search query used",
  "explanation": "string - explain why questions are/aren't similar",
  "searchMethod": "${searchMethod}",
  "vectorSimilarityScore": number (optional) - if vector search, the highest similarity score
}

**CRITICAL: If multiple similar questions exist, ALWAYS select the MOST RECENT one (latest createdAt timestamp).**
This ensures users get the newest/most up-to-date answer.`,
      },
      {
        role: "user",
        content: JSON.stringify({
          currentQuestion: question,
          priorQuestions: similarMemories.map(m => ({
            runId: m.runId,
            question: m.question,
            answer: m.answer,
            createdAt: m.createdAt,
            relevanceScore: m.relevanceScore,
          })),
          searchQuery,
          searchMethod,
        }),
      },
    ],
    response_format: { type: "json_object" },
  })

  const similarityContent = similarityResponse.choices[0]?.message?.content
  if (!similarityContent) {
    throw new Error("No response from similarity check")
  }

  const parsed = JSON.parse(similarityContent)
  return memoryExistenceCheckSchema.parse(parsed)
}
