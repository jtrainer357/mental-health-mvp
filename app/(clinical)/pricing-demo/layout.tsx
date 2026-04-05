import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pricing Demo",
  description: "Explore Tebra Mental Health pricing tiers and features",
};

export default function PricingDemoLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
