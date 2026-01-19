import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { listAgentRunsForUser } from "@/db/queries"
import { MainContent } from "./main-content"

/**
 * Home Page
 *
 * Server Component that handles authentication and fetches initial data.
 * Redirects to sign-in if not authenticated.
 *
 * Data fetching happens here (server-side) to comply with the
 * React Performance Contract - no useEffect for data loading.
 */
export default async function HomePage() {
  let session = null

  try {
    session = await auth.api.getSession({
      headers: await headers(),
    })
  } catch (error) {
    console.error("Failed to get session:", error)
    // If session fetch fails, redirect to sign-in
  }

  if (!session) {
    redirect("/sign-in")
  }

  // Fetch initial memory data server-side
  const initialData = await listAgentRunsForUser({
    userId: session.user.id,
    page: 1,
    limit: 10,
  })

  const initialRuns = initialData.runs.map((run) => ({
    id: run.id,
    question: run.question,
    createdAt: run.createdAt.toISOString(),
  }))

  return (
    <MainContent
      initialRuns={initialRuns}
      initialTotalPages={initialData.totalPages}
    />
  )
}
