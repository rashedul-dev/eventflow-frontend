import { Suspense } from "react"
import { AuthLayout } from "@/components/auth/auth-layout"
import { LoginForm } from "@/components/auth/login-form"
import { ErrorBoundary } from "@/components/ui/error-boundary"

export const metadata = {
  title: "Sign In | EventFlow",
  description: "Sign in to your EventFlow account to manage events and tickets.",
}

export default function LoginPage() {
  return (
    <ErrorBoundary>
      <AuthLayout title="Welcome back" description="Sign in to continue to EventFlow">
        <Suspense fallback={<div className="h-96 animate-pulse bg-muted rounded-lg" />}>
          <LoginForm />
        </Suspense>
      </AuthLayout>
    </ErrorBoundary>
  )
}
