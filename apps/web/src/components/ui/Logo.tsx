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
};

/**
 * ME_CBO logo. The image already contains the name "ME CBO",
 * so no text is rendered next to it.
 *
 * File: apps/web/public/logo.png
 * If your file has another name or format (logo.svg, logo.jpg), change LOGO_SRC.
 */
const LOGO_SRC = "/logo.png";

// Intrinsic size of the file. Set these to your image's real width and height
// (right-click the file → Properties → Details) so it is not distorted.
const LOGO_WIDTH = 600;
const LOGO_HEIGHT = 200;

export function Logo({ height = 40, href = "/", className, priority }: LogoProps) {
  const width = Math.round((LOGO_WIDTH / LOGO_HEIGHT) * height);

  const img = (
    <Image
      src={LOGO_SRC}
      alt="ME CBO"
      width={width}
      height={height}
      priority={priority}
      className={className}
      style={{ height, width: "auto" }}
    />
  );

  if (href === null) return img;
  return (
    <Link href={href} aria-label="ME CBO home" className="inline-flex items-center">
      {img}
    </Link>
  );
}
