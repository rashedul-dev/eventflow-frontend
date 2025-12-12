"use client";

import type React from "react";
import { Suspense } from "react";
import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Eye, EyeOff, Loader2, Mail, Lock, User, Building, AlertCircle, CheckCircle2 } from "lucide-react";
import { useAuth } from "@/lib/auth/auth-context";
import { cn } from "@/lib/utils";
import { registerSchema } from "@/lib/validations";
import { zodErrorsToRecord, mapApiErrorsToFields } from "@/lib/validations/helpers";
import Loading from "@/app/dashboard/admin/reports/loading";


export default function Page() {
  return (
    <Suspense fallback={<div>{<Loading />}</div>}>
      <RegisterForm></RegisterForm>
    </Suspense>
  );
}

export function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isOrganizer = searchParams.get("type") === "organizer";
  const { register } = useAuth();

  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [generalError, setGeneralError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [accountType, setAccountType] = useState<"attendee" | "organizer">(isOrganizer ? "organizer" : "attendee");
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    organizationName: "",
    agreeToTerms: false,
  });

  const getPasswordStrength = (password: string): { strength: number; label: string; color: string } => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[@$!%*?&]/.test(password)) strength++;

    if (strength <= 2) return { strength, label: "Weak", color: "bg-red-500" };
    if (strength <= 3) return { strength, label: "Fair", color: "bg-yellow-500" };
    if (strength <= 4) return { strength, label: "Good", color: "bg-blue-500" };
    return { strength, label: "Strong", color: "bg-green-500" };
  };

  const passwordStrength = getPasswordStrength(formData.password);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGeneralError("");
    setFieldErrors({});

    // Manual validation for better UX
    const newErrors: Record<string, string> = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = "First name is required";
    }
    if (!formData.lastName.trim()) {
      newErrors.lastName = "Last name is required";
    }
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    }
    if (!formData.password) {
      newErrors.password = "Password is required";
    }
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    }
    if (!formData.agreeToTerms) {
      newErrors.agreeToTerms = "You must accept the terms and conditions";
    }

    // If there are basic validation errors, show them and stop
    if (Object.keys(newErrors).length > 0) {
      setFieldErrors(newErrors);
      return;
    }

    // Validate with Zod schema
    const validationData = {
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email,
      password: formData.password,
      confirmPassword: formData.confirmPassword,
      role: accountType === "organizer" ? "ORGANIZER" : "ATTENDEE",
    };

    const result = registerSchema.safeParse(validationData);

    if (!result.success) {
      const errors = zodErrorsToRecord(result.error);
      setFieldErrors(errors);
      return;
    }

    setIsLoading(true);

    try {
      await register({
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        email: formData.email.trim(),
        password: formData.password,
        role: accountType === "organizer" ? "ORGANIZER" : "ATTENDEE",
      } as any);

      router.push("/login?registered=true");
    } catch (err: any) {
      console.error("Registration error:", err);

      if (err.errors && Array.isArray(err.errors)) {
        const mappedErrors = mapApiErrorsToFields(err.errors);
        setFieldErrors(mappedErrors);
      } else if (err.message) {
        // Check if error is related to a specific field
        if (err.message.toLowerCase().includes("email")) {
          setFieldErrors({ email: err.message });
        } else if (err.message.toLowerCase().includes("password")) {
          setFieldErrors({ password: err.message });
        } else {
          setGeneralError(err.message);
        }
      } else {
        setGeneralError("Failed to create account. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData({ ...formData, [field]: value });

    // Clear field error when user starts typing
    if (fieldErrors[field]) {
      const newErrors = { ...fieldErrors };
      delete newErrors[field];
      setFieldErrors(newErrors);
    }

    // Clear general error when user makes changes
    if (generalError) {
      setGeneralError("");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {generalError && (
        <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm flex items-start gap-2">
          <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
          <span>{generalError}</span>
        </div>
      )}

      {/* Account Type Selector */}
      <div className="space-y-2">
        <Label>I want to</Label>
        <div className="grid grid-cols-2 gap-4">
          <button
            type="button"
            onClick={() => setAccountType("attendee")}
            className={cn(
              "p-4 rounded-xl border-2 text-left transition-all",
              accountType === "attendee" ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
            )}
          >
            <User
              className={cn("w-6 h-6 mb-2", accountType === "attendee" ? "text-primary" : "text-muted-foreground")}
            />
            <div className="font-medium text-foreground">Attend Events</div>
            <div className="text-xs text-muted-foreground">Discover and buy tickets</div>
          </button>
          <button
            type="button"
            onClick={() => setAccountType("organizer")}
            className={cn(
              "p-4 rounded-xl border-2 text-left transition-all",
              accountType === "organizer" ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
            )}
          >
            <Building
              className={cn("w-6 h-6 mb-2", accountType === "organizer" ? "text-primary" : "text-muted-foreground")}
            />
            <div className="font-medium text-foreground">Host Events</div>
            <div className="text-xs text-muted-foreground">Create and manage events</div>
          </button>
        </div>
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="firstName">
              First name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="firstName"
              type="text"
              placeholder="John"
              value={formData.firstName}
              onChange={(e) => handleInputChange("firstName", e.target.value)}
              className={cn(fieldErrors.firstName && "border-destructive focus-visible:ring-destructive")}
            />
            {fieldErrors.firstName && (
              <p className="text-xs text-destructive flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {fieldErrors.firstName}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="lastName">
              Last name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="lastName"
              type="text"
              placeholder="Doe"
              value={formData.lastName}
              onChange={(e) => handleInputChange("lastName", e.target.value)}
              className={cn(fieldErrors.lastName && "border-destructive focus-visible:ring-destructive")}
            />
            {fieldErrors.lastName && (
              <p className="text-xs text-destructive flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {fieldErrors.lastName}
              </p>
            )}
          </div>
        </div>

        {accountType === "organizer" && (
          <div className="space-y-2">
            <Label htmlFor="organizationName">Organization name (optional)</Label>
            <div className="relative">
              <Building className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                id="organizationName"
                type="text"
                placeholder="Your company or brand"
                value={formData.organizationName}
                onChange={(e) => handleInputChange("organizationName", e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="email">
            Email <span className="text-destructive">*</span>
          </Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={formData.email}
              onChange={(e) => handleInputChange("email", e.target.value)}
              className={cn("pl-10", fieldErrors.email && "border-destructive focus-visible:ring-destructive")}
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
          <Label htmlFor="password">
            Password <span className="text-destructive">*</span>
          </Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="Min. 8 characters"
              value={formData.password}
              onChange={(e) => handleInputChange("password", e.target.value)}
              className={cn("pl-10 pr-10", fieldErrors.password && "border-destructive focus-visible:ring-destructive")}
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
            <div className="space-y-1">
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((level) => (
                  <div
                    key={level}
                    className={cn(
                      "h-1 flex-1 rounded-full transition-colors",
                      level <= passwordStrength.strength ? passwordStrength.color : "bg-muted"
                    )}
                  />
                ))}
              </div>
              <p className="text-xs text-muted-foreground">
                Password strength:{" "}
                <span
                  className={cn(
                    passwordStrength.strength <= 2 && "text-red-500",
                    passwordStrength.strength === 3 && "text-yellow-500",
                    passwordStrength.strength === 4 && "text-blue-500",
                    passwordStrength.strength === 5 && "text-green-500"
                  )}
                >
                  {passwordStrength.label}
                </span>
              </p>
            </div>
          )}
          <div className="text-xs text-muted-foreground space-y-1">
            <p className="flex items-center gap-1">
              {formData.password.length >= 8 ? (
                <CheckCircle2 className="h-3 w-3 text-green-500" />
              ) : (
                <span className="h-3 w-3 rounded-full border border-muted-foreground inline-block" />
              )}
              At least 8 characters
            </p>
            <p className="flex items-center gap-1">
              {/[A-Z]/.test(formData.password) ? (
                <CheckCircle2 className="h-3 w-3 text-green-500" />
              ) : (
                <span className="h-3 w-3 rounded-full border border-muted-foreground inline-block" />
              )}
              At least one uppercase letter
            </p>
            <p className="flex items-center gap-1">
              {/\d/.test(formData.password) ? (
                <CheckCircle2 className="h-3 w-3 text-green-500" />
              ) : (
                <span className="h-3 w-3 rounded-full border border-muted-foreground inline-block" />
              )}
              At least one number
            </p>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirmPassword">
            Confirm Password <span className="text-destructive">*</span>
          </Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              id="confirmPassword"
              type={showPassword ? "text" : "password"}
              placeholder="Re-enter your password"
              value={formData.confirmPassword}
              onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
              className={cn(
                "pl-10",
                fieldErrors.confirmPassword && "border-destructive focus-visible:ring-destructive"
              )}
            />
          </div>
          {fieldErrors.confirmPassword && (
            <p className="text-xs text-destructive flex items-center gap-1">
              <AlertCircle className="h-3 w-3" />
              {fieldErrors.confirmPassword}
            </p>
          )}
        </div>

        <div className="flex items-start gap-2">
          <Checkbox
            id="terms"
            checked={formData.agreeToTerms}
            onCheckedChange={(checked) => handleInputChange("agreeToTerms", checked as boolean)}
            className={cn("mt-1", fieldErrors.agreeToTerms && "border-destructive")}
          />
          <div className="space-y-1">
            <Label htmlFor="terms" className="text-sm font-normal cursor-pointer leading-relaxed">
              I agree to the{" "}
              <Link href="/terms" className="text-primary hover:underline">
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link href="/privacy" className="text-primary hover:underline">
                Privacy Policy
              </Link>
            </Label>
            {fieldErrors.agreeToTerms && (
              <p className="text-xs text-destructive flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {fieldErrors.agreeToTerms}
              </p>
            )}
          </div>
        </div>
      </div>

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Creating account...
          </>
        ) : (
          "Create Account"
        )}
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link href="/login" className="text-primary hover:underline font-medium">
          Sign in
        </Link>
      </p>
    </form>
  );
}
