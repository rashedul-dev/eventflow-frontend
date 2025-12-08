"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, Mail, ArrowLeft, CheckCircle, AlertCircle } from "lucide-react"
import { useAuth } from "@/lib/auth/auth-context"
import { cn } from "@/lib/utils"
import { forgotPasswordSchema } from "@/lib/validations"
import { zodErrorsToRecord, mapApiErrorsToFields } from "@/lib/validations/helpers"

export function ForgotPasswordForm() {
  const { forgotPassword } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [generalError, setGeneralError] = useState("")
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [email, setEmail] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setGeneralError("")
    setFieldErrors({})

    const result = forgotPasswordSchema.safeParse({ email })

    if (!result.success) {
      const errors = zodErrorsToRecord(result.error)
      setFieldErrors(errors)
      return
    }

    setIsLoading(true)

    try {
      await forgotPassword(email)
      setIsSubmitted(true)
    } catch (err: any) {
      if (err.errors && Array.isArray(err.errors)) {
        const mappedErrors = mapApiErrorsToFields(err.errors)
        setFieldErrors(mappedErrors)
      } else {
        setGeneralError(err.message || "Failed to send reset email. Please try again.")
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleEmailChange = (value: string) => {
    setEmail(value)
    if (fieldErrors.email) {
      setFieldErrors({})
    }
    setGeneralError("")
  }

  if (isSubmitted) {
    return (
      <div className="text-center">
        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-8 h-8 text-primary" />
        </div>
        <h2 className="text-xl font-semibold mb-2">Check your email</h2>
        <p className="text-muted-foreground mb-6">
          We've sent a password reset link to <strong className="text-foreground">{email}</strong>
        </p>
        <p className="text-sm text-muted-foreground mb-6">
          Didn't receive the email? Check your spam folder or{" "}
          <button onClick={() => setIsSubmitted(false)} className="text-primary hover:underline">
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
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {generalError && (
        <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm flex items-start gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{generalError}</span>
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="email">Email address</Label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            id="email"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => handleEmailChange(e.target.value)}
            className={cn("pl-10", fieldErrors.email && "border-destructive focus-visible:ring-destructive")}
            required
          />
        </div>
        {fieldErrors.email && (
          <p className="text-xs text-destructive flex items-center gap-1">
            <AlertCircle className="h-3 w-3" />
            {fieldErrors.email}
          </p>
        )}
        <p className="text-sm text-muted-foreground">
          Enter the email associated with your account and we'll send you a reset link.
        </p>
      </div>

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Sending...
          </>
        ) : (
          "Send Reset Link"
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
  )
}
