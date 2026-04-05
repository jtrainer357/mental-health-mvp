import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Home",
  description: "AI-powered command center with prioritized clinical actions",
};

export default function HomeLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
