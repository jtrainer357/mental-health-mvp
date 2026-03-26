"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { PriorityAction } from "@/design-system/components/ui/priority-action";
import { AIActionCard } from "@/design-system/components/ui/ai-action-card";
import { Heading, Text } from "@/design-system/components/ui/typography";
import { AlertTriangle, Database, RefreshCw, Sparkles } from "lucide-react";
import { PriorityActionCardSkeleton, Skeleton } from "@/design-system/components/ui/skeleton";
import { Button } from "@/design-system/components/ui/button";
import { formatDemoDate } from "@/src/lib/utils/demo-date";
import type { OrchestrationContext } from "@/src/lib/orchestration/types";
import { useCompletedPatients } from "@/src/components/orchestration";

import { usePriorityActions } from "./hooks/use-priority-actions";
import {
  formatTime12h,
  getBadgeVariant,
  getBadgeText,
  unifiedActionToContext,
  appointmentToContext,
} from "./utils/priority-action-utils";

// ─── Shared Section Header ──────────────────────────────────────────────────

interface SectionHeaderProps {
  appointmentCount?: number;
  isLoading?: boolean;
  children?: React.ReactNode;
}

function SectionHeader({ appointmentCount, isLoading, children }: SectionHeaderProps) {
  const formattedDate = formatDemoDate("long");

  return (
    <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-center lg:mb-5">
      <div className="flex items-center gap-4">
        <Image
          src="/icons/caring-hands.png"
          alt=""
          role="presentation"
          width={56}
          height={56}
          className="shrink-0"
        />
        <div className="min-w-0 flex-1">
          <Heading level={3} className="text-xl sm:text-2xl">
            Today&apos;s Actions
          </Heading>
          <Text size="xs" muted className="mt-1 tracking-widest uppercase">
            {isLoading ? (
              <Skeleton as="span" className="inline-block h-3 w-48" />
            ) : (
              <>
                {formattedDate}
                {typeof appointmentCount === "number" && (
                  <>
                    {" "}
                    •{" "}
                    <span className="text-card-foreground font-semibold">
                      {appointmentCount} Appointments
                    </span>
                  </>
                )}
              </>
            )}
          </Text>
        </div>
      </div>
      {children}
    </div>
  );
}

// Exported header component for use in parent layouts
interface TodaysActionsHeaderProps {
  appointmentCount: number;
  isLoading?: boolean;
}

