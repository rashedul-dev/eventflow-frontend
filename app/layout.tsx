import type React from "react";
import type { Metadata, Viewport } from "next";
import { Inter, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { BrandedToaster } from "@/components/ui/branded-toast";
import { QueryProvider } from "@/lib/api/query-client";
import { AuthProvider } from "@/lib/auth/auth-context";
import { SupportChat } from "@/components/realtime/support-chat";
import "./globals.css";
import ErrorReporter from "@/components/ErrorReporter";
import Script from "next/script";
import { Toaster } from "sonner";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
});

export const metadata: Metadata = {
  title: "EventFlow | Modern Event Management Platform",
  description:
    "Create, discover, and manage unforgettable events. The all-in-one platform for event organizers and attendees.",
  keywords: ["events", "tickets", "event management", "concerts", "conferences", "festivals"],
  authors: [{ name: "EventFlow" }],
  creator: "EventFlow",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
    apple: "/favicon.svg",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://eventflow-live.vercel.app",
    siteName: "EventFlow",
    title: "EventFlow | Modern Event Management Platform",
    description: "Create, discover, and manage unforgettable events.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "EventFlow - Modern Event Management Platform",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "EventFlow | Modern Event Management Platform",
    description: "Create, discover, and manage unforgettable events.",
    images: ["/og-image.png"],
  },
  generator: "",
};

export const viewport: Viewport = {
  themeColor: "#000000",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <ErrorReporter />
        <Script
          src="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/scripts//route-messenger.js"
          strategy="afterInteractive"
          data-target-origin="*"
          data-message-type="ROUTE_CHANGE"
          data-include-search-params="true"
          data-only-in-iframe="true"
          data-debug="true"
          data-custom-data='{"appName": "YourApp", "version": "1.0.0", "greeting": "hi"}'
        />
        <QueryProvider>
          <AuthProvider>
            {children}
            <Toaster position="top-right" theme="dark" richColors closeButton />
            <BrandedToaster />
            <SupportChat />
          </AuthProvider>
        </QueryProvider>
        <Analytics />
      </body>
    </html>
  );
}
