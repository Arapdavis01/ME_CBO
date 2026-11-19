"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Heart, Loader2 } from "lucide-react";
import { AmountInput } from "@/components/ui/AmountInput";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { PaymentMethodPicker } from "./PaymentMethodPicker";
import { useStartDonation } from "@/hooks/useFinance";
import type { PaymentMethod } from "@/types/finance";
import { isValidKePhone, formatPhoneKe, formatKes } from "@/lib/format";

const schema = z
  .object({
    donorName: z.string().min(2, "Tell us your name"),
    donorEmail: z.string().email("Valid email please").optional().or(z.literal("")),
    donorPhone: z.string().optional(),
    message: z.string().max(200).optional(),
    isAnonymous: z.boolean().optional(),
  })
  .superRefine((v, ctx) => {
    // Phone required for M-Pesa — enforced again on submit by method
    if (v.donorPhone && v.donorPhone.length > 0 && !isValidKePhone(v.donorPhone)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["donorPhone"],
        message: "Use a valid Kenyan number (07xx… or +2547xx…)",
      });
    }
  });
type Values = z.infer<typeof schema>;

export function DonationForm() {
  const [amount, setAmount] = useState(500);
  const [method, setMethod] = useState<PaymentMethod>("MPESA");
  const start = useStartDonation();

  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors },
  } = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: { donorName: "", donorEmail: "", donorPhone: "", message: "" },
  });

  const onSubmit = async (values: Values) => {
    if (amount < 10) {
      toast.error("Minimum donation is KES 10.");
      return;
    }
    if (method === "MPESA" && !values.donorPhone) {
      toast.error("Phone number is required for M-Pesa.");
      return;
    }

    try {
      const res = await start.mutateAsync({
        amountKes: amount,
        method,
        donorName: values.donorName,
        donorEmail: values.donorEmail || undefined,
        donorPhone: values.donorPhone ? formatPhoneKe(values.donorPhone) : undefined,
        message: values.message,
        isAnonymous: values.isAnonymous,
      });

      if (res.status === "STK_SENT") {
        toast.success("Check your phone — enter your M-Pesa PIN to complete the donation.");
      } else if (res.status === "REDIRECT") {
        window.location.href = res.checkoutUrl;
      }
    } catch {
      /* toast shown by mutation */
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
      <AmountInput value={amount} onChange={setAmount} min={10} />

      <div>
        <p className="mb-2 text-sm font-medium text-[var(--fg)]">Payment method</p>
        <PaymentMethodPicker value={method} onChange={setMethod} />
      </div>

      <Input
        label="Your name"
        autoComplete="name"
        error={errors.donorName?.message}
        {...register("donorName")}
      />

      <Input
        label={method === "MPESA" ? "M-Pesa phone (required)" : "Phone (optional)"}
        type="tel"
        inputMode="tel"
        autoComplete="tel"
        placeholder="+254 7XX XXX XXX"
        error={errors.donorPhone?.message}
        {...register("donorPhone")}
      />

      {method !== "MPESA" && (
        <Input
          label="Email (for receipt)"
          type="email"
          inputMode="email"
          autoComplete="email"
          error={errors.donorEmail?.message}
          {...register("donorEmail")}
        />
      )}

      <Input
        label="Message (optional)"
        placeholder="e.g. In memory of…"
        error={errors.message?.message}
        {...register("message")}
      />

      <label className="flex items-center gap-2 text-sm text-[var(--fg-muted)]">
        <input
          type="checkbox"
          className="h-4 w-4 rounded border-[var(--border)] accent-[var(--primary)]"
          {...register("isAnonymous")}
        />
        Give anonymously
      </label>

      <Button
        type="submit"
        size="lg"
        fullWidth
        loading={start.isPending}
        disabled={amount < 10}
      >
        {start.isPending ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" /> Sending…
          </>
        ) : (
          <>
            <Heart className="h-4 w-4" /> Donate {formatKes(amount)}
          </>
        )}
      </Button>

      <p className="text-center text-xs text-[var(--fg-subtle)]">
        Secure. ME_CBO never stores your PIN or card details.
      </p>
    </form>
  );
}
