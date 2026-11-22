import type { Metadata } from "next";
import { ProtectedShell } from "@/components/layout/ProtectedShell";

// The signed-in area must never appear in search results.
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ProtectedShell>{children}</ProtectedShell>;
}
