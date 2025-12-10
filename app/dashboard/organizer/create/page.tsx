import { CreateEventForm } from "@/components/dashboard/create-event-form"
import { ErrorBoundary } from "@/components/ui/error-boundary"

export default function CreateEventPage() {
  return (
    <ErrorBoundary>
      <div className="space-y-8 max-w-4xl">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Create Event</h1>
          <p className="text-foreground/60 mt-1">Fill in the details below to create a new event.</p>
        </div>

        <CreateEventForm />
      </div>
    </ErrorBoundary>
  )
}
