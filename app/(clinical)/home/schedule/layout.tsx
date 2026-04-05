import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Schedule",
  description: "Practice appointment calendar and session management",
};

export default function ScheduleLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
