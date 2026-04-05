"use client";

import * as React from "react";
import { useSearchParams } from "next/navigation";
import { PatientsPage } from "../_components/patients";
import { Skeleton } from "@/design-system/components/ui/skeleton";
import { PageShell } from "../_components/shared/page-shell";

function PatientsContent() {
  const searchParams = useSearchParams();
  const initialPatientId = searchParams.get("patient") || undefined;
  const initialPatientName = searchParams.get("patientName") || undefined;
  const initialTab = searchParams.get("tab") || undefined;
  const startSession = searchParams.get("startSession") === "true";

  return (
    <PatientsPage
      initialPatientId={initialPatientId}
      initialPatientName={initialPatientName}
      initialTab={initialTab}
      startSession={startSession}
    />
  );
}

function PatientsContentSkeleton() {
  return (
    <div className="flex h-full flex-col gap-4 lg:flex-row">
      <Skeleton className="h-64 w-full rounded-xl lg:h-full lg:w-80" />
      <Skeleton className="h-96 flex-1 rounded-xl lg:h-full" />
    </div>
  );
}

export default function PatientsRoute() {
  return (
    <PageShell activePage="patients" className="mx-auto min-h-[600px] max-w-[1600px]">
      <React.Suspense fallback={<PatientsContentSkeleton />}>
        <PatientsContent />
      </React.Suspense>
    </PageShell>
  );
}
