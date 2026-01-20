"use client"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Brain, Search, Zap } from "lucide-react"

interface SearchAnalyticsProps {
  searchMethod?: "vector_similarity" | "text_search"
  similarityScore?: number
  resultsCount?: number
}

/**
 * SearchAnalytics Component
 *
 * Displays visual indicator of search method and similarity scores.
 * Used to showcase vector database functionality in the UI.
 *
 * - Brain icon + purple theme = Vector semantic search
 * - Search icon + gray theme = Text fallback search
 * - Similarity score badge shows match confidence
 */
export function SearchAnalytics({
  searchMethod = "text_search",
  similarityScore,
  resultsCount = 0,
}: SearchAnalyticsProps) {
  const isVectorSearch = searchMethod === "vector_similarity"

  return (
    <Card
      className={`mt-2 p-3 ${
        isVectorSearch
          ? "border-purple-200 bg-purple-50 dark:border-purple-800 dark:bg-purple-950/30"
          : "border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-900/30"
      }`}
    >
      <div className="flex items-center gap-3">
        {isVectorSearch ? (
          <Brain className="h-4 w-4 text-purple-600 dark:text-purple-400" />
        ) : (
          <Search className="h-4 w-4 text-gray-600 dark:text-gray-400" />
        )}

        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium">
              {isVectorSearch ? "Semantic Search" : "Text Search"}
            </span>
            <Badge
              variant={isVectorSearch ? "default" : "secondary"}
              className="text-[10px] px-1.5 py-0"
            >
              {searchMethod}
            </Badge>
          </div>

          {(resultsCount > 0 || similarityScore !== undefined) && (
            <div className="mt-1 flex items-center gap-3 text-[10px] text-muted-foreground">
              {resultsCount > 0 && <span>{resultsCount} result{resultsCount !== 1 ? 's' : ''}</span>}
              {similarityScore !== undefined && (
                <span className="flex items-center gap-1">
                  <Zap className="h-3 w-3" />
                  {(similarityScore * 100).toFixed(1)}% match
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </Card>
  )
}
