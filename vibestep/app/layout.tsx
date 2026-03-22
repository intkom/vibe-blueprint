import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import { NotificationProvider } from "@/lib/notification-context";
import { ThemeProvider } from "@/lib/theme-context";
import { NotificationToasts } from "@/components/notification-bell";
import { KeyboardShortcuts } from "@/components/keyboard-shortcuts";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "VibeStep – Build smarter, faster",
    template: "%s | VibeStep",
  },
  description: "Paste your startup idea. Get the exact tech stack, architecture decisions, and 10 atomic build steps — in 30 seconds. Powered by Claude AI.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  openGraph: {
    siteName: "VibeStep",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} h-full`}>
      <body className="min-h-full bg-[#030014] antialiased">
        <ThemeProvider>
          <NotificationProvider>
            {children}
            <NotificationToasts />
            <KeyboardShortcuts />
          </NotificationProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
