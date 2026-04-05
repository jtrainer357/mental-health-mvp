import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";

export const metadata: Metadata = {
  title: { default: "Legal", template: "%s | Tebra Mental Health" },
};

export default function LegalLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-white">
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-6 py-4">
          <Link href="/home">
            <Image src="/tebra-logo.svg" alt="Tebra" width={120} height={29} priority />
          </Link>
          <Link href="/home" className="text-teal-dark text-sm font-medium">
            Back to App
          </Link>
        </div>
      </header>
      <main className="mx-auto max-w-4xl px-6 py-12">{children}</main>
      <footer className="border-t border-gray-200 bg-gray-50">
        <div className="mx-auto max-w-4xl px-6 py-8">
          <nav className="flex justify-center gap-6 text-sm">
            <Link href="/terms" className="hover:text-teal-dark text-gray-600">
              Terms
            </Link>
            <Link href="/privacy" className="hover:text-teal-dark text-gray-600">
              Privacy
            </Link>
            <Link href="/baa" className="hover:text-teal-dark text-gray-600">
              BAA
            </Link>
          </nav>
        </div>
      </footer>
    </div>
  );
}
