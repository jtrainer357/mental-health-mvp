import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Billing",
  description: "Invoice management and collections overview",
};

export default function BillingLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
