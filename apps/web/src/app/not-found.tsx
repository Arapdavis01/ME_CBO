import Link from "next/link";
import { Button } from "@/components/ui/Button";

export default function NotFound() {
  return (
    <main className="grid min-h-[100dvh] place-items-center bg-[var(--bg)] px-4">
      <div className="max-w-md text-center">
        <p className="text-sm font-semibold text-[var(--primary)]">404</p>
        <h1 className="mt-2 text-[var(--fg)]">Page not found</h1>
        <p className="mt-2 text-sm text-[var(--fg-muted)]">
          The page you&apos;re looking for doesn&apos;t exist or has moved.
        </p>
        <div className="mt-6 flex flex-col gap-2 xs:flex-row xs:justify-center">
          <Link href="/"><Button fullWidth>Go home</Button></Link>
          <Link href="/dashboard"><Button variant="secondary" fullWidth>Dashboard</Button></Link>
        </div>
      </div>
    </main>
  );
}
