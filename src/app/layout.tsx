import { SITE } from "@/lib/site";
import type { Metadata, Viewport } from "next";
import { Atkinson_Hyperlegible, Mukta_Malar, Noto_Sans_Tamil, Noto_Serif_Tamil, Noto_Serif } from "next/font/google";
import { PREPAINT } from "@/lib/themes";
import "./globals.css";
import { Providers } from "@/components/providers";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { AppChrome } from "@/components/app-chrome";
import { ReadingRuler } from "@/components/a11y";
import { AudioProvider } from "@/components/audio";
import { CommandPalette } from "@/components/palette";
import { AlertWatcher } from "@/components/price-alerts";
import { AutoRefresh } from "@/components/auto-refresh";

const mukta = Mukta_Malar({ subsets: ["tamil", "latin"], weight: ["400", "500", "600", "700", "800"], variable: "--font-mukta", display: "swap" });
const atkinson = Atkinson_Hyperlegible({ subsets: ["latin"], weight: ["400", "700"], variable: "--font-atkinson", display: "swap", preload: false });
const serifTa = Noto_Serif_Tamil({ subsets: ["tamil"], weight: ["400", "600", "700"], variable: "--font-serif-ta", display: "swap", preload: false });
const serifEn = Noto_Serif({ subsets: ["latin"], weight: ["400", "700"], variable: "--font-serif-en", display: "swap", preload: false });
const noto = Noto_Sans_Tamil({ subsets: ["tamil"], variable: "--font-noto-tamil", display: "swap" });

const DESC = "நாற்றிசைச் செய்திகளும் ஒரே இடத்தில் — Live Tamil Nadu (all 38 districts), all Indian states and world news from trusted sources, in Tamil and English.";
export const metadata: Metadata = {
  metadataBase: new URL(SITE),
  title: { default: "நாற்றிசை · Naatrisai — தமிழ்நாடு, இந்தியா, உலகச் செய்திகள்", template: "%s · நாற்றிசை" },
  description: DESC,
  applicationName: "Naatrisai",
  keywords: ["Tamil news", "தமிழ் செய்திகள்", "Tamil Nadu news", "district news", "India news", "world news", "Naatrisai", "நாற்றிசை"],
  alternates: { canonical: "/", types: { "application/rss+xml": [{ url: "/feed.xml", title: "Naatrisai RSS" }] } },
  openGraph: { type: "website", siteName: "நாற்றிசை · Naatrisai", locale: "ta_IN", alternateLocale: ["en_IN"], url: SITE, title: "நாற்றிசை · Naatrisai — நாற்றிசைச் செய்திகளும் ஒரே இடத்தில்", description: DESC, images: [{ url: "/og.png", width: 1200, height: 630, alt: "நாற்றிசை · Naatrisai" }] },
  twitter: { card: "summary_large_image", title: "நாற்றிசை · Naatrisai", description: DESC, images: ["/og.png"] },
  appleWebApp: { capable: true, title: "நாற்றிசை", statusBarStyle: "default" },
  icons: { icon: [{ url: "/icon.svg", type: "image/svg+xml" }, { url: "/icon-192.png", sizes: "192x192", type: "image/png" }], apple: "/apple-touch-icon.png" },
  formatDetection: { telephone: false },
};
export const viewport: Viewport = { themeColor: [{ media: "(prefers-color-scheme: light)", color: "#c8321a" }, { media: "(prefers-color-scheme: dark)", color: "#0b0a14" }] };

// Applied before first paint so theme, text size and modes don't flash.
const themeScript = PREPAINT;
const jsonLd = { "@context": "https://schema.org", "@type": "WebSite", name: "நாற்றிசை · Naatrisai", url: SITE, inLanguage: ["ta", "en"], potentialAction: { "@type": "SearchAction", target: `${SITE}/search?q={q}`, "query-input": "required name=q" } };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ta" className={`${mukta.variable} ${noto.variable} ${atkinson.variable} ${serifTa.variable} ${serifEn.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      </head>
      <body className="min-h-dvh font-sans">
        <Providers>
        <AudioProvider>
          <Header />
          <main id="main" className="mx-auto w-full max-w-7xl px-3 pb-24 sm:px-5 md:pb-10">{children}</main>
          <Footer />
          <AppChrome />
          <ReadingRuler />
          <CommandPalette />
          <AlertWatcher />
          <AutoRefresh />
        </AudioProvider>
        </Providers>
      </body>
    </html>
  );
}
