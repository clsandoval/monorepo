import type { Metadata } from "next";
import { Source_Serif_4, Inter } from "next/font/google";
import "./globals.css";

const sourceSerif = Source_Serif_4({
  subsets: ["latin"],
  variable: "--font-heading",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

export const metadata: Metadata = {
  title: "RPVARA Tax Amnesty Calculator — RA 12001 Section 30",
  description:
    "Calculate your real property tax amnesty savings under Republic Act 12001. See how much you save on penalties before the July 5, 2026 deadline.",
  openGraph: {
    title: "RPVARA Tax Amnesty Calculator",
    description:
      "Free calculator for RA 12001 real property tax amnesty. Compute principal due, penalties waived, and total savings before the July 5, 2026 deadline.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${sourceSerif.variable} ${inter.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-body">{children}</body>
    </html>
  );
}
