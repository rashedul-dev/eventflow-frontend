"use client";

import type React from "react";
import { Suspense } from "react";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, CheckCircle, XCircle, Mail, ArrowLeft } from "lucide-react";
import { authApi } from "@/lib/api";
import Loading from "@/app/dashboard/admin/reports/loading";


export default function Page() {
  return (
    <Suspense fallback={<div>{<Loading />}</div>}>
      <VerifyEmailForm />
    </Suspense>
  );
}

export function VerifyEmailForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const emailParam = searchParams.get("email");

  const [isLoading, setIsLoading] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [isResent, setIsResent] = useState(false);
  const [error, setError] = useState("");
  const [email, setEmail] = useState(emailParam || "");

  // Auto-verify if token is present in URL
  useEffect(() => {
    if (token && !isVerified && !error) {
      verifyWithToken(token);
    }
  }, [token]);

  const verifyWithToken = async (verifyToken: string) => {
    setIsVerifying(true);
    setError("");

    try {
      await authApi.verifyEmail(verifyToken);
      setIsVerified(true);
      // Redirect to login after 3 seconds
      setTimeout(() => router.push("/login?verified=true"), 3000);
    } catch (err: any) {
      setError(err.message || "Failed to verify email. The link may have expired.");
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResendVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError("Please enter your email address");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      await authApi.resendVerification(email);
      setIsResent(true);
    } catch (err: any) {
      setError(err.message || "Failed to resend verification email");
    } finally {
      setIsLoading(false);
    }
  };

  // Verifying state (when token is in URL)
  if (isVerifying) {
    return (
      <div className="text-center py-8">
        <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
        <h2 className="text-xl font-semibold mb-2">Verifying your email...</h2>
        <p className="text-muted-foreground">Please wait while we verify your email address.</p>
      </div>
    );
  }

  // Success state
  if (isVerified) {
    return (
      <div className="text-center py-8">
        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-8 h-8 text-primary" />
        </div>
        <h2 className="text-xl font-semibold mb-2">Email verified!</h2>
        <p className="text-muted-foreground mb-6">
          Your email has been successfully verified. You can now sign in to your account.
        </p>
        <Button asChild>
          <Link href="/login">Continue to Login</Link>
        </Button>
      </div>
    );
  }

  // Resend success state
  if (isResent) {
    return (
      <div className="text-center py-8">
        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
          <Mail className="w-8 h-8 text-primary" />
        </div>
        <h2 className="text-xl font-semibold mb-2">Verification email sent!</h2>
        <p className="text-muted-foreground mb-6">
          We've sent a new verification link to <strong className="text-foreground">{email}</strong>
        </p>
        <p className="text-sm text-muted-foreground mb-6">
          Didn't receive the email? Check your spam folder or{" "}
          <button onClick={() => setIsResent(false)} className="text-primary hover:underline">
            try again
          </button>
        </p>
        <Button asChild variant="outline" className="gap-2 bg-transparent">
          <Link href="/login">
            <ArrowLeft className="w-4 h-4" />
            Back to login
          </Link>
        </Button>
      </div>
    );
  }

  // Error state with token (verification failed)
  if (error && token) {
    return (
      <div className="text-center py-8">
        <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-6">
          <XCircle className="w-8 h-8 text-destructive" />
        </div>
        <h2 className="text-xl font-semibold mb-2">Verification failed</h2>
        <p className="text-muted-foreground mb-6">{error}</p>

        <form onSubmit={handleResendVerification} className="space-y-4 max-w-sm mx-auto">
          <div className="space-y-2 text-left">
            <Label htmlFor="email">Enter your email to get a new verification link</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10"
                required
              />
            </div>
          </div>
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Sending...
              </>
            ) : (
              "Resend Verification Email"
            )}
          </Button>
        </form>

        <div className="mt-6">
          <Link
            href="/login"
            className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to login
          </Link>
        </div>
      </div>
    );
  }

  // Default state (no token - resend verification form)
  return (
    <form onSubmit={handleResendVerification} className="space-y-6">
      {error && (
        <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
          {error}
        </div>
      )}

      <div className="text-center mb-6">
        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
          <Mail className="w-8 h-8 text-primary" />
        </div>
        <p className="text-muted-foreground">Enter your email address and we'll send you a verification link.</p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Email address</Label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            id="email"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="pl-10"
            required
          />
        </div>
      </div>

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Sending...
          </>
        ) : (
          "Send Verification Email"
        )}
      </Button>

      <div className="text-center">
        <Link
          href="/login"
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to login
        </Link>
      </div>
    </form>
  );
}
