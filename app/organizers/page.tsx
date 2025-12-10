import { Suspense } from "react";
import { OrganizersList } from "@/components/organizers/organizers-list";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";

export const metadata = {
  title: "Event Organizers | EventFlow",
  description: "Discover amazing event organizers on EventFlow.",
};

export default function OrganizersPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="space-y-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Event Organizers</h1>
            <p className="text-foreground/60 mt-1">Discover talented event organizers and their upcoming events.</p>
          </div>

          <Suspense fallback={<OrganizersSkeleton />}>
            <OrganizersList />
          </Suspense>
        </div>
      </main>
      <Footer />
    </div>
  );
}

function OrganizersSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="h-64 bg-secondary/30 rounded-xl animate-pulse" />
      ))}
    </div>
  );
}
