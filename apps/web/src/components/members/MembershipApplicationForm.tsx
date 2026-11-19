"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Card, CardBody } from "@/components/ui/Card";
import { api } from "@/lib/api/client";
import { ApiError } from "@/lib/api/client";

const schema = z.object({
  fullName: z.string().min(2, "Your name please"),
  email: z.string().email("Valid email please"),
  phone: z.string().min(9, "Phone number please"),
  motivation: z.string().min(20, "Tell us a bit more (20+ characters)"),
  skills: z.string().optional(),
});
type Values = z.infer<typeof schema>;

export function MembershipApplicationForm() {
  const [submitting, setSubmitting] = useState(false);
  const { register, handleSubmit, reset, formState: { errors } } = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: { fullName: "", email: "", phone: "", motivation: "", skills: "" },
  });

  const onSubmit = async (values: Values) => {
    setSubmitting(true);
    try {
      await api.post("/members/applications", {
        ...values,
        skills: values.skills
          ? values.skills.split(",").map((s) => s.trim()).filter(Boolean)
          : [],
      });
      toast.success("Application received! We'll be in touch.");
      reset();
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : "Could not submit.";
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card>
      <CardBody>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          <Input label="Full name" error={errors.fullName?.message} {...register("fullName")} />
          <Input label="Email" type="email" autoComplete="email" error={errors.email?.message} {...register("email")} />
          <Input label="Phone" type="tel" autoComplete="tel" placeholder="+254…" error={errors.phone?.message} {...register("phone")} />
          <Input label="Skills (comma separated)" placeholder="e.g. botany, welding, teaching" error={errors.skills?.message} {...register("skills")} />
          <div>
            <label className="mb-1.5 block text-sm font-medium text-[var(--fg)]">Why do you want to join?</label>
            <textarea
              rows={4}
              {...register("motivation")}
              className="w-full rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--bg-elevated)] px-3.5 py-2.5 text-[16px] text-[var(--fg)] focus:border-[var(--accent)] focus-ring"
            />
            {errors.motivation && <p className="mt-1.5 text-sm text-[var(--danger)]">{errors.motivation.message}</p>}
          </div>
          <Button type="submit" size="lg" fullWidth loading={submitting}>Submit application</Button>
        </form>
      </CardBody>
    </Card>
  );
}
