import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { GoogleSignInButton, GitHubSignInButton } from "@/components/auth"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Eye } from "lucide-react"

/**
 * Sign-In Page
 *
 * Server Component that displays the sign-in form.
 * Redirects to home if already authenticated.
 */
export default async function SignInPage() {
  // Check if user is already authenticated
  let session = null

  try {
    session = await auth.api.getSession({
      headers: await headers(),
    })
  } catch {
    // No session or error - continue to show sign-in page
  }

  if (session) {
    redirect("/")
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-linear-to-r from-slate-300 to-slate-400 p-4 sm:p-6 lg:p-8 dark:from-slate-900 dark:to-slate-700">
      {/* Main container */}
      <div className="relative z-10 w-full max-w-md lg:max-w-4xl">
        <div className="relative w-full overflow-hidden rounded-2xl bg-white shadow-2xl sm:rounded-3xl lg:grid lg:min-h-175 lg:grid-cols-2 dark:bg-card">
          {/* Left side - Branding Panel */}
          <div className="relative hidden bg-linear-to-br from-slate-600 to-slate-900 lg:flex lg:flex-col lg:px-8 lg:pb-6 lg:pt-12 xl:px-12">
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={{
                backgroundImage: "url('/leo_visions.jpg')",
                opacity: 0.8,
              }}
            />

            <div className="relative z-10 flex justify-center">
              <h1 className="rounded-lg bg-primary/40 px-4 py-2 font-serif text-2xl font-bold italic text-white shadow-lg backdrop-blur-md xl:px-6 xl:py-3 xl:text-4xl">
                AI Agent Demo
              </h1>
            </div>

            <div className="flex-1" />

            <div className="relative z-10 flex justify-center">
              <p className="max-w-sm rounded-lg bg-primary/20 px-4 py-2 text-center text-xs leading-relaxed text-white shadow-lg backdrop-blur-md xl:text-sm">
                Think. Remember. Decide.
              </p>
            </div>
          </div>

          {/* Right side - Form Panel */}
          <div className="relative flex items-center justify-center bg-gray-50 p-4 py-8 sm:p-6 sm:py-10 lg:p-8 xl:p-12 dark:bg-card">
            <div className="flex w-full max-w-sm flex-col">
              {/* Header */}
              <div className="mb-6 space-y-1 text-center">
                <h2 className="text-2xl font-semibold">Sign in</h2>
                <p className="text-sm text-muted-foreground">
                  Welcome back! Please sign in to continue
                </p>
              </div>

              {/* Form content */}
              <div className="space-y-4">
                {/* OAuth buttons */}
                <div className="grid grid-cols-2 gap-3">
                  <GitHubSignInButton />
                  <GoogleSignInButton />
                </div>

                {/* Divider */}
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-border" />
                  </div>
                  <div className="relative flex justify-center text-xs">
                    <span className="bg-gray-50 px-2 text-muted-foreground dark:bg-card">
                      or
                    </span>
                  </div>
                </div>

                {/* Email field */}
                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-medium">
                    Email
                  </label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="admin@localhost.com"
                    defaultValue="admin@localhost.com"
                    className="bg-muted/50"
                    readOnly
                  />
                </div>

                {/* Password field */}
                <div className="space-y-2">
                  <label htmlFor="password" className="text-sm font-medium">
                    Password
                  </label>
                  <div className="relative">
                    <Input
                      id="password"
                      type="password"
                      defaultValue="password123"
                      className="bg-muted/50 pr-10"
                      readOnly
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                      tabIndex={-1}
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Forgot password link */}
                <div className="flex justify-end">
                  <span className="cursor-not-allowed text-sm text-purple-600 hover:underline">
                    Forgot password?
                  </span>
                </div>

                {/* Continue button */}
                <Button
                  className="w-full bg-purple-600 hover:bg-purple-700"
                  disabled
                >
                  Continue &rarr;
                </Button>

                {/* Sign up link */}
                <p className="text-center text-sm text-muted-foreground">
                  Don&apos;t have an account?{" "}
                  <span className="cursor-not-allowed font-medium text-purple-600 hover:underline">
                    Sign up
                  </span>
                </p>

                {/* Terms */}
                <p className="text-center text-xs text-muted-foreground">
                  By continuing, you accept our{" "}
                  <span className="cursor-not-allowed underline underline-offset-4">
                    Terms of Service
                  </span>{" "}
                  and agree to occasional emails. See our{" "}
                  <span className="cursor-not-allowed underline underline-offset-4">
                    Privacy Policy
                  </span>{" "}
                  to learn how we use your data.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
