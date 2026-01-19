"use client"

import { useState, useTransition } from "react"
import { formatDistanceToNow } from "date-fns"
import { Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { deleteAgentRun } from "@/actions"

interface MemoryListItemProps {
  id: string
  question: string
  createdAt: string
  onSelect: (id: string, question: string) => void
  onDelete: (id: string) => void
}

/**
 * Memory List Item
 *
 * Displays a prior question in the sidebar.
 * Clicking populates the input field (does NOT auto-trigger agent).
 * Includes delete button to remove the question.
 */
export function MemoryListItem({
  id,
  question,
  createdAt,
  onSelect,
  onDelete,
}: MemoryListItemProps) {
  const [isPending, startTransition] = useTransition()
  const [isDeleting, setIsDeleting] = useState(false)

  const truncatedQuestion =
    question.length > 80 ? question.slice(0, 80) + "..." : question

  const timeAgo = formatDistanceToNow(new Date(createdAt), { addSuffix: true })

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation()
    setIsDeleting(true)
    startTransition(async () => {
      const result = await deleteAgentRun(id)
      if (result.success) {
        onDelete(id)
      } else {
        setIsDeleting(false)
      }
    })
  }

  if (isDeleting) {
    return (
      <div className="h-16 animate-pulse rounded-lg bg-muted opacity-50" />
    )
  }

  return (
    <div className="group relative">
      <button
        onClick={() => onSelect(id, question)}
        className="w-full rounded-lg p-3 pr-10 text-left transition-all hover:bg-sidebar-accent"
        disabled={isPending}
      >
        <p className="text-sm font-medium leading-snug text-sidebar-foreground transition-none">
          {truncatedQuestion}
        </p>
        <p className="mt-1 text-xs text-sidebar-foreground/60 transition-none">{timeAgo}</p>
      </button>
      <Button
        variant="ghost"
        size="icon"
        className="absolute right-1 top-1/2 h-7 w-7 -translate-y-1/2 opacity-0 transition-opacity group-hover:opacity-100"
        onClick={handleDelete}
        disabled={isPending}
      >
        <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive" />
      </Button>
    </div>
  )
}
