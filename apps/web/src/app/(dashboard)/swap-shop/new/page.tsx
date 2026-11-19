"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Camera } from "lucide-react";
import { swapApi } from "@/lib/api/swap.api";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Card, CardBody } from "@/components/ui/Card";
import { ApiError } from "@/lib/api/client";

const schema = z.object({
  title: z.string().min(3, "Give your item a short title"),
  description: z.string().min(10, "Describe the item and any flaws"),
  category: z.enum(["FURNITURE", "ELECTRONICS", "CLOTHING", "TOOLS", "GARDEN", "OTHER"]),
  condition: z.enum(["NEW", "LIKE_NEW", "GOOD", "FAIR"]),
  location: z.string().min(2, "Where can it be picked up?"),
});
type Values = z.infer<typeof schema>;

const MAX = 4 * 1024 * 1024;

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(String(r.result));
    r.onerror = () => reject(r.error);
    r.readAsDataURL(file);
  });
}

export default function NewSwapPage() {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: "",
      description: "",
      category: "OTHER",
      condition: "GOOD",
      location: "Mosoriot",
    },
  });

  const onPick = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > MAX) {
      toast.error("Photo is too large (max 4 MB).");
      return;
    }
    setPreview(await fileToDataUrl(file));
  };

  const onSubmit = async (values: Values) => {
    setSubmitting(true);
    try {
      const { listing } = await swapApi.create({
        ...values,
        photoDataUrl: preview ?? undefined,
      });
      toast.success("Listed! Thanks for keeping it in circulation.");
      router.replace(`/swap-shop/${listing.id}`);
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : "Could not list item.";
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container-mobile py-5 sm:py-8">
      <h1 className="text-[var(--fg)]">List an item</h1>
      <p className="mt-1 text-sm text-[var(--fg-muted)]">
        Free to list. Free to claim. Keep usable items out of landfill.
      </p>

      <Card className="mt-4">
        <CardBody>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
            <div>
              <label
                htmlFor="swap-photo"
                className="flex min-h-[140px] cursor-pointer flex-col items-center justify-center gap-2 rounded-card border-2 border-dashed border-[var(--border)] bg-[var(--bg-muted)] p-4 text-center focus-ring"
              >
                {preview ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={preview} alt="" className="max-h-48 w-full rounded-[var(--radius-md)] object-cover" />
                ) : (
                  <>
                    <Camera className="h-6 w-6 text-[var(--primary)]" aria-hidden />
                    <span className="text-sm font-medium text-[var(--fg)]">
                      Add a photo
                    </span>
                    <span className="text-xs text-[var(--fg-subtle)]">Optional but recommended</span>
                  </>
                )}
                <input
                  ref={fileRef}
                  id="swap-photo"
                  type="file"
                  accept="image/*"
                  capture="environment"
                  className="sr-only"
                  onChange={onPick}
                />
              </label>
            </div>

            <Input label="Title" placeholder="e.g. Wooden stool" error={errors.title?.message} {...register("title")} />
            <Input label="Description" placeholder="Condition, size, any flaws…" error={errors.description?.message} {...register("description")} />

            <div className="grid grid-cols-1 gap-3 xs:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-[var(--fg)]">Category</label>
                <select
                  {...register("category")}
                  className="w-full min-h-[44px] rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--bg-elevated)] px-3 py-2.5 text-[16px] text-[var(--fg)] focus:border-[var(--accent)] focus-ring"
                >
                  {(["FURNITURE", "ELECTRONICS", "CLOTHING", "TOOLS", "GARDEN", "OTHER"] as const).map((c) => (
                    <option key={c} value={c}>{c.toLowerCase()}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-[var(--fg)]">Condition</label>
                <select
                  {...register("condition")}
                  className="w-full min-h-[44px] rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--bg-elevated)] px-3 py-2.5 text-[16px] text-[var(--fg)] focus:border-[var(--accent)] focus-ring"
                >
                  {(["NEW", "LIKE_NEW", "GOOD", "FAIR"] as const).map((c) => (
                    <option key={c} value={c}>{c.toLowerCase().replace("_", " ")}</option>
                  ))}
                </select>
              </div>
            </div>

            <Input label="Pickup location" error={errors.location?.message} {...register("location")} />

            <Button type="submit" size="lg" fullWidth loading={submitting}>
              Publish listing
            </Button>
          </form>
        </CardBody>
      </Card>
    </div>
  );
}
