"use client"

import { useTheme } from "next-themes"
import { Moon, Sun } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useSyncExternalStore } from "react"

// Subscribe/getSnapshot for tracking client-side mount status
const emptySubscribe = () => () => {}
const getClientSnapshot = () => true
const getServerSnapshot = () => false

/**
 * Theme Toggle Button
 *
 * Minimal client component for toggling light/dark mode.
 * Uses next-themes for theme management.
 */
export function ThemeToggle() {
  const { theme, setTheme } = useTheme()

  // Use useSyncExternalStore to avoid hydration mismatch
  const mounted = useSyncExternalStore(
    emptySubscribe,
    getClientSnapshot,
    getServerSnapshot
  )

  if (!mounted) {
    return (
      <Button
        variant="ghost"
        size="icon"
        disabled
        className="text-white/90 hover:bg-white/10 hover:text-white"
      >
        <Sun className="h-4 w-4" />
      </Button>
    )
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
      className="text-white/90 hover:bg-white/10 hover:text-white"
    >
      {theme === "dark" ? (
        <Sun className="h-4 w-4" />
      ) : (
        <Moon className="h-4 w-4" />
      )}
    </Button>
  )
}
