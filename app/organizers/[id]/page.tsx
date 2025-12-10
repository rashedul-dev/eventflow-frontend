import { Suspense } from "react"
import { OrganizerProfile } from "@/components/organizers/organizer-profile"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"

export const metadata = {
  title: "Organizer Profile | EventFlow",
  description: "View organizer profile and events.",
}

export default async function OrganizerProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8">
        <Suspense fallback={<div className="h-96 animate-pulse bg-muted rounded-lg" />}>
          <OrganizerProfile organizerId={id} />
        </Suspense>
      </main>
      <Footer />
    </div>
  )
}
