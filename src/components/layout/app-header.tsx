import { ThemeToggle } from "@/components/theme"
import { UserMenu } from "@/components/auth"
import { Menu, Sparkles, Github } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

interface AppHeaderProps {
  onToggleSidebar?: () => void
}

/**
 * App Header
 *
 * Contains:
 * - Sidebar toggle (hamburger menu)
 * - Logo with AI branding
 * - GitHub repository link
 * - Theme toggle
 * - User menu
 */
export function AppHeader({ onToggleSidebar }: AppHeaderProps) {
  return (
    <header className="ai-header sticky top-0 z-50 flex h-14 items-center gap-4 px-4">
      <Button
        variant="ghost"
        size="icon"
        className="text-white/90 hover:bg-white/10 hover:text-white md:hidden"
        onClick={onToggleSidebar}
        aria-label="Toggle sidebar"
      >
        <Menu className="h-5 w-5" />
      </Button>

      <div className="flex flex-1 items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/20 backdrop-blur-sm">
          <Sparkles className="h-4 w-4 text-white" />
        </div>
        <h1 className="text-lg font-semibold tracking-tight text-white">
          AI Agent
        </h1>
        <span className="hidden rounded-full bg-white/20 px-2 py-0.5 text-xs font-medium text-white/90 sm:inline-block">
          Demo
        </span>
      </div>

      <div className="flex items-center gap-2">
        <Link
          href="https://github.com/sv946rty/tx-sentinel"
          target="_blank"
          rel="noopener noreferrer"
          className="flex h-9 w-9 items-center justify-center rounded-md text-white/90 transition-colors hover:bg-white/10 hover:text-white cursor-pointer"
          aria-label="View source on GitHub"
        >
          <Github className="h-5 w-5" />
        </Link>
        <ThemeToggle />
        <UserMenu />
      </div>
    </header>
  )
}
