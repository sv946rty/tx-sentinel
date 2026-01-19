"use client"

import { useState, useTransition } from "react"
import { Lock, AlertCircle, Eye, EyeOff } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { verifySessionPassword } from "@/actions"

interface SessionPasswordDialogProps {
  open: boolean
  onSuccess: () => void
  onCancel?: () => void
}

/**
 * Session Password Dialog
 *
 * Prompts the user to enter a session password before using the app.
 * This is used for demo deployments to prevent abuse and excessive API costs.
 *
 * The password is verified server-side and only shown once per session.
 */
export function SessionPasswordDialog({
  open,
  onSuccess,
  onCancel,
}: SessionPasswordDialogProps) {
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!password.trim()) {
      setError("Please enter a password")
      return
    }

    setError(null)
    startTransition(async () => {
      const result = await verifySessionPassword(password.trim())
      if (result.success) {
        setPassword("")
        onSuccess()
      } else {
        setError(result.error || "Invalid password")
      }
    })
  }

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      if (!isOpen && onCancel) {
        onCancel()
      }
    }}>
      <DialogContent className="sm:max-w-md" onPointerDownOutside={(e) => e.preventDefault()}>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100 dark:bg-purple-900/30">
                <Lock className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              </div>
              <DialogTitle>Session Password Required</DialogTitle>
            </div>
            <DialogDescription className="pt-4">
              This demo requires a password to prevent excessive API costs. Please
              enter the session password to continue.
            </DialogDescription>
          </DialogHeader>

          <div className="py-6">
            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="Enter password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value)
                  setError(null)
                }}
                disabled={isPending}
                className="w-full pr-10"
                autoFocus
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowPassword(!showPassword)}
                disabled={isPending}
                tabIndex={-1}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <Eye className="h-4 w-4 text-muted-foreground" />
                )}
              </Button>
            </div>
            {error && (
              <div className="mt-3 flex items-center gap-2 rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
                <AlertCircle className="h-4 w-4" />
                <span>{error}</span>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              type="submit"
              disabled={!password.trim() || isPending}
              className="gradient-primary w-full text-white hover:opacity-90 sm:w-auto"
            >
              {isPending ? "Verifying..." : "Continue"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
