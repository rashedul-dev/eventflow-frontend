// Comprehensive error handling utility for EventFlow

export enum ErrorCategory {
  VALIDATION = "VALIDATION",
  NETWORK = "NETWORK",
  AUTHENTICATION = "AUTHENTICATION",
  AUTHORIZATION = "AUTHORIZATION",
  SERVER = "SERVER",
  NOT_FOUND = "NOT_FOUND",
  RATE_LIMIT = "RATE_LIMIT",
  UNKNOWN = "UNKNOWN",
}

export interface ApiErrorResponse {
  success: false;
  message: string;
  errorCode?: string;
  errors?: Record<string, string[]> | { field: string; message: string }[];
  stack?: string;
}

export interface ParsedError {
  category: ErrorCategory;
  message: string;
  userMessage: string;
  fieldErrors: Record<string, string[]>;
  actionText?: string;
  actionHref?: string;
  statusCode?: number;
  errorCode?: string;
}

// Map HTTP status codes to error categories
function getErrorCategory(status?: number, errorCode?: string): ErrorCategory {
  if (!status) return ErrorCategory.NETWORK;

  if (status === 401) return ErrorCategory.AUTHENTICATION;
  if (status === 403) return ErrorCategory.AUTHORIZATION;
  if (status === 404) return ErrorCategory.NOT_FOUND;
  if (status === 422 || status === 400) return ErrorCategory.VALIDATION;
  if (status === 429) return ErrorCategory.RATE_LIMIT;
  if (status >= 500) return ErrorCategory.SERVER;

  return ErrorCategory.UNKNOWN;
}

// Get user-friendly messages for each category
function getUserFriendlyMessage(category: ErrorCategory, originalMessage?: string): string {
  switch (category) {
    case ErrorCategory.VALIDATION:
      return "Please check the highlighted fields and try again.";
    case ErrorCategory.NETWORK:
      return "Unable to connect. Please check your internet connection and try again.";
    case ErrorCategory.AUTHENTICATION:
      return "Your session has expired. Please log in again.";
    case ErrorCategory.AUTHORIZATION:
      return "You don't have permission to perform this action.";
    case ErrorCategory.NOT_FOUND:
      return "The requested resource was not found.";
    case ErrorCategory.RATE_LIMIT:
      return "Too many requests. Please wait a moment and try again.";
    case ErrorCategory.SERVER:
      return "Something went wrong on our end. Our team has been notified.";
    default:
      return originalMessage || "An unexpected error occurred. Please try again.";
  }
}

// Get action suggestions for each category
function getActionSuggestion(category: ErrorCategory): { text?: string; href?: string } {
  switch (category) {
    case ErrorCategory.AUTHENTICATION:
      return { text: "Log In", href: "/login" };
    case ErrorCategory.NETWORK:
      return { text: "Retry" };
    case ErrorCategory.NOT_FOUND:
      return { text: "Go Home", href: "/" };
    default:
      return {};
  }
}

// Parse field-level validation errors from various backend formats
function parseFieldErrors(
  errors?: Record<string, string[]> | { field: string; message: string }[]
): Record<string, string[]> {
  if (!errors) return {};

  // Handle array format: [{ field: "email", message: "Invalid email" }]
  if (Array.isArray(errors)) {
    return errors.reduce((acc, error) => {
      if (!acc[error.field]) {
        acc[error.field] = [];
      }
      acc[error.field].push(error.message);
      return acc;
    }, {} as Record<string, string[]>);
  }

  // Handle object format: { email: ["Invalid email"] }
  return errors;
}

// Main error parsing function
export function parseApiError(error: any): ParsedError {
  let status: number | undefined;
  let message = "An error occurred";
  let errorCode: string | undefined;
  let rawErrors: Record<string, string[]> | { field: string; message: string }[] | undefined;

  // Handle fetch errors (network issues)
  if (error instanceof TypeError && error.message === "Failed to fetch") {
    return {
      category: ErrorCategory.NETWORK,
      message: "Network error",
      userMessage: getUserFriendlyMessage(ErrorCategory.NETWORK),
      fieldErrors: {},
      actionText: "Retry",
    };
  }

  // Handle API error responses
  if (error.status) {
    status = error.status;
  }
  if (error.data) {
    message = error.data.message || message;
    errorCode = error.data.errorCode || error.data.code;
    rawErrors = error.data.errors;
  } else if (error.message) {
    message = error.message;
  }

  const category = getErrorCategory(status, errorCode);
  const fieldErrors = parseFieldErrors(rawErrors);
  const { text: actionText, href: actionHref } = getActionSuggestion(category);

  return {
    category,
    message,
    userMessage:
      Object.keys(fieldErrors).length > 0
        ? getUserFriendlyMessage(ErrorCategory.VALIDATION)
        : getUserFriendlyMessage(category, message),
    fieldErrors,
    actionText,
    actionHref,
    statusCode: status,
    errorCode,
  };
}

// Convert BigInt values to strings (fixes serialization issues)
export function convertBigIntToString(obj: any): any {
  if (obj === null || obj === undefined) return obj;

  if (typeof obj === "bigint") {
    return obj.toString();
  }

  if (Array.isArray(obj)) {
    return obj.map(convertBigIntToString);
  }

  if (typeof obj === "object") {
    const result: Record<string, any> = {};
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        result[key] = convertBigIntToString(obj[key]);
      }
    }
    return result;
  }

  return obj;
}

// Format large numbers for display
export function formatLargeNumber(value: number | string | bigint): string {
  const num = typeof value === "bigint" ? Number(value) : Number(value);

  if (isNaN(num)) return "0";

  if (num >= 1_000_000_000) {
    return `${(num / 1_000_000_000).toFixed(1)}B`;
  }
  if (num >= 1_000_000) {
    return `${(num / 1_000_000).toFixed(1)}M`;
  }
  if (num >= 1_000) {
    return `${(num / 1_000).toFixed(1)}K`;
  }

  return num.toLocaleString();
}
