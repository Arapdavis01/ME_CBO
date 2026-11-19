"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { eventsApi } from "@/lib/api/events.api";
import { ApiError } from "@/lib/api/client";

/**
 * Mobile-friendly check-in. Field officers read a short code from the event QR
 * (e.g. "MECBO-2024-AB12"), or members paste it. Avoids shipping a camera lib
 * on low-end phones; camera scanner can be added later behind a feature flag.
 */
export function QrCheckinScanner({ eventId }: { eventId: string }) {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return;
    setLoading(true);
    try {
      const res = await eventsApi.checkin(eventId, code.trim().toUpperCase());
      toast.success(res.alreadyCheckedIn ? "Already checked in earlier." : "Checked in — welcome!");
      router.replace(`/events/${eventId}`);
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : "Check-in failed";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <Input
        label="Event check-in code"
        placeholder="MECBO-2024-AB12"
        value={code}
        onChange={(e) => setCode(e.target.value)}
        autoCapitalize="characters"
        autoCorrect="off"
        spellCheck={false}
        inputMode="text"
      />
      <Button type="submit" size="lg" fullWidth loading={loading}>
        Check in
      </Button>
    </form>
  );
}
