"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, hint, id, ...props }, ref) => {
    const inputId = id ?? React.useId();
    const describedBy = error
      ? `${inputId}-error`
      : hint
        ? `${inputId}-hint`
        : undefined;

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="mb-1.5 block text-sm font-medium text-[var(--fg)]"
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          aria-invalid={!!error}
          aria-describedby={describedBy}
          className={cn(
            // 16px font avoids iOS zoom; 44px min height for tap
            "w-full min-h-[44px] rounded-[var(--radius-md)] border bg-[var(--bg-elevated)] px-3.5 py-2.5",
            "text-[16px] text-[var(--fg)] placeholder:text-[var(--fg-subtle)]",
            "border-[var(--border)] focus:border-[var(--accent)] focus-ring",
            "transition-colors disabled:opacity-60",
            error && "border-[var(--danger)] focus:border-[var(--danger)]",
            className,
          )}
          {...props}
        />
        {error ? (
          <p
            id={`${inputId}-error`}
            role="alert"
            className="mt-1.5 text-sm text-[var(--danger)]"
          >
            {error}
          </p>
        ) : hint ? (
          <p id={`${inputId}-hint`} className="mt-1.5 text-sm text-[var(--fg-subtle)]">
            {hint}
          </p>
        ) : null}
      </div>
    );
  },
);
Input.displayName = "Input";
