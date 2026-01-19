"use client"

import { useState, useRef, useCallback } from "react"
import { AppShell } from "@/components/layout"
import { MemoryPanel, type MemoryPanelRef } from "@/components/memory"
import { AgentPanel } from "@/components/agent"

interface MemoryRun {
  id: string
  question: string
  createdAt: string
}

interface MainContentProps {
  initialRuns: MemoryRun[]
  initialTotalPages: number
}

/**
 * Main Content
 *
 * Client component that manages state between Memory Panel and Agent Panel.
 * - Receives initial data from server (no useEffect for data loading)
 * - Handles question selection from sidebar
 * - Passes selected question to agent panel
 * - Refreshes sidebar when agent completes answering
 */
export function MainContent({ initialRuns, initialTotalPages }: MainContentProps) {
  const [selectedQuestion, setSelectedQuestion] = useState<string | undefined>()
  const memoryPanelRef = useRef<MemoryPanelRef>(null)

  const handleComplete = useCallback(() => {
    memoryPanelRef.current?.refresh()
  }, [])

  return (
    <AppShell
      sidebar={
        <MemoryPanel
          ref={memoryPanelRef}
          initialRuns={initialRuns}
          initialTotalPages={initialTotalPages}
          onSelectQuestion={setSelectedQuestion}
        />
      }
    >
      <AgentPanel selectedQuestion={selectedQuestion} onComplete={handleComplete} />
    </AppShell>
  )
}
