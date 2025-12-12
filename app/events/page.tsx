import { Suspense } from "react";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { EventFilters } from "@/components/events/event-filters";
import { EventList } from "@/components/events/event-list";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import { Skeleton } from "@/components/ui/skeleton";

export const metadata = {
  title: "Discover Events | EventFlow",
  description: "Find and book tickets for amazing events near you.",
};

function EventListSkeleton() {
  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="rounded-2xl bg-card border border-border overflow-hidden">
          <Skeleton className="aspect-16/10" />
          <div className="p-5 space-y-3">
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-4 w-2/3" />
            <div className="flex justify-between pt-4 border-t border-border">
              <Skeleton className="h-8 w-24" />
              <Skeleton className="h-8 w-16" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function EventsPage() {
  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-background">
        <Header />
        <main className="pt-20">
          {/* Hero */}
          <section className="bg-card border-b border-border">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
              <div className="max-w-3xl">
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
                  Discover <span className="gradient-text">Amazing Events</span>
                </h1>
                <p className="text-lg text-muted-foreground">
                  Find concerts, conferences, workshops, and more happening near you or online.
                </p>
              </div>
            </div>
          </section>

          {/* Filters & Events */}
          <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 min-h-screen">
            <div>
              <div className="mb-8">
                <Suspense fallback={<div>Loading filters...</div>}>
                  <EventFilters />
                </Suspense>
              </div>

              <Suspense fallback={<EventListSkeleton />}>
                <EventList />
              </Suspense>
            </div>
          </section>
        </main>
        <Footer />
      </div>
    </ErrorBoundary>
  );
}
