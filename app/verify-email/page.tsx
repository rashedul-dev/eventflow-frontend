import { Suspense } from "react"
import { AuthLayout } from "@/components/auth/auth-layout"
import { VerifyEmailForm } from "@/components/auth/verify-email-form"
import { ErrorBoundary } from "@/components/ui/error-boundary"

export const metadata = {
  title: "Verify Email | EventFlow",
  description: "Verify your email address to complete your EventFlow account setup.",
}

export default function VerifyEmailPage() {
  return (
    <ErrorBoundary>
      <AuthLayout title="Verify your email" description="Complete your account setup">
        <Suspense fallback={<div className="h-64 animate-pulse bg-muted rounded-lg" />}>
          <VerifyEmailForm />
        </Suspense>
      </AuthLayout>
    </ErrorBoundary>
  )
}
