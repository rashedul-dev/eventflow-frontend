"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Eye, EyeOff, Loader2, Mail, Lock, CheckCircle, AlertCircle } from "lucide-react"
import { useAuth } from "@/lib/auth/auth-context"
import { cn } from "@/lib/utils"
import { loginSchema } from "@/lib/validations"
import { zodErrorsToRecord, mapApiErrorsToFields } from "@/lib/validations/helpers"

export function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { login, isLoading: authLoading } = useAuth()

  const registered = searchParams.get("registered")
  const verified = searchParams.get("verified")
  const redirect = searchParams.get("redirect")

  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [generalError, setGeneralError] = useState("")
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: false,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setGeneralError("")
    setFieldErrors({})

    const result = loginSchema.safeParse({
      email: formData.email,
      password: formData.password,
    })

    if (!result.success) {
      const errors = zodErrorsToRecord(result.error)
      setFieldErrors(errors)
      return
    }

    setIsLoading(true)

    try {
      await login(formData.email, formData.password)
      router.push(redirect || "/dashboard")
    } catch (err: any) {
      if (err.errors && Array.isArray(err.errors)) {
        const mappedErrors = mapApiErrorsToFields(err.errors)
        setFieldErrors(mappedErrors)
      } else if (err.statusCode === 401) {
        setGeneralError("Invalid email or password. Please check your credentials and try again.")
      } else if (err.statusCode === 403) {
        setGeneralError("Your account is suspended. Please contact support.")
      } else if (err.statusCode === 429) {
        setGeneralError("Too many login attempts. Please wait a few minutes and try again.")
      } else {
        setGeneralError(err.message || "Failed to sign in. Please try again.")
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData({ ...formData, [field]: value })
    if (fieldErrors[field]) {
      const newErrors = { ...fieldErrors }
      delete newErrors[field]
      setFieldErrors(newErrors)
    }
    setGeneralError("")
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {registered && (
        <div className="p-4 rounded-lg bg-primary/10 border border-primary/20 text-primary text-sm flex items-center gap-2">
          <CheckCircle className="w-4 h-4 shrink-0" />
          <span>Account created! Please check your email to verify your account.</span>
        </div>
      )}

      {verified && (
        <div className="p-4 rounded-lg bg-primary/10 border border-primary/20 text-primary text-sm flex items-center gap-2">
          <CheckCircle className="w-4 h-4 shrink-0" />
          <span>Email verified successfully! You can now sign in.</span>
        </div>
      )}

      {generalError && (
        <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm flex items-start gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <div>
            <p className="font-medium">Unable to sign in</p>
            <p className="mt-1 opacity-90">{generalError}</p>
          </div>
        </div>
      )}

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={formData.email}
              onChange={(e) => handleInputChange("email", e.target.value)}
              className={cn("pl-10", fieldErrors.email && "border-destructive focus-visible:ring-destructive")}
              required
              autoComplete="email"
            />
          </div>
          {fieldErrors.email && (
            <p className="text-xs text-destructive flex items-center gap-1">
              <AlertCircle className="h-3 w-3" />
              {fieldErrors.email}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Password</Label>
            <Link href="/forgot-password" className="text-sm text-primary hover:underline">
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="Enter your password"
              value={formData.password}
              onChange={(e) => handleInputChange("password", e.target.value)}
              className={cn("pl-10 pr-10", fieldErrors.password && "border-destructive focus-visible:ring-destructive")}
              required
              autoComplete="current-password"
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
        </div>

        <div className="flex items-center gap-2">
          <Checkbox
            id="remember"
            checked={formData.rememberMe}
            onCheckedChange={(checked) => handleInputChange("rememberMe", checked as boolean)}
          />
          <Label htmlFor="remember" className="text-sm font-normal cursor-pointer">
            Remember me for 30 days
          </Label>
        </div>
      </div>

      <Button type="submit" className="w-full" disabled={isLoading || authLoading}>
        {isLoading ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Signing in...
          </>
        ) : (
          "Sign In"
        )}
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        Didn't receive verification email?{" "}
        <Link href="/verify-email" className="text-primary hover:underline">
          Resend
        </Link>
      </p>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-border" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Button type="button" variant="outline" className="w-full bg-transparent" disabled>
          <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
            <path
              fill="currentColor"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="currentColor"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="currentColor"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="currentColor"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          Google
        </Button>
        <Button type="button" variant="outline" className="w-full bg-transparent" disabled>
          <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
          </svg>
          GitHub
        </Button>
      </div>

      <p className="text-center text-sm text-muted-foreground">
        Don't have an account?{" "}
        <Link href="/register" className="text-primary hover:underline font-medium">
          Sign up
        </Link>
      </p>
    </form>
  )
}
