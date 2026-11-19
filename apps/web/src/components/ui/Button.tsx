"use client";

import * as React from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "ghost" | "danger" | "outline";
type Size = "sm" | "md" | "lg";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  fullWidth?: boolean;
}

const variants: Record<Variant, string> = {
  primary:
    "bg-[var(--primary)] text-[var(--primary-fg)] hover:bg-[var(--primary-hover)] shadow-geo",
  secondary:
    "bg-[var(--bg-muted)] text-[var(--fg)] hover:bg-[var(--border)] border border-[var(--border)]",
  ghost:
    "bg-transparent text-[var(--fg)] hover:bg-[var(--bg-muted)]",
  danger:
    "bg-[var(--danger)] text-white hover:opacity-90",
  outline:
    "bg-transparent text-[var(--primary)] border border-[var(--primary)] hover:bg-[var(--primary)] hover:text-[var(--primary-fg)]",
};

const sizes: Record<Size, string> = {
  // Mobile-first: base size is comfortable tap target (44px)
  sm: "h-10 px-3 text-sm rounded-[var(--radius-sm)]",
  md: "h-11 px-4 text-[0.95rem] rounded-[var(--radius-md)]",
  lg: "h-12 px-6 text-base rounded-[var(--radius-md)] sm:h-13",
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "primary",
      size = "md",
      loading = false,
      fullWidth = false,
      disabled,
      children,
      ...props
    },
    ref,
  ) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center gap-2 font-semibold transition-colors focus-ring",
          "disabled:opacity-50 disabled:pointer-events-none select-none",
          "touch-manipulation",
          variants[variant],
          sizes[size],
          fullWidth && "w-full",
          className,
        )}
        disabled={disabled || loading}
        aria-busy={loading}
        {...props}
      >
        {loading && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />}
        {children}
      </button>
    );
  },
);
Button.displayName = "Button";
