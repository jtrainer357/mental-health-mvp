import { redirect } from "next/navigation";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Home",
  description: "AI-powered command center with prioritized clinical actions",
};

export default function Home() {
  redirect("/home");
}
