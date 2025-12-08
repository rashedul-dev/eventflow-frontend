import { Suspense } from "react"
import { AuthLayout } from "@/components/auth/auth-layout"
import { ResetPasswordForm } from "@/components/auth/reset-password-form"
import { ErrorBoundary } from "@/components/ui/error-boundary"

export const metadata = {
  title: "Reset Password | EventFlow",
  description: "Set a new password for your EventFlow account.",
}

export default function ResetPasswordPage() {
  return (
    <ErrorBoundary>
      <AuthLayout title="Reset your password" description="Enter your new password below">
        <Suspense fallback={<div className="h-64 animate-pulse bg-muted rounded-lg" />}>
          <ResetPasswordForm />
        </Suspense>
      </AuthLayout>
    </ErrorBoundary>
  )
}
