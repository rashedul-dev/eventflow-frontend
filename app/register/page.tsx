import { Suspense } from "react"
import { AuthLayout } from "@/components/auth/auth-layout"
import { RegisterForm } from "@/components/auth/register-form"
import { ErrorBoundary } from "@/components/ui/error-boundary"

export const metadata = {
  title: "Create Account | EventFlow",
  description: "Create your EventFlow account to discover and host amazing events.",
}

export default function RegisterPage() {
  return (
    <ErrorBoundary>
      <AuthLayout title="Create your account" description="Start creating unforgettable events">
        <Suspense fallback={<div className="h-96 animate-pulse bg-muted rounded-lg" />}>
          <RegisterForm />
        </Suspense>
      </AuthLayout>
    </ErrorBoundary>
  )
}
