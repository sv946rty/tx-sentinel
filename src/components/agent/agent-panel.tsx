"use client"

import { useState, useCallback, useEffect } from "react"
import { QuestionForm } from "./question-form"
import { ReasoningTimeline } from "./reasoning-timeline"
import { AnswerDisplay } from "./answer-display"
import { SampleQuestionsDialog } from "./sample-questions-dialog"
import { SessionPasswordDialog } from "@/components/auth"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Sparkles, MessageSquare, AlertCircle } from "lucide-react"
import { checkSessionAuth } from "@/actions"
import type { ReasoningStep, StreamEvent } from "@/lib/schemas"

interface AgentPanelProps {
  selectedQuestion?: string
  onComplete?: () => void
}

/**
 * Agent Panel
 *
 * Main interaction area combining:
 * - Question input form
 * - Reasoning timeline
 * - Streaming answer display
 *
 * One question → one explicit agent run.
 */
export function AgentPanel({ selectedQuestion, onComplete }: AgentPanelProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [reasoningSteps, setReasoningSteps] = useState<ReasoningStep[]>([])
  const [answer, setAnswer] = useState("")
  const [isStreaming, setIsStreaming] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [currentQuestion, setCurrentQuestion] = useState<string | null>(null)

  // Session password state
  const [showPasswordDialog, setShowPasswordDialog] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(true)
  const [requiresPassword, setRequiresPassword] = useState(false)
  const [pendingQuestion, setPendingQuestion] = useState<string | null>(null)

  // Check session authentication on mount
  useEffect(() => {
    checkSessionAuth().then((result) => {
      setRequiresPassword(result.requiresPassword)
      setIsAuthenticated(result.isAuthenticated)
    })
  }, [])

  const handleSubmitInternal = useCallback(async (question: string) => {
    // Reset state
    setIsSubmitting(true)
    setReasoningSteps([])
    setAnswer("")
    setError(null)
    setIsStreaming(true)
    setCurrentQuestion(question)

    try {
      // Call the streaming API
      const response = await fetch("/api/agent/stream", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ question }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to start agent")
      }

      // Read the SSE stream
      const reader = response.body?.getReader()
      if (!reader) {
        throw new Error("No response body")
      }

      const decoder = new TextDecoder()
      let buffer = ""

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })

        // Parse SSE events
        const lines = buffer.split("\n\n")
        buffer = lines.pop() || ""

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const data = line.slice(6)
            try {
              const event: StreamEvent = JSON.parse(data)

              switch (event.type) {
                case "reasoning_step":
                  setReasoningSteps((prev) => [...prev, event.data])
                  break
                case "answer_chunk":
                  setAnswer((prev) => prev + event.data.chunk)
                  break
                case "complete":
                  setIsStreaming(false)
                  onComplete?.()
                  break
                case "error":
                  setError(event.data.message)
                  setIsStreaming(false)
                  break
              }
            } catch {
              // Ignore parse errors for incomplete chunks
            }
          }
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error")
      setIsStreaming(false)
    } finally {
      setIsSubmitting(false)
    }
  }, [onComplete])

  const handlePasswordSuccess = useCallback(() => {
    setIsAuthenticated(true)
    setShowPasswordDialog(false)
    // Submit the pending question
    if (pendingQuestion) {
      const question = pendingQuestion
      setPendingQuestion(null)
      handleSubmitInternal(question)
    }
  }, [pendingQuestion, handleSubmitInternal])

  const handlePasswordCancel = useCallback(() => {
    setShowPasswordDialog(false)
    setPendingQuestion(null)
  }, [])

  const handleSubmit = useCallback((question: string) => {
    // Check if password is required and user is not authenticated
    if (requiresPassword && !isAuthenticated) {
      setPendingQuestion(question)
      setShowPasswordDialog(true)
      return
    }

    // Otherwise, proceed with submission
    handleSubmitInternal(question)
  }, [requiresPassword, isAuthenticated, handleSubmitInternal])

  return (
    <>
      <SessionPasswordDialog
        open={showPasswordDialog}
        onSuccess={handlePasswordSuccess}
        onCancel={handlePasswordCancel}
      />
      <div className="flex h-full flex-col p-4 md:p-6">
        <ScrollArea className="flex-1">
        <div className="mx-auto max-w-3xl space-y-6">
          {/* Current Question Display */}
          {currentQuestion && (
            <div className="ai-card rounded-xl p-4">
              <div className="flex items-start gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-purple-100 dark:bg-purple-900/30">
                  <MessageSquare className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground">Your Question</p>
                  <p className="mt-1 text-sm font-medium">{currentQuestion}</p>
                </div>
              </div>
            </div>
          )}

          {/* Error Display */}
          {error && (
            <div className="ai-card rounded-xl border-destructive/50 p-4">
              <div className="flex items-start gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-destructive/10">
                  <AlertCircle className="h-4 w-4 text-destructive" />
                </div>
                <div>
                  <p className="text-xs font-medium text-destructive">Error</p>
                  <p className="mt-1 text-sm text-destructive">{error}</p>
                </div>
              </div>
            </div>
          )}

          {/* Reasoning Timeline */}
          {reasoningSteps.length > 0 && (
            <ReasoningTimeline
              steps={reasoningSteps}
              isComplete={!isStreaming && !isSubmitting}
            />
          )}

          {/* Answer Display */}
          <AnswerDisplay answer={answer} isStreaming={isStreaming} />

          {/* Empty State */}
          {!currentQuestion && !isSubmitting && (
            <div className="mx-auto max-w-2xl px-4 py-16 text-center">
              {/* Hero Icon */}
              <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-linear-to-br from-purple-500 to-blue-500 shadow-lg">
                <Sparkles className="h-10 w-10 text-white" />
              </div>

              <h2 className="gradient-text text-3xl font-bold">
                AI Agent Demo
              </h2>
              <p className="mx-auto mt-3 max-w-md text-sm text-muted-foreground">
                Experience advanced memory and context-aware AI that remembers your conversations.
              </p>

              {/* Feature Cards */}
              <div className="mt-8 grid gap-4 text-left sm:grid-cols-2">
                <div className="ai-card rounded-xl p-4">
                  <div className="mb-2 flex h-8 w-8 items-center justify-center rounded-lg bg-purple-100 dark:bg-purple-900/30">
                    <span className="text-sm font-bold text-purple-600 dark:text-purple-400">1</span>
                  </div>
                  <h3 className="text-sm font-semibold">Memory Check</h3>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Searches previous questions to recognize similar queries and avoid redundant processing.
                  </p>
                </div>

                <div className="ai-card rounded-xl p-4">
                  <div className="mb-2 flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/30">
                    <span className="text-sm font-bold text-blue-600 dark:text-blue-400">2</span>
                  </div>
                  <h3 className="text-sm font-semibold">Pronoun Resolution</h3>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Automatically resolves "he", "she", "it" using your recent conversation history.
                  </p>
                </div>

                <div className="ai-card rounded-xl p-4">
                  <div className="mb-2 flex h-8 w-8 items-center justify-center rounded-lg bg-cyan-100 dark:bg-cyan-900/30">
                    <span className="text-sm font-bold text-cyan-600 dark:text-cyan-400">3</span>
                  </div>
                  <h3 className="text-sm font-semibold">Context Retrieval</h3>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Retrieves relevant information from prior Q&A to provide accurate answers.
                  </p>
                </div>

                <div className="ai-card rounded-xl p-4">
                  <div className="mb-2 flex h-8 w-8 items-center justify-center rounded-lg bg-green-100 dark:bg-green-900/30">
                    <span className="text-sm font-bold text-green-600 dark:text-green-400">4</span>
                  </div>
                  <h3 className="text-sm font-semibold">Transparent Reasoning</h3>
                  <p className="mt-1 text-xs text-muted-foreground">
                    See each step in real-time so you understand exactly what the agent is doing.
                  </p>
                </div>
              </div>

              <p className="mt-6 text-xs text-muted-foreground">
                Try asking questions in sequence, or click "Sample Questions" for test scenarios.
              </p>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Question Form (fixed at bottom) */}
      <div className="mx-auto mt-4 w-full max-w-3xl space-y-2">
        {/* Sample Questions Link */}
        <div className="flex justify-end">
          <SampleQuestionsDialog />
        </div>

        <QuestionForm
          initialQuestion={selectedQuestion}
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
        />
      </div>
      </div>
    </>
  )
}
