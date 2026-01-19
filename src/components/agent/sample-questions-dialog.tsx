"use client"

import { useState, useEffect } from "react"
import { BookOpen } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"

/**
 * Sample Questions Dialog
 *
 * Displays test scenarios from /docs/sample-questions.md
 * Helps users understand what to test and how the system should behave
 */
export function SampleQuestionsDialog() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <Button variant="link" className="h-auto p-0 text-sm">
        <BookOpen className="mr-1.5 h-4 w-4" />
        Sample Questions
      </Button>
    )
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="link" className="h-auto p-0 text-sm">
          <BookOpen className="mr-1.5 h-4 w-4" />
          Sample Questions
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Sample Test Scenarios</DialogTitle>
          <DialogDescription>
            Use these scenarios to test memory, pronoun resolution, and semantic similarity features
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="h-150 pr-4">
          <div className="space-y-6">
            {/* Test Scenario 1 */}
            <div>
              <h3 className="mb-2 font-semibold text-sm">
                Test Scenario 1: Basic Pronoun Resolution
              </h3>
              <p className="mb-2 text-xs text-muted-foreground">
                Objective: Test that pronouns are resolved using recent context
              </p>
              <div className="space-y-1 text-sm">
                <p className="font-medium">Sequence:</p>
                <ol className="ml-4 list-decimal space-y-0.5 text-xs">
                  <li>Who is Tim Cook?</li>
                  <li>How old is he?</li>
                  <li>Where was he born?</li>
                  <li>What company does he lead?</li>
                  <li>When did he become CEO?</li>
                </ol>
                <p className="mt-2 text-xs text-muted-foreground">
                  Expected: Questions 2-5 should resolve "he" → "Tim Cook"
                </p>
              </div>
            </div>

            {/* Test Scenario 2 */}
            <div>
              <h3 className="mb-2 font-semibold text-sm">
                Test Scenario 2: Exact Question Repetition
              </h3>
              <p className="mb-2 text-xs text-muted-foreground">
                Objective: Test that identical questions are recognized
              </p>
              <div className="space-y-1 text-sm">
                <p className="font-medium">Sequence:</p>
                <ol className="ml-4 list-decimal space-y-0.5 text-xs">
                  <li>What is the capital of France?</li>
                  <li>What is the capital of France?</li>
                </ol>
                <p className="mt-2 text-xs text-muted-foreground">
                  Expected: Question 2 should find similar question exists
                </p>
              </div>
            </div>

            {/* Test Scenario 3 */}
            <div>
              <h3 className="mb-2 font-semibold text-sm">
                Test Scenario 3: Semantic Similarity (Synonyms)
              </h3>
              <p className="mb-2 text-xs text-muted-foreground">
                Objective: Test that semantically similar questions are recognized
              </p>
              <div className="space-y-1 text-sm">
                <p className="font-medium">Sequence:</p>
                <ol className="ml-4 list-decimal space-y-0.5 text-xs">
                  <li>Where does Elon Musk live right now?</li>
                  <li>Where does he live currently?</li>
                  <li>What is his current residence?</li>
                </ol>
                <p className="mt-2 text-xs text-muted-foreground">
                  Expected: Questions 2-3 should recognize similarity ("right now" ≈ "currently")
                </p>
              </div>
            </div>

            {/* Test Scenario 4 */}
            <div>
              <h3 className="mb-2 font-semibold text-sm">
                Test Scenario 4: Paraphrased Questions
              </h3>
              <p className="mb-2 text-xs text-muted-foreground">
                Objective: Test recognition of differently worded questions with same intent
              </p>
              <div className="space-y-1 text-sm">
                <p className="font-medium">Sequence:</p>
                <ol className="ml-4 list-decimal space-y-0.5 text-xs">
                  <li>Who invented the telephone?</li>
                  <li>Who created the telephone?</li>
                  <li>Who is credited with inventing the telephone?</li>
                </ol>
                <p className="mt-2 text-xs text-muted-foreground">
                  Expected: Questions 2-3 should recognize similarity ("invented" ≈ "created")
                </p>
              </div>
            </div>

            {/* Test Scenario 5 */}
            <div>
              <h3 className="mb-2 font-semibold text-sm">
                Test Scenario 5: Multiple Pronouns in Conversation
              </h3>
              <p className="mb-2 text-xs text-muted-foreground">
                Objective: Test complex pronoun chains
              </p>
              <div className="space-y-1 text-sm">
                <p className="font-medium">Sequence:</p>
                <ol className="ml-4 list-decimal space-y-0.5 text-xs">
                  <li>Tell me about Steve Jobs</li>
                  <li>What company did he found?</li>
                  <li>When did he pass away?</li>
                  <li>Who succeeded him at Apple?</li>
                  <li>How long has that person been CEO?</li>
                </ol>
                <p className="mt-2 text-xs text-muted-foreground">
                  Expected: Pronouns should resolve correctly through the chain
                </p>
              </div>
            </div>

            {/* Test Scenario 6 */}
            <div>
              <h3 className="mb-2 font-semibold text-sm">
                Test Scenario 6: Context Switching
              </h3>
              <p className="mb-2 text-xs text-muted-foreground">
                Objective: Test that context switches correctly between topics
              </p>
              <div className="space-y-1 text-sm">
                <p className="font-medium">Sequence:</p>
                <ol className="ml-4 list-decimal space-y-0.5 text-xs">
                  <li>Who is Sundar Pichai?</li>
                  <li>Where was he born?</li>
                  <li>Who is Satya Nadella?</li>
                  <li>Where was he born?</li>
                </ol>
                <p className="mt-2 text-xs text-muted-foreground">
                  Expected: Question 4 should resolve "he" → "Satya Nadella" (most recent)
                </p>
              </div>
            </div>

            {/* Test Scenario 7 */}
            <div>
              <h3 className="mb-2 font-semibold text-sm">
                Test Scenario 7: Implicit References
              </h3>
              <p className="mb-2 text-xs text-muted-foreground">
                Objective: Test resolution of non-pronoun references
              </p>
              <div className="space-y-1 text-sm">
                <p className="font-medium">Sequence:</p>
                <ol className="ml-4 list-decimal space-y-0.5 text-xs">
                  <li>What does Microsoft do?</li>
                  <li>Who founded the company?</li>
                  <li>When was the company established?</li>
                  <li>What is the company's market cap?</li>
                </ol>
                <p className="mt-2 text-xs text-muted-foreground">
                  Expected: Questions 2-4 should resolve "the company" → "Microsoft"
                </p>
              </div>
            </div>

            {/* Test Scenario 8 */}
            <div>
              <h3 className="mb-2 font-semibold text-sm">
                Test Scenario 8: Different Questions, Same Subject
              </h3>
              <p className="mb-2 text-xs text-muted-foreground">
                Objective: Test that different questions about same subject are NOT marked as similar
              </p>
              <div className="space-y-1 text-sm">
                <p className="font-medium">Sequence:</p>
                <ol className="ml-4 list-decimal space-y-0.5 text-xs">
                  <li>What is Python?</li>
                  <li>How does Python work?</li>
                  <li>What is Python used for?</li>
                  <li>Who created Python?</li>
                </ol>
                <p className="mt-2 text-xs text-muted-foreground">
                  Expected: Questions should NOT be marked as similar (different intents)
                </p>
              </div>
            </div>

            {/* Test Scenario 15 */}
            <div>
              <h3 className="mb-2 font-semibold text-sm">
                Test Scenario 15: Memory Exists But Not Required
              </h3>
              <p className="mb-2 text-xs text-muted-foreground">
                Objective: Test distinction between memory existence and dependency
              </p>
              <div className="space-y-1 text-sm">
                <p className="font-medium">Sequence:</p>
                <ol className="ml-4 list-decimal space-y-0.5 text-xs">
                  <li>What is 2 + 2?</li>
                  <li>What is 2 + 2?</li>
                </ol>
                <p className="mt-2 text-xs text-muted-foreground">
                  Expected: Question 2 should acknowledge memory exists but is not required for reasoning
                </p>
              </div>
            </div>

            {/* Quick Tips */}
            <div className="border-t pt-4">
              <h3 className="mb-2 font-semibold text-sm">Testing Tips</h3>
              <ul className="ml-4 list-disc space-y-1 text-xs text-muted-foreground">
                <li>Always review the reasoning timeline to see memory checks and pronoun resolution</li>
                <li>Clear browser cache or use a new user account between major test runs</li>
                <li>Check that similar questions are acknowledged in the reasoning</li>
                <li>Verify pronouns are correctly resolved in the final answer</li>
                <li>Test both cases: memory exists but not needed, and memory needed for context</li>
              </ul>
            </div>

            {/* Full Documentation Link */}
            <div className="border-t pt-4">
              <p className="text-xs text-muted-foreground">
                For the complete set of 20 test scenarios, see{" "}
                <code className="rounded bg-muted px-1 py-0.5 text-xs">
                  /docs/sample-questions.md
                </code>
              </p>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}
