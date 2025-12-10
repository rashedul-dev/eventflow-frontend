"use client";

import { forwardRef, type TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

interface FormTextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: boolean;
}

export const FormTextarea = forwardRef<HTMLTextAreaElement, FormTextareaProps>(
  ({ className, error, ...props }, ref) => {
    return (
      <textarea
        ref={ref}
        className={cn(
          "w-full min-h-[120px] px-4 py-3 rounded-lg bg-black border transition-all duration-200",
          "text-foreground placeholder:text-muted-foreground resize-y",
          "focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary",
          error
            ? "border-red-500 focus:ring-red-500/50 focus:border-red-500"
            : "border-secondary hover:border-secondary/80",
          "disabled:opacity-50 disabled:cursor-not-allowed",
          className
        )}
        {...props}
      />
    );
  }
);
FormTextarea.displayName = "FormTextarea";
