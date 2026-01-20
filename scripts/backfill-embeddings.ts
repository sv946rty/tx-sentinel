import { db } from "../src/db"
import { agentRuns } from "../src/db/schema"
import { isNull } from "drizzle-orm"
import { generateEmbedding } from "../src/lib/embeddings"
import { eq } from "drizzle-orm"

/**
 * Backfill Embeddings Script
 *
 * Generates vector embeddings for existing agent runs that don't have them.
 * This allows semantic search to work on questions asked before pgvector was enabled.
 *
 * Usage: tsx scripts/backfill-embeddings.ts
 */
async function backfillEmbeddings() {
  console.log("🚀 Starting embedding backfill...")
  console.log("=" .repeat(60))

  // Find all records without embeddings
  const recordsWithoutEmbeddings = await db
    .select({
      id: agentRuns.id,
      question: agentRuns.question,
      createdAt: agentRuns.createdAt,
    })
    .from(agentRuns)
    .where(isNull(agentRuns.questionEmbedding))

  const total = recordsWithoutEmbeddings.length
  console.log(`📊 Found ${total} record(s) without embeddings`)

  if (total === 0) {
    console.log("✅ All records already have embeddings. Nothing to do!")
    return
  }

  console.log("=" .repeat(60))

  let processed = 0
  let failed = 0

  for (const record of recordsWithoutEmbeddings) {
    processed++
    const progress = ((processed / total) * 100).toFixed(1)

    try {
      console.log(`\n[${processed}/${total}] (${progress}%)`)
      console.log(`Question: "${record.question.substring(0, 60)}${record.question.length > 60 ? "..." : ""}"`)

      // Generate embedding
      console.log("  ⏳ Generating embedding...")
      const embeddingResult = await generateEmbedding(record.question)

      console.log(`  💾 Saving to database (${embeddingResult.tokens} tokens)...`)

      // Update database
      await db
        .update(agentRuns)
        .set({
          questionEmbedding: embeddingResult.embedding,
          embeddingModel: embeddingResult.model,
        })
        .where(eq(agentRuns.id, record.id))

      console.log("  ✅ Success!")
    } catch (error) {
      failed++
      console.error("  ❌ Error:", error instanceof Error ? error.message : String(error))
    }

    // Rate limiting: 100ms delay between requests to avoid API throttling
    if (processed < total) {
      await new Promise(resolve => setTimeout(resolve, 100))
    }
  }

  console.log("\n" + "=" .repeat(60))
  console.log("🎉 Backfill complete!")
  console.log(`   ✅ Processed: ${processed}`)
  console.log(`   ❌ Failed: ${failed}`)
  console.log(`   📈 Success rate: ${(((processed - failed) / processed) * 100).toFixed(1)}%`)
  console.log("=" .repeat(60))

  process.exit(0)
}

// Run backfill
backfillEmbeddings().catch((error) => {
  console.error("\n💥 Fatal error:", error)
  process.exit(1)
})
