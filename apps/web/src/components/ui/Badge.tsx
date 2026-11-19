import { cn } from "@/lib/utils";

type Tone = "neutral" | "success" | "warning" | "danger" | "primary";

const tones: Record<Tone, string> = {
  neutral: "bg-[var(--bg-muted)] text-[var(--fg-muted)]",
  success: "bg-[color:var(--success)]/15 text-[var(--success)]",
  warning: "bg-[color:var(--warning)]/15 text-[var(--warning)]",
  danger: "bg-[color:var(--danger)]/15 text-[var(--danger)]",
  primary: "bg-[var(--primary)] text-[var(--primary-fg)]",
};

export function Badge({
  tone = "neutral",
  className,
  children,
}: {
  tone?: Tone;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold",
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
