"use client"

import { CheckCircle2, Circle, Loader2, Brain } from "lucide-react"
import type { ReasoningStep } from "@/lib/schemas"
import { SearchAnalytics } from "@/components/memory/search-analytics"

interface ReasoningTimelineProps {
  steps: ReasoningStep[]
  isComplete: boolean
}

/**
 * Reasoning Timeline
 *
 * Displays the agent's reasoning steps in a user-facing timeline.
 * Shows what the agent is doing, NOT how it thinks.
 *
 * Rules:
 * - High-level, structured steps
 * - Intentionally authored, not raw LLM thought
 * - Streamed progressively
 *
 * The timeline MUST NOT display:
 * - Internal prompts
 * - Chain-of-thought text
 * - SQL queries
 * - Tool payloads
 */
export function ReasoningTimeline({ steps, isComplete }: ReasoningTimelineProps) {
  if (steps.length === 0) {
    return null
  }

  return (
    <div className="ai-card rounded-xl p-4">
      <div className="mb-4 flex items-center gap-2">
        <div className="flex h-7 w-7 items-center justify-center rounded-md bg-cyan-100 dark:bg-cyan-900/30">
          <Brain className="h-4 w-4 text-cyan-600 dark:text-cyan-400" />
        </div>
        <h3 className="text-sm font-semibold">Reasoning</h3>
        {!isComplete && (
          <span className="ml-auto flex items-center gap-1.5 text-xs text-muted-foreground">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-purple-400 opacity-75"></span>
              <span className="relative inline-flex h-2 w-2 rounded-full bg-purple-500"></span>
            </span>
            Thinking...
          </span>
        )}
      </div>
      <div className="space-y-0">
        {steps.map((step, index) => {
          const isLast = index === steps.length - 1
          const showSpinner = isLast && !isComplete
          const isDone = isComplete || !isLast

          return (
            <div
              key={`${step.step}-${step.timestamp}`}
              className={`timeline-connector flex items-start gap-3 pb-3 ${isLast ? 'pb-0' : ''}`}
            >
              <div className="mt-0.5 shrink-0">
                {showSpinner ? (
                  <div className="flex h-4 w-4 items-center justify-center rounded-full bg-purple-100 dark:bg-purple-900/50">
                    <Loader2 className="h-3 w-3 animate-spin text-purple-600 dark:text-purple-400" />
                  </div>
                ) : isDone ? (
                  <div className="flex h-4 w-4 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/50">
                    <CheckCircle2 className="h-3 w-3 text-green-600 dark:text-green-400" />
                  </div>
                ) : (
                  <div className="flex h-4 w-4 items-center justify-center rounded-full bg-muted">
                    <Circle className="h-3 w-3 text-muted-foreground" />
                  </div>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className={`text-sm leading-relaxed ${isDone ? 'text-foreground' : 'text-muted-foreground'}`}>
                  {step.description}
                </p>
                {step.searchAnalytics && (
                  <SearchAnalytics
                    searchMethod={step.searchAnalytics.searchMethod}
                    similarityScore={step.searchAnalytics.similarityScore}
                    resultsCount={step.searchAnalytics.resultsCount}
                  />
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
