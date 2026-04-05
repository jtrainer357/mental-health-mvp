import { ImportWizard } from "@/src/components/import";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Data Import",
  description: "AI-powered practice data migration wizard",
};

export default function ImportPage() {
  return (
    <main className="min-h-screen bg-gray-50 py-8">
      <ImportWizard />
    </main>
  );
}
