import { Suspense } from "react"
import { SettingsForm } from "@/components/dashboard/settings-form"

export const metadata = {
  title: "Settings | EventFlow",
  description: "Manage your account settings and preferences.",
}

export default function SettingsPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Settings</h1>
        <p className="text-foreground/60 mt-1">Manage your account settings and preferences.</p>
      </div>

      <Suspense fallback={<div className="h-96 animate-pulse bg-muted rounded-lg" />}>
        <SettingsForm />
      </Suspense>
    </div>
  )
}
