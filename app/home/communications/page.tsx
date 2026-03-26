"use client";

import { CommunicationsPage } from "../_components/communications-page";
import { PageShell } from "../_components/shared/page-shell";

export default function CommunicationsRoute() {
  return (
    <PageShell activePage="messages" mainClassName="px-4 sm:px-6">
      <CommunicationsPage />
    </PageShell>
  );
}
