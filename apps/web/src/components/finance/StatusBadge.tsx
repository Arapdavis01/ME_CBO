import { Badge } from "@/components/ui/Badge";

const map: Record<string, { tone: "neutral" | "success" | "warning" | "danger" | "primary"; label: string }> = {
  PENDING: { tone: "warning", label: "Pending" },
  PROCESSING: { tone: "primary", label: "Processing" },
  SUCCEEDED: { tone: "success", label: "Succeeded" },
  FAILED: { tone: "danger", label: "Failed" },
  CANCELLED: { tone: "neutral", label: "Cancelled" },
  PAID: { tone: "success", label: "Paid" },
  DUE: { tone: "warning", label: "Due" },
  OVERDUE: { tone: "danger", label: "Overdue" },
  WAIVED: { tone: "neutral", label: "Waived" },
  APPROVED: { tone: "success", label: "Approved" },
  REJECTED: { tone: "danger", label: "Rejected" },
};

export function StatusBadge({ status }: { status: string }) {
  const m = map[status] ?? { tone: "neutral" as const, label: status };
  return <Badge tone={m.tone}>{m.label}</Badge>;
}
