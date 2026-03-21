import type { Metadata } from "next";
import { Newsreader, Public_Sans, Geist } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

const newsreader = Newsreader({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

const publicSans = Public_Sans({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

export const metadata: Metadata = {
  title: "SEC Compliance Navigator",
  description:
    "Compute SEC compliance penalties for Philippine corporations and get a clear path to good standing.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={cn(newsreader.variable, publicSans.variable, "font-sans", geist.variable)}>
      <body className="font-body antialiased">{children}</body>
    </html>
  );
}
