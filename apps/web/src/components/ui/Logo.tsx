// apps/web/src/components/ui/Logo.tsx
import Image from "next/image";
import Link from "next/link";

type LogoProps = {
  /** Rendered height in pixels. Width follows the image's aspect ratio. */
  height?: number;
  /** Wrap the logo in a link to the home page. */
  href?: string | null;
  className?: string;
  /** Load immediately (use for the logo above the fold, e.g. header / login). */
  priority?: boolean;
  /**
   * Show "ME_CBO" next to the picture. Use it in small spots (header, top bar),
   * where the name inside the logo is too small to read.
   */
  showName?: boolean;
};

/**
 * ME_CBO logo: apps/web/public/logo.png (500 x 500).
 * If you replace the file with one of another size, update the two numbers below.
 */
const LOGO_SRC = "/logo.png";
const LOGO_WIDTH = 500;
const LOGO_HEIGHT = 500;

export function Logo({
  height = 40,
  href = "/",
  className,
  priority,
  showName = false,
}: LogoProps) {
  const width = Math.round((LOGO_WIDTH / LOGO_HEIGHT) * height);

  const content = (
    <>
      <Image
        src={LOGO_SRC}
        alt={showName ? "" : "Mosoriot Environmental CBO"}
        width={width}
        height={height}
        priority={priority}
        className={className}
        style={{ height, width: "auto", maxWidth: "100%", objectFit: "contain" }}
      />
      {showName && (
        <span className="font-display text-lg font-bold tracking-tight text-[var(--primary)]">
          ME_CBO
        </span>
      )}
    </>
  );

  if (href === null) {
    return <span className="inline-flex items-center gap-2">{content}</span>;
  }
  return (
    <Link
      href={href}
      aria-label="Mosoriot Environmental CBO home"
      className="inline-flex items-center gap-2"
    >
      {content}
    </Link>
  );
}
