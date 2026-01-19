"use client"

import { signOut } from "@/lib/auth/client"
import { Button } from "@/components/ui/button"
import { LogOut } from "lucide-react"

/**
 * Sign-Out Button
 *
 * Client component for signing out the user.
 * Uses Better Auth client for authentication.
 */
export function SignOutButton() {
  const handleSignOut = async () => {
    await signOut({
      fetchOptions: {
        onSuccess: () => {
          // Redirect to home page after sign out
          window.location.href = "/"
        },
      },
    })
  }

  return (
    <Button variant="ghost" size="sm" onClick={handleSignOut}>
      <LogOut className="mr-2 h-4 w-4" />
      Sign out
    </Button>
  )
}
