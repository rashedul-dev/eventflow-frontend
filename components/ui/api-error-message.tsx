"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { AlertCircle, WifiOff, ShieldX, Lock, ServerCrash, RefreshCw, Home, LogIn } from "lucide-react"
import { cn } from "@/lib/utils"
import { ErrorCategory, type ParsedError } from "@/lib/error/error-handler"
import Link from "next/link"

interface ApiErrorMessageProps {
  error: ParsedError
  onRetry?: () => void
  className?: string
  compact?: boolean
}

const iconMap: Record<ErrorCategory, React.ElementType> = {
  [ErrorCategory.VALIDATION]: AlertCircle,
  [ErrorCategory.NETWORK]: WifiOff,
  [ErrorCategory.AUTHENTICATION]: Lock,
  [ErrorCategory.AUTHORIZATION]: ShieldX,
  [ErrorCategory.NOT_FOUND]: AlertCircle,
  [ErrorCategory.RATE_LIMIT]: RefreshCw,
  [ErrorCategory.SERVER]: ServerCrash,
  [ErrorCategory.UNKNOWN]: AlertCircle,
}

const colorMap: Record<ErrorCategory, string> = {
  [ErrorCategory.VALIDATION]: "text-amber-500",
  [ErrorCategory.NETWORK]: "text-orange-500",
  [ErrorCategory.AUTHENTICATION]: "text-blue-500",
  [ErrorCategory.AUTHORIZATION]: "text-red-500",
  [ErrorCategory.NOT_FOUND]: "text-gray-500",
  [ErrorCategory.RATE_LIMIT]: "text-yellow-500",
  [ErrorCategory.SERVER]: "text-red-500",
  [ErrorCategory.UNKNOWN]: "text-gray-500",
}

export function ApiErrorMessage({ error, onRetry, className, compact = false }: ApiErrorMessageProps) {
  const Icon = iconMap[error.category]
  const iconColor = colorMap[error.category]

  if (compact) {
    return (
      <div className={cn("p-4 rounded-lg bg-destructive/10 border border-destructive/20", className)}>
        <div className="flex items-start gap-3">
          <Icon className={cn("w-5 h-5 shrink-0 mt-0.5", iconColor)} />
          <div className="flex-1 min-w-0">
            <p className="text-sm text-foreground font-medium">{error.userMessage}</p>
            {error.errorCode && <p className="text-xs text-muted-foreground mt-1">Error code: {error.errorCode}</p>}
          </div>
          {onRetry && error.category === ErrorCategory.NETWORK && (
            <Button variant="ghost" size="sm" onClick={onRetry} className="shrink-0">
              <RefreshCw className="w-4 h-4 mr-1" />
              Retry
            </Button>
          )}
        </div>
      </div>
    )
  }

  return (
    <Card className={cn("border-destructive/30", className)}>
      <CardContent className="pt-6">
        <div className="flex flex-col items-center text-center">
          <div className={cn("w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center mb-4")}>
            <Icon className={cn("w-6 h-6", iconColor)} />
          </div>
          <h3 className="font-semibold text-lg text-foreground mb-2">
            {error.category === ErrorCategory.NETWORK ? "Connection Error" : "Something went wrong"}
          </h3>
          <p className="text-muted-foreground mb-4">{error.userMessage}</p>
          {error.errorCode && <p className="text-xs text-muted-foreground mb-4">Reference: {error.errorCode}</p>}
          <div className="flex gap-3">
            {onRetry && (
              <Button onClick={onRetry} variant="outline">
                <RefreshCw className="w-4 h-4 mr-2" />
                Try Again
              </Button>
            )}
            {error.actionHref && (
              <Button asChild>
                <Link href={error.actionHref}>
                  {error.actionHref === "/login" && <LogIn className="w-4 h-4 mr-2" />}
                  {error.actionHref === "/" && <Home className="w-4 h-4 mr-2" />}
                  {error.actionText}
                </Link>
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
