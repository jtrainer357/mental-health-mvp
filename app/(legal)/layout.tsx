import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";

export const metadata: Metadata = {
  title: {
    default: "Legal",
    template: "%s | Tebra Mental Health",
  },
};

export default function LegalLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="from-backbone-1 to-growth-1/10 min-h-screen bg-gradient-to-br via-white">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-4">
          <Link href="/" className="flex items-center gap-2">
            <Image src="/tebra-logo.svg" alt="Tebra Mental Health" width={100} height={24} />
          </Link>
          <nav className="flex gap-6 text-sm">
            <Link href="/terms" className="text-muted-foreground hover:text-foreground">
              Terms
            </Link>
            <Link href="/privacy" className="text-muted-foreground hover:text-foreground">
              Privacy
            </Link>
            <Link href="/baa" className="text-muted-foreground hover:text-foreground">
              BAA
            </Link>
          </nav>
        </div>
      </header>

      {/* Content */}
      <main className="mx-auto max-w-4xl px-4 py-12">{children}</main>

      {/* Footer */}
      <footer className="border-t bg-white/80 backdrop-blur-sm">
        <div className="text-muted-foreground mx-auto max-w-4xl px-4 py-6 text-center text-sm">
          <p>&copy; {new Date().getFullYear()} Tebra. All rights reserved.</p>
          <p className="mt-2">
            Questions? Contact us at{" "}
            <a href="mailto:legal@tebra.com" className="text-teal-dark hover:underline">
              legal@tebra.com
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
}