export function TodaysActionsHeader({ appointmentCount, isLoading }: TodaysActionsHeaderProps) {
  const formattedDate = formatDemoDate("long");

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-center">
      <div className="flex items-center gap-4">
        <Image
          src="/icons/caring-hands.png"
          alt=""
          role="presentation"
          width={56}
          height={56}
          className="shrink-0"
        />
        <div className="min-w-0 flex-1">
          <Heading level={3} className="text-xl sm:text-2xl">
            Today&apos;s Actions
          </Heading>
          <Text size="xs" muted className="mt-1 tracking-widest uppercase">
            {isLoading ? (
              "Loading..."
            ) : (
              <>
                {formattedDate} •{" "}
                <span className="text-card-foreground font-semibold">
                  {appointmentCount} Appointments
                </span>
              </>
            )}
          </Text>
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ─────────────────────────────────────────────────────────

interface PriorityActionsSectionProps {
  className?: string;
  onSelectPatient?: (context: OrchestrationContext) => void;
  hideHeader?: boolean;
}

export function PriorityActionsSection({
  className,
  onSelectPatient,
  hideHeader = false,
}: PriorityActionsSectionProps) {
  const router = useRouter();
  const completedPatientIds = useCompletedPatients();
  const {
    actions,
    allActions,
    todayAppts,
    loading,
    scanning,
    scanResult,
    error,
    dbReady,
    handleRunAnalysis,
  } = usePriorityActions();

  // Listen for voice command to open patient actions
  React.useEffect(() => {
    function handleVoiceOpenPatient(e: CustomEvent<{ patientName: string }>) {
      const targetName = e.detail.patientName.toLowerCase();

      // Try to find patient in actions first
      const matchingAction = actions.find((a) => {
        const fullName = `${a.patient.first_name} ${a.patient.last_name}`.toLowerCase();
        return fullName.includes(targetName) || targetName.includes(fullName);
      });

      if (matchingAction) {
        onSelectPatient?.(unifiedActionToContext(matchingAction));
        return;
      }

      // Try appointments
      const matchingAppt = todayAppts.find((a) => {
        const fullName = `${a.patient.first_name} ${a.patient.last_name}`.toLowerCase();
        return fullName.includes(targetName) || targetName.includes(fullName);
      });

      if (matchingAppt) {
        onSelectPatient?.(appointmentToContext(matchingAppt, allActions));
      }
    }

    window.addEventListener("voice-open-patient-actions", handleVoiceOpenPatient as EventListener);
    return () => {
      window.removeEventListener(
        "voice-open-patient-actions",
        handleVoiceOpenPatient as EventListener
      );
    };
  }, [actions, allActions, todayAppts, onSelectPatient]);

  // Get the first arriving/scheduled patient
  const arrivingPatient = todayAppts.find((a) => a.status === "Scheduled") || todayAppts[0];

  // Loading state with skeleton
  if (loading) {
    return (
      <section className={className}>
        <SectionHeader isLoading>
          <Skeleton className="h-10 w-full rounded-full sm:ml-auto sm:w-36" />
        </SectionHeader>
        {/* Arriving patient skeleton */}
        <div className="bg-priority-bg/30 mb-10 rounded-xl p-4 sm:p-6 md:p-8">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4 sm:gap-5">
              <Skeleton className="h-16 w-16 shrink-0 rounded-full sm:h-20 sm:w-20" />
              <div className="min-w-0 flex-1">
                <Skeleton className="mb-2 h-3 w-24" />
                <Skeleton className="mb-2 h-7 w-full max-w-[14rem]" />
                <Skeleton className="h-4 w-40" />
              </div>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row">
              <Skeleton className="h-12 w-full rounded-full sm:w-40" />
              <Skeleton className="h-12 w-full rounded-full sm:w-32" />
            </div>
          </div>
        </div>
        {/* Action cards skeleton */}
        <div className="space-y-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <PriorityActionCardSkeleton key={i} />
          ))}
        </div>
      </section>
    );
  }

  // Database not populated state
  if (dbReady === false) {
    return (
      <section className={className}>
        <SectionHeader />
        <div className="border-muted-foreground/30 bg-muted/20 flex flex-col items-center justify-center rounded-lg border border-dashed py-12">
          <Database className="text-muted-foreground/50 h-12 w-12" />
          <Text size="sm" muted className="mt-4 text-center">
            No data imported yet.
          </Text>
          <Text size="xs" muted className="mt-1 max-w-sm text-center">
            Run the import wizard to populate the database with patient data and generate AI-powered
            priority actions.
          </Text>
          <Link href="/import" prefetch={true} className="mt-4">
            <Button variant="default" size="sm">
              Start Import
            </Button>
          </Link>
        </div>
      </section>
    );
  }

  // Error state
  if (error) {
    return (
      <section className={className}>
        <SectionHeader />
        <div className="border-destructive/30 bg-destructive/10 flex flex-col items-center justify-center rounded-lg border py-12">
          <AlertTriangle className="text-destructive h-8 w-8" />
          <Text size="sm" className="text-destructive mt-3">
            {error}
          </Text>
          <Button variant="outline" size="sm" className="mt-4" onClick={() => router.refresh()}>
            Retry
          </Button>
        </div>
      </section>
    );
  }

  // Empty state
  if (actions.length === 0) {
    return (
      <section className={className}>
        <SectionHeader appointmentCount={todayAppts.length} />
        <div className="border-muted-foreground/30 bg-muted/20 flex flex-col items-center justify-center rounded-lg border border-dashed py-12">
          <Text size="sm" muted className="text-center">
            All caught up! No priority actions right now.
          </Text>
        </div>
      </section>
    );
  }

  return (
    <section className={className}>
      {!hideHeader && (
        <SectionHeader appointmentCount={todayAppts.length}>
          <div className="flex w-full flex-col gap-2 sm:ml-auto sm:w-auto sm:flex-row">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRunAnalysis}
              disabled={scanning}
              className="flex items-center gap-2"
            >
              {scanning ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <Sparkles className="h-4 w-4" />
              )}
              {scanning ? "Analyzing..." : "Run AI Analysis"}
            </Button>
          </div>
        </SectionHeader>
      )}

      {/* Scan result notification */}
      {scanResult && (
        <div className="bg-growth-1/20 text-growth-4 mb-4 rounded-lg px-4 py-3 text-sm">
          {scanResult}
        </div>
      )}

      <div className="space-y-4">
        {/* Top coral "arriving" card - if there's an arriving patient */}
        {arrivingPatient && (
          <div
            onClick={() => onSelectPatient?.(appointmentToContext(arrivingPatient, allActions))}
            className="mb-2 block cursor-pointer"
            role="button"
            tabIndex={0}
            aria-label={`${arrivingPatient.patient.first_name} ${arrivingPatient.patient.last_name} is arriving — view actions`}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                if (e.key === " ") e.preventDefault();
                onSelectPatient?.(appointmentToContext(arrivingPatient, allActions));
              }
            }}
          >
            <PriorityAction
              title={`${arrivingPatient.patient.first_name} ${arrivingPatient.patient.last_name} is arriving`}
              subtitle={`${formatTime12h(arrivingPatient.start_time)} appointment • ${arrivingPatient.service_type}`}
              avatarInitials={`${arrivingPatient.patient.first_name[0]}${arrivingPatient.patient.last_name[0]}`}
              avatarSrc={arrivingPatient.patient.avatar_url || undefined}
              avatarHref={`/home/patients?patientName=${encodeURIComponent(`${arrivingPatient.patient.first_name} ${arrivingPatient.patient.last_name}`)}`}
              buttonText="Enter Session"
              onButtonClick={() => {
                router.push(
                  `/home/patients?patientName=${encodeURIComponent(`${arrivingPatient.patient.first_name} ${arrivingPatient.patient.last_name}`)}&startSession=true`
                );
              }}
            />
          </div>
        )}

        {/* AI Action Cards from database */}
        <div className="space-y-2">
          {actions.map((action) => {
            const patientName = `${action.patient.first_name} ${action.patient.last_name}`;
            const suggestedCount = action.suggested_actions.length;

            // Show trigger type badge for substrate actions
            const statusIndicator =
              action.source === "substrate" && action.trigger_type
                ? `${action.trigger_type.replace(/_/g, " ")} • ${action.context || ""}`
                : action.context || "";

            return (
              <div
                key={action.id}
                onClick={() => onSelectPatient?.(unifiedActionToContext(action))}
                className="block cursor-pointer"
                role="button"
                tabIndex={0}
                aria-label={`${action.patient.first_name} ${action.patient.last_name} — ${action.title}`}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    if (e.key === " ") e.preventDefault();
                    onSelectPatient?.(unifiedActionToContext(action));
                  }
                }}
              >
                <AIActionCard
                  patientName={patientName}
                  avatarSrc={action.patient.avatar_url || undefined}
                  avatarHref={`/home/patients?patientName=${encodeURIComponent(patientName)}`}
                  mainAction={action.title}
                  statusIndicators={statusIndicator}
                  readyStatus={`Confidence: ${action.confidence}%`}
                  suggestedActions={suggestedCount}
                  badgeText={getBadgeText(action.urgency, action.timeframe)}
                  badgeVariant={getBadgeVariant(action.urgency)}
                  completed={completedPatientIds.includes(action.patient.id)}
                />
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
