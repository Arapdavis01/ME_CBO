import type { Metadata, Viewport } from "next";
import { Inter, Sora } from "next/font/google";
import "@/styles/globals.css";
import { AppProviders } from "@/components/providers/AppProviders";
import { ServiceWorkerRegister } from "@/components/pwa/ServiceWorkerRegister";
import { AnnouncementBanner } from "@/components/announcements/AnnouncementBanner";
import { siteConfig } from "@/config/site";

/* -------------------------------------------------------------------------- */
/*  Fonts                                                                      */
/* -------------------------------------------------------------------------- */

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
  preload: true,
  fallback: ["system-ui", "-apple-system", "Segoe UI", "Roboto", "sans-serif"],
});

const sora = Sora({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
  preload: true,
  fallback: ["Inter", "system-ui", "sans-serif"],
});

/* -------------------------------------------------------------------------- */
/*  Metadata                                                                   */
/* -------------------------------------------------------------------------- */

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://mecbo.org";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),

  title: {
    default: `${siteConfig.shortName} — ${siteConfig.motto}`,
    template: `%s · ${siteConfig.shortName}`,
  },

  description: siteConfig.description,
  applicationName: siteConfig.name,

  keywords: [
    "Mosoriot Environmental CBO",
    "ME_CBO",
    "tree planting Kenya",
    "community clean-up",
    "environmental conservation",
    "Nandi County",
    "zero waste",
    "climate action Kenya",
    "carbon offset",
    "volunteer Kenya",
  ],

  authors: [{ name: siteConfig.fullName }],
  creator: siteConfig.fullName,
  publisher: siteConfig.fullName,

  category: "environment",
  classification: "nonprofit",

  manifest: "/manifest.webmanifest",

  alternates: {
    canonical: "/",
  },

  openGraph: {
    type: "website",
    siteName: siteConfig.name,
    title: `${siteConfig.shortName} — ${siteConfig.motto}`,
    description: siteConfig.description,
    url: SITE_URL,
    locale: "en_KE",
    images: [
      {
        url: "/images/og-default.png",
        width: 1200,
        height: 630,
        alt: `${siteConfig.shortName} — ${siteConfig.motto}`,
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: `${siteConfig.shortName} — ${siteConfig.motto}`,
    description: siteConfig.description,
    images: ["/images/og-default.png"],
  },

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },

  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: siteConfig.shortName,
  },

  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },

  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icons/icon-192.png", type: "image/png", sizes: "192x192" },
      { url: "/icons/icon-512.png", type: "image/png", sizes: "512x512" },
    ],
    apple: [{ url: "/icons/icon-192.png", sizes: "192x192" }],
    shortcut: ["/favicon.ico"],
  },

  other: {
    "mobile-web-app-capable": "yes",
    "apple-mobile-web-app-capable": "yes",
    "apple-mobile-web-app-status-bar-style": "black-translucent",
    "apple-mobile-web-app-title": siteConfig.shortName,
    "msapplication-TileColor": "#14532d",
    "msapplication-config": "/browserconfig.xml",
  },
};

/* -------------------------------------------------------------------------- */
/*  Viewport                                                                   */
/* -------------------------------------------------------------------------- */

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  viewportFit: "cover", // iPhone notch + safe-area insets
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#14532d" },
    { media: "(prefers-color-scheme: dark)", color: "#0b1220" },
  ],
  colorScheme: "light dark",
};

/* -------------------------------------------------------------------------- */
/*  Theme flash prevention (runs before React hydration)                       */
/* -------------------------------------------------------------------------- */

const themeInitScript = `
(function() {
  try {
    var stored = localStorage.getItem("me-theme");
    var prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    var theme = stored === "dark" || stored === "light" ? stored : (prefersDark ? "dark" : "light");
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    }
    document.documentElement.style.colorScheme = theme;
  } catch (e) {
    /* localStorage blocked — fall back to light */
  }
})();
`.trim();

/* -------------------------------------------------------------------------- */
/*  Root Layout                                                                */
/* -------------------------------------------------------------------------- */

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      dir="ltr"
      suppressHydrationWarning
      className="scroll-smooth"
    >
      <head>
        {/* Runs synchronously to set .dark class before paint */}
        <script
          dangerouslySetInnerHTML={{ __html: themeInitScript }}
        />
      </head>
      <body
        className={`${inter.variable} ${sora.variable} min-h-[100dvh] bg-[var(--bg)] text-[var(--fg)] antialiased`}
      >
        {/* Accessibility: skip link — visible on focus only */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-[100] focus:rounded-md focus:bg-[var(--primary)] focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-[var(--primary-fg)] focus:shadow-geo"
        >
          Skip to main content
        </a>

        {/* Site-wide notice (e.g. planned update). Controlled from the dashboard. */}
        <AnnouncementBanner />

        {/* PWA service worker — registers after load */}
        <ServiceWorkerRegister />

        <AppProviders>
          <div id="main-content">{children}</div>
        </AppProviders>

        {/* No-JS fallback */}
        <noscript>
          <div
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 9999,
              display: "grid",
              placeItems: "center",
              padding: "1.5rem",
              background: "#f8fafc",
              color: "#0f172a",
              fontFamily: "system-ui, sans-serif",
              textAlign: "center",
            }}
          >
            <div style={{ maxWidth: "28rem" }}>
              <h1 style={{ fontSize: "1.25rem", fontWeight: 700, margin: 0 }}>
                JavaScript is required
              </h1>
              <p style={{ marginTop: "0.5rem", fontSize: "0.875rem", color: "#475569" }}>
                Please enable JavaScript in your browser to use the ME_CBO platform.
              </p>
            </div>
          </div>
        </noscript>
      </body>
    </html>
  );
}
