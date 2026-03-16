import type { Metadata } from "next";
import { Inter, Archivo, Lora } from "next/font/google";
import { AuthProvider } from "@/lib/auth/auth-context";
import { DaimonToaster } from "@/components/ui/toast";
import { NavigationProgressBar } from "@/components/layout/progress-bar";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
  preload: true,
  weight: ["400", "500", "600", "700"],
});

const archivo = Archivo({
  subsets: ["latin"],
  variable: "--font-archivo",
  display: "swap",
  preload: true,
  weight: "variable", // Variable font — enables wdth axis (62.5–125)
  axes: ["wdth"],
});

const lora = Lora({
  subsets: ["latin"],
  variable: "--font-lora",
  display: "swap",
  preload: false, // Decorative only, not critical
  style: ["normal", "italic"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://daimon.ai"),
  title: {
    default: "Daimon — AI Operating System for Discord",
    template: "%s | Daimon",
  },
  description:
    "Daimon connects your Discord server to 50+ tools — GitHub, Linear, Toggl, Google Analytics, and more — powered by Claude AI. Bring your own API key. No subscriptions to your data.",
  keywords: [
    "discord ai bot",
    "discord automation",
    "ai assistant discord",
    "discord productivity bot",
    "claude ai discord",
    "discord github integration",
    "discord linear integration",
    "toggl discord",
    "discord project management",
    "byok ai bot",
    "bring your own api key discord",
    "discord ai operating system",
    "decision orchestrator",
  ],
  authors: [{ name: "PyMC Labs", url: "https://pymc-labs.com" }],
  creator: "PyMC Labs",
  publisher: "PyMC Labs",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-snippet": -1,
      "max-image-preview": "large",
    },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://daimon.ai",
    siteName: "Daimon",
    images: [
      {
        url: "/og/default.png",
        width: 1200,
        height: 630,
        alt: "Daimon — AI Operating System for Discord",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: "@daimon_ai",
    creator: "@daimon_ai",
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/icon-16.png", sizes: "16x16", type: "image/png" },
      { url: "/icon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
    ],
    apple: [{ url: "/apple-icon.png", sizes: "180x180", type: "image/png" }],
    shortcut: ["/favicon.ico"],
  },
  manifest: "/site.webmanifest",
  alternates: {
    canonical: "https://daimon.ai",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      dir="ltr"
      className={`${inter.variable} ${archivo.variable} ${lora.variable}`}
    >
      <body className="font-body text-navy bg-white antialiased">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:bg-white focus:text-navy focus:px-4 focus:py-2 focus:border-2 focus:border-aqua"
        >
          Skip to main content
        </a>
        <NavigationProgressBar />
        <AuthProvider>
          {children}
          <DaimonToaster />
        </AuthProvider>
      </body>
    </html>
  );
}
