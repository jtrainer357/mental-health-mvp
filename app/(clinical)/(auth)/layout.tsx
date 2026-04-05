import type { Metadata } from "next";

export const metadata: Metadata = {
  title: { default: "Sign In", template: "%s | Tebra Mental Health" },
  description: "Sign in to your Tebra Mental Health practice management account",
};

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="from-backbone-1 to-growth-1/10 min-h-screen bg-gradient-to-br via-white">
      {children}
    </div>
  );
}
