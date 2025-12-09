"use client";

import { useState, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import { parseApiError, type ParsedError, ErrorCategory } from "@/lib/error/error-handler";

interface UseApiErrorOptions {
  showToast?: boolean;
  redirectOnAuth?: boolean;
}

export function useApiError(options: UseApiErrorOptions = {}) {
  const { showToast = true, redirectOnAuth = true } = options;
  const { toast } = useToast();
  const [error, setError] = useState<ParsedError | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

  const handleError = useCallback(
    (err: any) => {
      const parsed = parseApiError(err);
      setError(parsed);
      setFieldErrors(parsed.fieldErrors);

      if (showToast && Object.keys(parsed.fieldErrors).length === 0) {
        toast({
          title: getToastTitle(parsed.category),
          description: parsed.userMessage,
          variant: "destructive",
        });
      }

      // Handle authentication errors
      if (redirectOnAuth && parsed.category === ErrorCategory.AUTHENTICATION) {
        if (typeof window !== "undefined") {
          const currentPath = window.location.pathname;
          window.location.href = `/login?redirect=${encodeURIComponent(currentPath)}`;
        }
      }

      return parsed;
    },
    [showToast, redirectOnAuth, toast]
  );

  const clearError = useCallback(() => {
    setError(null);
    setFieldErrors({});
  }, []);

  const getFieldError = useCallback(
    (field: string): string[] => {
      return fieldErrors[field] || [];
    },
    [fieldErrors]
  );

  const hasFieldError = useCallback(
    (field: string): boolean => {
      return !!fieldErrors[field] && fieldErrors[field].length > 0;
    },
    [fieldErrors]
  );

  return {
    error,
    fieldErrors,
    handleError,
    clearError,
    getFieldError,
    hasFieldError,
  };
}

function getToastTitle(category: ErrorCategory): string {
  switch (category) {
    case ErrorCategory.VALIDATION:
      return "Validation Error";
    case ErrorCategory.NETWORK:
      return "Connection Error";
    case ErrorCategory.AUTHENTICATION:
      return "Session Expired";
    case ErrorCategory.AUTHORIZATION:
      return "Access Denied";
    case ErrorCategory.NOT_FOUND:
      return "Not Found";
    case ErrorCategory.RATE_LIMIT:
      return "Too Many Requests";
    case ErrorCategory.SERVER:
      return "Server Error";
    default:
      return "Error";
  }
}
