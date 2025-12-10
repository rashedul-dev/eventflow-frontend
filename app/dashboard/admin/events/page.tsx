import { Suspense } from "react"
import { AdminEventsList } from "@/components/admin/admin-events-list"

export const metadata = {
  title: "Event Verification | EventFlow Admin",
  description: "Review and approve pending events.",
}

export default function AdminEventsPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Event Verification</h1>
        <p className="text-foreground/60 mt-1">Review and approve pending events.</p>
      </div>

      <Suspense fallback={<div className="h-96 animate-pulse bg-muted rounded-lg" />}>
        <AdminEventsList />
      </Suspense>
    </div>
  )
}
