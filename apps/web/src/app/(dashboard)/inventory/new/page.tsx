"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, PackagePlus, ShieldAlert } from "lucide-react";
import { inventoryApi } from "@/lib/api/inventory.api";
import { ApiError } from "@/lib/api/client";
import { usePermissions } from "@/hooks/usePermissions";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

const schema = z.object({
  name: z.string().trim().min(2, "Enter the item name").max(120),
  category: z.string().trim().max(60),
  location: z.string().trim().max(120),
  description: z.string().trim().max(1000),
  quantityTotal: z.coerce.number().int().min(0, "Cannot be negative").max(100000),
});
type FormValues = z.input<typeof schema>;

export default function AddInventoryItemPage() {
  const { can } = usePermissions();
  const router = useRouter();
  const qc = useQueryClient();
  const [busy, setBusy] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: "", category: "General", location: "", description: "", quantityTotal: 1 },
  });

  if (!can("inventory:manage")) {
    return (
      <div className="mx-auto max-w-xl py-10 text-center">
        <ShieldAlert className="mx-auto h-10 w-10 text-[var(--fg-subtle)]" aria-hidden />
        <h1 className="mt-3 text-xl font-semibold">Not allowed</h1>
        <p className="mt-1 text-sm text-[var(--fg-muted)]">Only administrators can add equipment.</p>
        <Link href="/inventory" className="mt-4 inline-block text-sm font-medium underline">
          Back to inventory
        </Link>
      </div>
    );
  }

  const onSubmit = async (raw: FormValues) => {
    const v = schema.parse(raw);
    setBusy(true);
    try {
      await inventoryApi.createItem({
        name: v.name,
        category: v.category || "General",
        quantityTotal: v.quantityTotal,
        ...(v.location ? { location: v.location } : {}),
        ...(v.description ? { description: v.description } : {}),
      });
      toast.success("Item added.");
      await qc.invalidateQueries({ queryKey: ["inventory"] });
      router.push("/inventory");
    } catch (err) {
      console.error("Add item error:", err);
      toast.error(err instanceof ApiError ? err.message : "Could not add the item.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mx-auto max-w-xl py-6">
      <Link
        href="/inventory"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-[var(--primary)] hover:underline"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden /> Back to inventory
      </Link>
      <h1 className="mt-3 text-2xl font-bold">Add equipment</h1>
      <p className="mb-6 mt-1 text-sm text-[var(--fg-muted)]">
        Add a tool or item that members can request to borrow.
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <Input label="Item name" error={errors.name?.message} {...register("name")} />
        <Input label="Category (e.g. Tools, Safety, Seedlings)" error={errors.category?.message} {...register("category")} />
        <Input label="Quantity owned" type="number" error={errors.quantityTotal?.message} {...register("quantityTotal")} />
        <Input label="Where it is kept (optional)" error={errors.location?.message} {...register("location")} />
        <label className="block text-sm font-medium">
          Description (optional)
          <textarea
            rows={3}
            className="mt-1 w-full rounded-lg border bg-transparent px-3 py-2.5 text-base"
            {...register("description")}
          />
        </label>
        <Button type="submit" size="lg" fullWidth loading={busy}>
          <PackagePlus className="h-4 w-4" aria-hidden /> Add item
        </Button>
      </form>
    </div>
  );
}
