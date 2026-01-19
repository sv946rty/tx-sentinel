"use client"

import { Sparkles } from "lucide-react"
import ReactMarkdown from "react-markdown"

interface AnswerDisplayProps {
  answer: string
  isStreaming: boolean
}

/**
 * Answer Display
 *
 * Displays the agent's final answer with markdown formatting.
 * - Streamed progressively
 * - Clearly separated from reasoning
 * - Renders markdown for better readability
 */
export function AnswerDisplay({ answer, isStreaming }: AnswerDisplayProps) {
  if (!answer && !isStreaming) {
    return null
  }

  return (
    <div className="ai-card rounded-xl p-4">
      <div className="mb-4 flex items-center gap-2">
        <div className="flex h-7 w-7 items-center justify-center rounded-md bg-green-100 dark:bg-green-900/30">
          <Sparkles className="h-4 w-4 text-green-600 dark:text-green-400" />
        </div>
        <h3 className="text-sm font-semibold">Answer</h3>
        {isStreaming && (
          <span className="ml-auto flex items-center gap-1.5 text-xs text-muted-foreground">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500"></span>
            </span>
            Generating...
          </span>
        )}
      </div>
      <div className="prose prose-sm dark:prose-invert max-w-none">
            {answer ? (
              <>
                <ReactMarkdown
                  components={{
                    // Customize paragraph styling to add spacing
                    p: ({ children }) => (
                      <p className="mb-4 last:mb-0">{children}</p>
                    ),
                    // Customize headings
                    h1: ({ children }) => (
                      <h1 className="mb-4 mt-6 text-2xl font-bold first:mt-0">
                        {children}
                      </h1>
                    ),
                    h2: ({ children }) => (
                      <h2 className="mb-3 mt-5 text-xl font-semibold first:mt-0">
                        {children}
                      </h2>
                    ),
                    h3: ({ children }) => (
                      <h3 className="mb-2 mt-4 text-lg font-semibold first:mt-0">
                        {children}
                      </h3>
                    ),
                    // Customize lists for better spacing
                    ul: ({ children }) => (
                      <ul className="mb-4 ml-6 list-disc space-y-2">
                        {children}
                      </ul>
                    ),
                    ol: ({ children }) => (
                      <ol className="mb-4 ml-6 list-decimal space-y-2">
                        {children}
                      </ol>
                    ),
                    li: ({ children }) => <li className="mb-1">{children}</li>,
                    // Customize code blocks
                    code: ({ className, children }) => {
                      const isInline = !className
                      if (isInline) {
                        return (
                          <code className="rounded bg-muted px-1.5 py-0.5 text-sm font-mono">
                            {children}
                          </code>
                        )
                      }
                      return (
                        <code className="block rounded bg-muted p-3 text-sm font-mono overflow-x-auto">
                          {children}
                        </code>
                      )
                    },
                    // Customize blockquotes
                    blockquote: ({ children }) => (
                      <blockquote className="border-l-4 border-muted-foreground/20 pl-4 italic my-4">
                        {children}
                      </blockquote>
                    ),
                    // Customize links
                    a: ({ children, href }) => (
                      <a
                        href={href}
                        className="text-primary underline hover:no-underline"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {children}
                      </a>
                    ),
                  }}
                >
                  {answer}
                </ReactMarkdown>
                {isStreaming && (
                  <span className="ml-1 inline-block h-4 w-1 animate-pulse bg-primary" />
                )}
              </>
            ) : (
              <span className="text-muted-foreground">Generating...</span>
            )}
          </div>
    </div>
  )
}
