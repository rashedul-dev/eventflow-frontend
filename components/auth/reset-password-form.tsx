"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, Lock, Eye, EyeOff, CheckCircle, AlertCircle, CheckCircle2 } from "lucide-react"
import { useAuth } from "@/lib/auth/auth-context"
import { cn } from "@/lib/utils"
import { resetPasswordSchema } from "@/lib/validations"
import { zodErrorsToRecord, mapApiErrorsToFields } from "@/lib/validations/helpers"

export function ResetPasswordForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get("token")
  const { resetPassword } = useAuth()

  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [generalError, setGeneralError] = useState("")
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: "",
  })

  const getPasswordStrength = (password: string) => {
    let strength = 0
    if (password.length >= 8) strength++
    if (/[a-z]/.test(password)) strength++
    if (/[A-Z]/.test(password)) strength++
    if (/\d/.test(password)) strength++
    if (/[@$!%*?&]/.test(password)) strength++
    return strength
  }

  const passwordStrength = getPasswordStrength(formData.password)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setGeneralError("")
    setFieldErrors({})

    // Check passwords match
    if (formData.password !== formData.confirmPassword) {
      setFieldErrors({ confirmPassword: "Passwords do not match" })
      return
    }

    if (!token) {
      setGeneralError("Invalid or missing reset token. Please request a new password reset link.")
      return
    }

    const result = resetPasswordSchema.safeParse({
      token,
      password: formData.password,
    })

    if (!result.success) {
      const errors = zodErrorsToRecord(result.error)
      setFieldErrors(errors)
      return
    }

    setIsLoading(true)

    try {
      await resetPassword(token, formData.password)
      setIsSuccess(true)
      setTimeout(() => router.push("/login"), 3000)
    } catch (err: any) {
      if (err.errors && Array.isArray(err.errors)) {
        const mappedErrors = mapApiErrorsToFields(err.errors)
        setFieldErrors(mappedErrors)
      } else if (err.message?.includes("token")) {
        setGeneralError("Reset link has expired or is invalid. Please request a new one.")
      } else {
        setGeneralError(err.message || "Failed to reset password. Please try again.")
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value })
    if (fieldErrors[field]) {
      const newErrors = { ...fieldErrors }
      delete newErrors[field]
      setFieldErrors(newErrors)
    }
    setGeneralError("")
  }

  if (isSuccess) {
    return (
      <div className="text-center">
        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-8 h-8 text-primary" />
        </div>
        <h2 className="text-xl font-semibold mb-2">Password reset successful!</h2>
        <p className="text-muted-foreground mb-6">Your password has been updated. Redirecting to login...</p>
        <Button asChild>
          <Link href="/login">Continue to Login</Link>
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

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="password">New password</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="Enter new password"
              value={formData.password}
              onChange={(e) => handleInputChange("password", e.target.value)}
              className={cn("pl-10 pr-10", fieldErrors.password && "border-destructive focus-visible:ring-destructive")}
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
          {fieldErrors.password && (
            <p className="text-xs text-destructive flex items-center gap-1">
              <AlertCircle className="h-3 w-3" />
              {fieldErrors.password}
            </p>
          )}
          {formData.password && (
            <div className="text-xs text-muted-foreground space-y-1 mt-2">
              <p className="flex items-center gap-1">
                {formData.password.length >= 8 ? (
                  <CheckCircle2 className="h-3 w-3 text-green-500" />
                ) : (
                  <span className="h-3 w-3 rounded-full border border-muted-foreground inline-block" />
                )}
                At least 8 characters
              </p>
              <p className="flex items-center gap-1">
                {/[A-Z]/.test(formData.password) && /[a-z]/.test(formData.password) ? (
                  <CheckCircle2 className="h-3 w-3 text-green-500" />
                ) : (
                  <span className="h-3 w-3 rounded-full border border-muted-foreground inline-block" />
                )}
                Uppercase and lowercase letters
              </p>
              <p className="flex items-center gap-1">
                {/\d/.test(formData.password) ? (
                  <CheckCircle2 className="h-3 w-3 text-green-500" />
                ) : (
                  <span className="h-3 w-3 rounded-full border border-muted-foreground inline-block" />
                )}
                At least one number
              </p>
              <p className="flex items-center gap-1">
                {/[@$!%*?&]/.test(formData.password) ? (
                  <CheckCircle2 className="h-3 w-3 text-green-500" />
                ) : (
                  <span className="h-3 w-3 rounded-full border border-muted-foreground inline-block" />
                )}
                Special character (@$!%*?&)
              </p>
            </div>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirmPassword">Confirm new password</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              id="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Confirm new password"
              value={formData.confirmPassword}
              onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
              className={cn(
                "pl-10 pr-10",
                fieldErrors.confirmPassword && "border-destructive focus-visible:ring-destructive",
              )}
              required
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            >
              {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
          {fieldErrors.confirmPassword && (
            <p className="text-xs text-destructive flex items-center gap-1">
              <AlertCircle className="h-3 w-3" />
              {fieldErrors.confirmPassword}
            </p>
          )}
        </div>
      </div>

      <Button type="submit" className="w-full" disabled={isLoading || passwordStrength < 5}>
        {isLoading ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Resetting...
          </>
        ) : (
          "Reset Password"
        )}
      </Button>
    </form>
  )
}
