"use client";

import * as React from "react";
import { useSearchParams } from "next/navigation";
import { LeftNav } from "../_components/left-nav";
import { HeaderSearch } from "../_components/header-search";
import { AnimatedBackground } from "@/design-system/components/ui/animated-background";
import { PageTransition } from "@/design-system/components/ui/page-transition";
import { PatientsPage } from "../_components/patients";
import { Skeleton } from "@/design-system/components/ui/skeleton";

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
    <div className="min-h-screen pb-24 lg:pb-0">
      <AnimatedBackground />

      {/* Left Nav */}
      <LeftNav activePage="patients" />

      {/* Main Content Wrapper */}
      <div className="lg:pl-36">
        <HeaderSearch />

        <main
          id="main-content"
          role="main"
          aria-label="Patients content"
          className="px-4 py-4 sm:px-6 sm:py-6 md:py-8"
        >
          <PageTransition>
            <div className="mx-auto min-h-[600px] max-w-[1600px]">
              <React.Suspense fallback={<PatientsContentSkeleton />}>
                <PatientsContent />
              </React.Suspense>
            </div>
          </PageTransition>
        </main>
      </div>
    </div>
  );
}
