import { openai } from "@/lib/openai"

export interface EmbeddingResult {
  embedding: number[]
  model: string
  tokens: number
}

/**
 * Generate embedding for a text query.
 * Uses text-embedding-3-small (1536 dimensions, $0.02/1M tokens)
 *
 * This is the core function for semantic search - it converts text
 * into a mathematical representation where similar meanings are close together.
 */
export async function generateEmbedding(text: string): Promise<EmbeddingResult> {
  const response = await openai.embeddings.create({
    model: "text-embedding-3-small",
    input: text,
    encoding_format: "float",
  })

  return {
    embedding: response.data[0].embedding,
    model: response.model,
    tokens: response.usage.total_tokens,
  }
}

/**
 * Calculate cosine similarity between two embeddings.
 * Returns value between -1 and 1:
 * - 1.0 = identical
 * - 0.0 = orthogonal (unrelated)
 * - -1.0 = opposite
 *
 * Used for validating similarity scores in tests.
 */
export function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) {
    throw new Error(`Embeddings must have same dimension (got ${a.length} and ${b.length})`)
  }

  let dotProduct = 0
  let normA = 0
  let normB = 0

  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i]
    normA += a[i] * a[i]
    normB += b[i] * b[i]
  }

  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB))
}
