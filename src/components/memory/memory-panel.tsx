"use client"

import { useState, useTransition, useCallback, useImperativeHandle, forwardRef } from "react"
import { Search, ChevronLeft, ChevronRight, Trash2, History } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { MemoryListItem } from "./memory-list-item"
import { listAgentRuns, deleteAllAgentRuns } from "@/actions"

interface MemoryRun {
  id: string
  question: string
  createdAt: string
}

interface MemoryPanelProps {
  initialRuns: MemoryRun[]
  initialTotalPages: number
  onSelectQuestion: (question: string) => void
}

export interface MemoryPanelRef {
  refresh: () => void
}

/**
 * Memory Panel (Sidebar)
 *
 * Displays prior questions for the authenticated user.
 * - Initial data provided via props (server-side)
 * - Pagination/search use Server Actions (no useEffect)
 * - Sorted by most recent first
 * - 10 items per page with pagination
 * - Supports refresh via ref for external triggers
 *
 * The sidebar MUST NOT display:
 * - Raw reasoning
 * - Internal plans
 * - Tool execution details
 */
export const MemoryPanel = forwardRef<MemoryPanelRef, MemoryPanelProps>(
  function MemoryPanel({ initialRuns, initialTotalPages, onSelectQuestion }, ref) {
    const [runs, setRuns] = useState<MemoryRun[]>(initialRuns)
    const [page, setPage] = useState(1)
    const [totalPages, setTotalPages] = useState(initialTotalPages)
    const [search, setSearch] = useState("")
    const [searchInput, setSearchInput] = useState("")
    const [isPending, startTransition] = useTransition()

    const fetchRuns = useCallback(
      async (newPage: number, newSearch: string) => {
        startTransition(async () => {
          const result = await listAgentRuns({
            page: newPage,
            limit: 10,
            search: newSearch || undefined,
          })

          if (result.success && result.data) {
            setRuns(result.data.runs)
            setTotalPages(result.data.totalPages)
          }
        })
      },
      []
    )

    // Expose refresh method for external use (e.g., after question completion)
    useImperativeHandle(
      ref,
      () => ({
        refresh: () => {
          // Reset to page 1 and clear search when refreshing
          setPage(1)
          setSearch("")
          setSearchInput("")
          fetchRuns(1, "")
        },
      }),
      [fetchRuns]
    )

    const handleSearch = (e: React.FormEvent) => {
      e.preventDefault()
      setSearch(searchInput)
      setPage(1)
      fetchRuns(1, searchInput)
    }

    const handlePageChange = (newPage: number) => {
      setPage(newPage)
      fetchRuns(newPage, search)
    }

    const handleSelect = (_id: string, question: string) => {
      onSelectQuestion(question)
    }

    const handleDelete = (id: string) => {
      // Remove the deleted item from the local state
      setRuns((prev) => prev.filter((run) => run.id !== id))
    }

    const handleClearAll = async () => {
      if (!confirm("Are you sure you want to delete all questions? This cannot be undone.")) {
        return
      }

      startTransition(async () => {
        const result = await deleteAllAgentRuns()
        if (result.success) {
          // Clear local state
          setRuns([])
          setTotalPages(0)
          setPage(1)
          setSearch("")
          setSearchInput("")
        }
      })
    }

    return (
      <div className="flex h-full flex-col">
        {/* Header */}
        <div className="border-b border-sidebar-border px-4 py-3">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-purple-100 dark:bg-purple-900/30">
              <History className="h-4 w-4 text-purple-600 dark:text-purple-400" />
            </div>
            <h2 className="text-sm font-semibold">Memory</h2>
          </div>
        </div>

        {/* Search and Clear All */}
        <div className="space-y-2 p-3">
          <form onSubmit={handleSearch} className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search questions..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="ai-input pl-9 text-sm"
              disabled={isPending}
            />
          </form>
          {runs.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleClearAll}
              disabled={isPending}
              className="group w-full border-destructive/30 text-destructive transition-all hover:border-transparent hover:text-white [&:hover]:bg-linear-to-r [&:hover]:from-purple-600 [&:hover]:to-violet-600"
            >
              <Trash2 className="mr-2 h-3.5 w-3.5 transition-colors group-hover:text-white" />
              <span className="transition-colors group-hover:text-white">Clear All</span>
            </Button>
          )}
        </div>

        {/* List */}
        <ScrollArea className="flex-1">
          <div className="px-3 pb-3">
            {isPending ? (
              <div className="space-y-2">
                {[...Array(5)].map((_, i) => (
                  <div
                    key={i}
                    className="h-14 animate-pulse rounded-lg bg-sidebar-accent"
                  />
                ))}
              </div>
            ) : runs.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                  <History className="h-6 w-6 text-muted-foreground" />
                </div>
                <p className="text-sm font-medium text-muted-foreground">
                  {search ? "No matching questions" : "No questions yet"}
                </p>
                <p className="mt-1 text-xs text-muted-foreground/70">
                  {search ? "Try a different search term" : "Ask a question to get started"}
                </p>
              </div>
            ) : (
              <div className="space-y-1">
                {runs.map((run) => (
                  <MemoryListItem
                    key={run.id}
                    id={run.id}
                    question={run.question}
                    createdAt={run.createdAt}
                    onSelect={handleSelect}
                    onDelete={handleDelete}
                  />
                ))}
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-sidebar-border p-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handlePageChange(Math.max(1, page - 1))}
              disabled={page === 1 || isPending}
              className="h-8 w-8 p-0"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-xs text-muted-foreground">
              {page} / {totalPages}
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handlePageChange(Math.min(totalPages, page + 1))}
              disabled={page === totalPages || isPending}
              className="h-8 w-8 p-0"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
    )
  }
)
