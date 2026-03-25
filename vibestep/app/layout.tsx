import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import { NotificationProvider } from "@/lib/notification-context";
import { NotificationToasts } from "@/components/notification-bell";
import { KeyboardShortcuts } from "@/components/keyboard-shortcuts";
import { GlobalSearch } from "@/components/global-search";
import { Analytics } from "@vercel/analytics/react";
import { I18nProvider } from "@/lib/i18n-provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Axiom – Understand your product before it breaks",
    template: "%s | Axiom",
  },
  description:
    "Paste your idea, stack, or build description. Axiom analyzes it and shows you what's weak, what will fail, and what to fix first. Structured product intelligence for indie hackers and AI builders.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  openGraph: {
    siteName: "Axiom",
    type: "website",
    title: "Axiom – Understand your product before it breaks",
    description:
      "Structured product intelligence for indie hackers and AI builders. Risk detection, architecture clarity, and execution paths — in 30 seconds.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Axiom – Understand your product before it breaks",
    description:
      "Paste your build. Get risk detection, architecture clarity, and an execution path. Structured product intelligence for builders.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" dir="ltr" className={`${geistSans.variable} h-full`}>
      <body className="min-h-full antialiased">
        <I18nProvider>
          <NotificationProvider>
            {children}
            <NotificationToasts />
            <KeyboardShortcuts />
            <GlobalSearch />
            <Analytics />
          </NotificationProvider>
        </I18nProvider>
      </body>
    </html>
  );
}
