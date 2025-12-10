import { Suspense } from "react";
import { BecomeOrganizerForm } from "@/components/dashboard/become-organizer-form";
import { AuthGuard } from "@/components/auth/auth-guard";

export const metadata = {
  title: "Become an Organizer | EventFlow",
  description: "Upgrade your account to start creating and managing events.",
};

export default function BecomeOrganizerPage() {
  return (
    <AuthGuard allowedRoles={["ATTENDEE"]}>
      <div className="space-y-8 max-w-2xl">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Become an Organizer</h1>
          <p className="text-foreground/60 mt-1">Upgrade your account to create and manage your own events.</p>
        </div>

        <Suspense fallback={<div className="h-96 animate-pulse bg-muted rounded-lg" />}>
          <BecomeOrganizerForm />
        </Suspense>
      </div>
    </AuthGuard>
  );
}
