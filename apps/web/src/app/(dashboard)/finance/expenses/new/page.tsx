"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { financeApi } from "@/lib/api/finance.api";
import { Input } from "@/components/ui/Input";
import { AmountInput } from "@/components/ui/AmountInput";
import { Button } from "@/components/ui/Button";
import { Card, CardBody } from "@/components/ui/Card";
import { ApiError } from "@/lib/api/client";

const schema = z.object({
  description: z.string().min(3, "Describe the expense"),
  paidTo: z.string().min(2, "Who was paid?"),
  category: z.enum(["SEEDLINGS", "EQUIPMENT", "TRANSPORT", "TRAINING", "ADMIN", "OUTREACH", "OTHER"]),
});
type Values = z.infer<typeof schema>;

export default function NewExpensePage() {
  const router = useRouter();
  const [amount, setAmount] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: { description: "", paidTo: "", category: "OTHER" },
  });

  const onSubmit = async (values: Values) => {
    if (amount < 10) {
      toast.error("Amount must be at least KES 10.");
      return;
    }
    setSubmitting(true);
    try {
      await financeApi.createExpense({ ...values, amountKes: amount });
      toast.success("Expense submitted for approval.");
      router.replace("/finance/expenses");
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : "Could not submit.";
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container-mobile py-5 sm:py-8">
      <h1 className="text-[var(--fg)]">New expense</h1>
      <Card className="mt-4">
        <CardBody>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
            <Input label="Description" placeholder="e.g. 200 acacia seedlings" error={errors.description?.message} {...register("description")} />
            <AmountInput value={amount} onChange={setAmount} min={10} presets={[500, 1000, 5000, 10000]} />
            <Input label="Paid to" placeholder="Vendor / person" error={errors.paidTo?.message} {...register("paidTo")} />

            <div>
              <label className="mb-1.5 block text-sm font-medium text-[var(--fg)]">Category</label>
              <select
                {...register("category")}
                className="w-full min-h-[44px] rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--bg-elevated)] px-3 py-2.5 text-[16px] text-[var(--fg)] focus:border-[var(--accent)] focus-ring"
              >
                {(["SEEDLINGS", "EQUIPMENT", "TRANSPORT", "TRAINING", "ADMIN", "OUTREACH", "OTHER"] as const).map((c) => (
                  <option key={c} value={c}>{c.toLowerCase()}</option>
                ))}
              </select>
            </div>

            <Button type="submit" size="lg" fullWidth loading={submitting}>
              Submit for approval
            </Button>
          </form>
        </CardBody>
      </Card>
    </div>
  );
}
