"use client"

import { useState } from "react"
import { AppHeader } from "./app-header"
import { cn } from "@/lib/utils"

interface AppShellProps {
  sidebar: React.ReactNode
  children: React.ReactNode
}

/**
 * App Shell
 *
 * Two-column layout with:
 * - Left: Memory Panel (sidebar)
 * - Right: Question + Reasoning + Answer Panel
 *
 * Responsive: Sidebar collapses on mobile.
 */
export function AppShell({ sidebar, children }: AppShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="flex h-screen flex-col">
      <AppHeader onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside
          className={cn(
            "ai-sidebar fixed inset-y-0 left-0 z-40 mt-14 w-72 transform transition-transform duration-200 ease-in-out md:relative md:mt-0 md:translate-x-0",
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          )}
        >
          {sidebar}
        </aside>

        {/* Overlay for mobile */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 z-30 bg-black/50 md:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main content */}
        <main className="bg-ai-mesh flex-1 overflow-auto">{children}</main>
      </div>
    </div>
  )
}
