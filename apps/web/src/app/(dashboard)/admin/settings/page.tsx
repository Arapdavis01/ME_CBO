"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { adminApi } from "@/lib/api/admin.api";
import { Card, CardBody } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";

const schema = z.object({
  organizationName: z.string().min(2),
  motto: z.string().min(2),
  contactEmail: z.string().email(),
  contactPhone: z.string().min(5),
  allowPublicPetitions: z.boolean(),
  requireMfaForAdmins: z.boolean(),
});
type Values = z.infer<typeof schema>;

export default function AdminSettingsPage() {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ["admin", "settings"],
    queryFn: async () => (await adminApi.settings()).settings,
  });

  const { register, handleSubmit, reset, formState: { errors, isDirty } } = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: {
      organizationName: "Mosoriot Environmental CBO",
      motto: "Caring for Creation, Sustaining Our Future",
      contactEmail: "info@mecbo.org",
      contactPhone: "0741 835 028",
      allowPublicPetitions: true,
      requireMfaForAdmins: true,
    },
  });

  useEffect(() => { if (data) reset(data); }, [data, reset]);

  const save = useMutation({
    mutationFn: (values: Values) => adminApi.updateSettings(values),
    onSuccess: () => {
      toast.success("Settings saved.");
      void qc.invalidateQueries({ queryKey: ["admin", "settings"] });
    },
  });

  if (isLoading) return <div className="container-mobile py-5"><Skeleton className="h-64" /></div>;

  return (
    <div className="container-mobile py-5 sm:py-8">
      <h1 className="text-[var(--fg)]">Settings</h1>
      <Card className="mt-4">
        <CardBody>
          <form onSubmit={handleSubmit((v) => save.mutate(v))} className="space-y-4" noValidate>
            <Input label="Organization name" error={errors.organizationName?.message} {...register("organizationName")} />
            <Input label="Motto" error={errors.motto?.message} {...register("motto")} />
            <Input label="Contact email" type="email" error={errors.contactEmail?.message} {...register("contactEmail")} />
            <Input label="Contact phone" error={errors.contactPhone?.message} {...register("contactPhone")} />
            <label className="flex items-center gap-2 text-sm text-[var(--fg)]">
              <input type="checkbox" className="h-4 w-4 accent-[var(--primary)]" {...register("allowPublicPetitions")} />
              Allow public petitions
            </label>
            <label className="flex items-center gap-2 text-sm text-[var(--fg)]">
              <input type="checkbox" className="h-4 w-4 accent-[var(--primary)]" {...register("requireMfaForAdmins")} />
              Require MFA for admin roles
            </label>
            <Button type="submit" size="lg" fullWidth loading={save.isPending} disabled={!isDirty}>
              Save changes
            </Button>
          </form>
        </CardBody>
      </Card>
    </div>
  );
}
