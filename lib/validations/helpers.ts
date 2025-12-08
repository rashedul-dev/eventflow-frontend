import type { z } from "zod";

export interface FieldError {
  field: string;
  message: string;
}

export interface ValidationResult<T> {
  success: boolean;
  data?: T;
  errors?: FieldError[];
  message?: string;
}

/**
 * Validates data against a Zod schema and returns formatted errors
 */
export function validateWithSchema<T>(schema: z.ZodSchema<T>, data: unknown): ValidationResult<T> {
  try {
    const result = schema.safeParse(data);

    if (result.success) {
      return { success: true, data: result.data };
    }

    const errors: FieldError[] = result.error.issues.map((err) => ({
      field: err.path.join("."),
      message: err.message,
    }));

    return {
      success: false,
      errors,
      message: errors[0]?.message || "Validation failed",
    };
  } catch (error) {
    return {
      success: false,
      errors: [{ field: "unknown", message: "Validation error occurred" }],
      message: "Validation error occurred",
    };
  }
}

/**
 * Converts Zod errors to a record for easy field lookup
 */
export function zodErrorsToRecord(error: z.ZodError): Record<string, string> {
  const errors: Record<string, string> = {};

  for (const err of error.issues) {
    const field = err.path.join(".");
    if (!errors[field]) {
      errors[field] = err.message;
    }
  }

  return errors;
}

/**
 * Maps backend API validation errors to form fields
 */
export function mapApiErrorsToFields(
  apiErrors: Array<{ field?: string; path?: string[]; message: string }>
): Record<string, string> {
  const errors: Record<string, string> = {};

  for (const err of apiErrors) {
    const field = err.field || err.path?.join(".") || "general";
    if (!errors[field]) {
      errors[field] = err.message;
    }
  }

  return errors;
}

/**
 * Check if a string is a valid datetime
 */
export function isValidDateTime(dateStr: string): boolean {
  const date = new Date(dateStr);
  return !isNaN(date.getTime());
}

/**
 * Format validation errors for display
 */
export function formatValidationErrors(errors: FieldError[]): string {
  return errors.map((e) => e.message).join(". ");
}
