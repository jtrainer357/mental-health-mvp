import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Communications",
  description: "Unified patient messaging across SMS, email, and voice",
};

export default function CommunicationsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
