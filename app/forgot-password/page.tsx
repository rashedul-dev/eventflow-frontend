import { AuthLayout } from "@/components/auth/auth-layout";
import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";
import { ErrorBoundary } from "@/components/ui/error-boundary";

export const metadata = {
  title: "Forgot Password | EventFlow",
  description: "Reset your EventFlow account password.",
};

export default function ForgotPasswordPage() {
  return (
    <ErrorBoundary>
      <AuthLayout title="Forgot password?" description="No worries, we'll send you reset instructions">
        <ForgotPasswordForm />
      </AuthLayout>
    </ErrorBoundary>
  );
}
