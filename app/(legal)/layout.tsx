import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";

export const metadata: Metadata = {
  title: {
    default: "Legal",
    template: "%s | Tebra Mental Health",
  },
  description: "Legal documents and policies for Tebra Mental Health",
};

/**
 * Legal Layout - Clean layout for legal/policy pages.
 * Provides consistent branding, navigation to other legal docs, and back-to-app link.
 */
export default function LegalLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto max-w-4xl px-6 py-4">
          <div className="flex items-center justify-between">
            <Link href="/home" className="transition-opacity hover:opacity-80">
              <Image
                src="/tebra-logo.svg"
                alt="Tebra Mental Health"
                width={120}
                height={29}
                priority
              />
            </Link>
            <Link
              href="/home"
              className="text-sm font-medium text-teal-dark hover:text-teal-dark/80"
            >
              Back to App
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-4xl px-6 py-12">{children}</main>

      {/* Footer with legal nav */}
      <footer className="border-t border-gray-200 bg-gray-50">
        <div className="mx-auto max-w-4xl px-6 py-8">
          <nav className="flex flex-wrap items-center justify-center gap-6 text-sm">
            <Link
              href="/terms"
              className="text-gray-600 hover:text-teal-dark transition-colors"
            >
              Terms of Service
            </Link>
            <span className="text-gray-300">|</span>
            <Link
              href="/privacy"
              className="text-gray-600 hover:text-teal-dark transition-colors"
            >
              Privacy Policy
            </Link>
            <span className="text-gray-300">|</span>
            <Link
              href="/baa"
              className="text-gray-600 hover:text-teal-dark transition-colors"
            >
              Business Associate Agreement
            </Link>
          </nav>
          <p className="mt-6 text-center text-xs text-gray-400">
            &copy; {new Date().getFullYear()} Tebra, Inc. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
