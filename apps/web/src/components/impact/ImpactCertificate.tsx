"use client";

import { forwardRef } from "react";
import { Leaf } from "lucide-react";
import type { Certificate } from "@/types/impact";
import { formatDate } from "@/lib/utils";
import { siteConfig } from "@/config/site";

export const ImpactCertificate = forwardRef<HTMLDivElement, { certificate: Certificate }>(
  function ImpactCertificate({ certificate }, ref) {
    return (
      <div
        ref={ref}
        className="me-certificate mx-auto w-full max-w-[720px] rounded-card border-2 border-[var(--primary)] bg-white p-6 text-[var(--ink)] shadow-geo sm:p-10"
      >
        <div className="flex items-center gap-3">
          <span className="grid h-12 w-12 place-items-center rounded-full bg-[var(--me-forest)] text-white">
            <Leaf className="h-6 w-6" aria-hidden />
          </span>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-[var(--me-forest)]">
              {siteConfig.fullName}
            </p>
            <p className="text-[10px] text-[var(--fg-subtle)]">
              {siteConfig.contact.address} · {siteConfig.contact.phone}
            </p>
          </div>
        </div>

        <div className="mt-6 text-center">
          <p className="text-xs uppercase tracking-[0.2em] text-[var(--fg-subtle)]">
            Certificate of Impact
          </p>
          <h1 className="mt-2 font-display text-2xl font-bold text-[var(--ink)] sm:text-3xl">
            {certificate.title}
          </h1>
          <p className="mt-1 text-sm text-[var(--fg-muted)]">Awarded to</p>
          <p className="mt-1 text-xl font-semibold text-[var(--me-forest)]">
            {certificate.memberName}
          </p>
          <p className="mt-2 text-sm text-[var(--fg-muted)]">
            For outstanding contribution to {siteConfig.shortName} from{" "}
            {formatDate(certificate.periodFrom)} to {formatDate(certificate.periodTo)}.
          </p>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-3 rounded-card bg-[#f0fdf4] p-4 sm:grid-cols-4">
          {[
            { label: "Trees", value: certificate.metrics.treesPlanted },
            { label: "Waste (kg)", value: certificate.metrics.wasteCollectedKg },
            { label: "Hours", value: certificate.metrics.volunteerHours },
            { label: "CO₂ offset (kg)", value: certificate.metrics.carbonOffsetKg },
          ].map((s) => (
            <div key={s.label} className="text-center">
              <p className="text-lg font-bold text-[var(--me-forest)]">{s.value}</p>
              <p className="text-[10px] uppercase tracking-wide text-[var(--fg-subtle)]">
                {s.label}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-6 flex flex-col gap-2 border-t border-[var(--border)] pt-4 text-xs text-[var(--fg-subtle)] sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="font-semibold text-[var(--ink)]">Issued on</p>
            <p>{formatDate(certificate.issuedAt)}</p>
          </div>
          <div>
            <p className="font-semibold text-[var(--ink)]">Verification code</p>
            <p className="font-mono">{certificate.verificationCode}</p>
          </div>
        </div>
      </div>
    );
  },
);
