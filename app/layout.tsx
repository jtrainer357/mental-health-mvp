import "@/design-system/styles/globals.css";
import { SkipLink } from "@/src/components/a11y";
import type { Metadata, Viewport } from "next";

export const metadata: Metadata = {
  title: {
    default: "Tebra Mental Health",
    template: "%s | Tebra Mental Health",
  },
  description: "AI-native practice management platform for mental health practitioners",
  robots: { index: false, follow: false },
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Tebra MH",
  },
  applicationName: "Tebra Mental Health",
  icons: {
    icon: [
      { url: "/icons/icon-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512x512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/icons/icon-152x152.png", sizes: "152x152", type: "image/png" },
      { url: "/icons/icon-192x192.png", sizes: "192x192", type: "image/png" },
    ],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: "#0D9488",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="safe-area-inset">
        <SkipLink />
        {children}
      </body>
    </html>
  );
}
