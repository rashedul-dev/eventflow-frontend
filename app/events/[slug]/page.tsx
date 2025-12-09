import { Suspense } from "react"
import { EventDetailClient } from "@/components/events/event-detail-client"
import { ErrorBoundary } from "@/components/ui/error-boundary"
import { Loader2 } from "lucide-react"

export const metadata = {
  title: "Event Details | EventFlow",
  description: "View event details and purchase tickets.",
}

export default async function EventDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params

  return (
    <ErrorBoundary>
      <Suspense
        fallback={
          <div className="min-h-screen bg-background flex items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        }
      >
        <EventDetailClient slug={slug} />
      </Suspense>
    </ErrorBoundary>
  )
}
