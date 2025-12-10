"use client";

import { forwardRef, type InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

interface FormCheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
  label: string;
  error?: boolean;
}

export const FormCheckbox = forwardRef<HTMLInputElement, FormCheckboxProps>(
  ({ className, label, error, ...props }, ref) => {
    return (
      <label className={cn("flex items-start gap-3 cursor-pointer group", className)}>
        <div className="relative shrink-0">
          <input ref={ref} type="checkbox" className="peer sr-only" {...props} />
          <div
            className={cn(
              "h-5 w-5 rounded border-2 transition-all duration-200",
              "peer-focus:ring-2 peer-focus:ring-primary/50",
              "peer-checked:bg-primary peer-checked:border-primary",
              error ? "border-red-500" : "border-secondary group-hover:border-primary/50"
            )}
          />
          <Check className="absolute top-0.5 left-0.5 h-4 w-4 text-black opacity-0 peer-checked:opacity-100 transition-opacity" />
        </div>
        <span className="text-sm text-foreground">{label}</span>
      </label>
    );
  }
);
FormCheckbox.displayName = "FormCheckbox";
