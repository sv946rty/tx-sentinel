"use client"

import { useState, useEffect } from "react"
import { Send } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"

interface QuestionFormProps {
  initialQuestion?: string
  onSubmit: (question: string) => void
  isSubmitting: boolean
}

/**
 * Question Form
 *
 * Input form for submitting questions to the agent.
 * - Validates with Zod (via parent)
 * - Triggers Server Action on submit
 */
export function QuestionForm({
  initialQuestion = "",
  onSubmit,
  isSubmitting,
}: QuestionFormProps) {
  const [question, setQuestion] = useState(initialQuestion)

  // Update question when initialQuestion changes (from sidebar selection)
  // Use useEffect to avoid updating state during render
  useEffect(() => {
    if (initialQuestion && initialQuestion !== question && !isSubmitting) {
      setQuestion(initialQuestion)
    }
  }, [initialQuestion]) // Only run when initialQuestion changes
  // Note: We intentionally don't include 'question' or 'isSubmitting' in deps
  // to allow editing after the initial update

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (question.trim() && !isSubmitting) {
      onSubmit(question.trim())
      // Clear input after successful submission
      setQuestion("")
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="relative">
      <div className="ai-card overflow-hidden rounded-xl">
        <Textarea
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask a question... (Press Enter to send, Shift+Enter for new line)"
          className="min-h-25 resize-none border-0 bg-transparent pr-14 shadow-none focus-visible:ring-0"
          disabled={isSubmitting}
          maxLength={2000}
        />
        <div className="flex items-center justify-between border-t border-border/50 px-3 py-2">
          <p className="text-xs text-muted-foreground">
            {question.length}/2000
          </p>
          <Button
            type="submit"
            size="sm"
            disabled={!question.trim() || isSubmitting}
            className="gradient-primary h-8 px-4 text-white hover:opacity-90"
          >
            <Send className="mr-2 h-3.5 w-3.5" />
            Send
          </Button>
        </div>
      </div>
    </form>
  )
}
