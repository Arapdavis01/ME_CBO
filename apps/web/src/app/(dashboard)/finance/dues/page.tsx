"use client";

import Link from "next/link";
import { useState } from "react";
import { useAllInvoices } from "@/hooks/useFinance";
import { Card, CardBody } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";
import { StatusBadge } from "@/components/finance/StatusBadge";
import { formatKes } from "@/lib/format";
import { formatDate } from "@/lib/utils";
import { cn } from "@/lib/utils";

type Filter = "ALL" | "PAID" | "DUE" | "OVERDUE";

export default function DuesPage() {
  const [filter, setFilter] = useState<Filter>("ALL");
  const { data, isLoading } = useAllInvoices(filter === "ALL" ? undefined : filter);

  return (
    <div className="container-mobile py-5 sm:py-8">
      <Link href="/finance" className="text-sm text-[var(--fg-muted)] hover:text-[var(--fg)]">
        ← Finance
      </Link>
      <h1 className="mt-2 text-[var(--fg)]">Member dues</h1>

      <div className="mt-3 -mx-4 overflow-x-auto px-4 scrollbar-none">
        <div className="flex gap-2">
          {(["ALL", "PAID", "DUE", "OVERDUE"] as const).map((f) => (
            <button
              key={
