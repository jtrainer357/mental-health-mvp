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
import { getPriorityActions } from "@/src/lib/queries/priority-actions";
import { getTodayAppointments } from "@/src/lib/queries/appointments";
import { isDatabasePopulated } from "@/src/lib/queries/practice";
import { formatDemoDate } from "@/src/lib/utils/demo-date";
import type { PriorityActionWithPatient } from "@/src/lib/supabase/types";
import type { AppointmentWithPatient } from "@/src/lib/queries/appointments";
import type { OrchestrationContext, SuggestedAction } from "@/src/lib/orchestration/types";
import type { SubstrateActionWithPatient } from "@/src/lib/substrate/service";
import { useCompletedPatients } from "@/src/components/orchestration";
import { createLogger } from "@/src/lib/logger";

const log = createLogger("PriorityActionsSection");

/** Format 24h time (e.g. "09:00") to 12h (e.g. "9:00 AM") */
function formatTime12h(time: string): string {
  const [hours, minutes] = time.split(":").map(Number);
  const period = hours! >= 12 ? "PM" : "AM";
  const displayHours = hours! % 12 || 12;
  return `${displayHours}:${String(minutes).padStart(2, "0")} ${period}`;
}

/**
 * Unified action type that combines both substrate and priority actions
 */
interface UnifiedAction {
  id: string;
  source: "substrate" | "priority";
  patient: {
    id: string;
    first_name: string;
    last_name: string;
    date_of_birth: string;
    risk_level: string | null;
    avatar_url: string | null;
  };
  title: string;
  urgency: "urgent" | "high" | "medium" | "low";
  confidence: number;
  timeframe: string | null;
  context: string | null;
  reasoning?: string | null;
  trigger_type?: string;
  suggested_actions: SuggestedActionItem[];
}

interface SuggestedActionItem {
  label: string;
  type: string;
  completed?: boolean;
}

interface PriorityActionsSectionProps {
  className?: string;
  onSelectPatient?: (context: OrchestrationContext) => void;
  hideHeader?: boolean;
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
      <Button variant="outline" className="w-full shrink-0 sm:ml-auto sm:w-auto">
        Complete All Actions
      </Button>
    </div>
  );
}

// Map urgency to badge variant
function getBadgeVariant(urgency: string): "urgent" | "warning" | "success" | "default" {
  switch (urgency) {
    case "urgent":
      return "urgent";
    case "high":
      return "warning";
    case "medium":
      return "success";
    default:
      return "default";
  }
}

// Map urgency to badge text
function getBadgeText(urgency: string, timeframe: string | null): string {
  if (urgency === "urgent") return "URGENT";
  if (timeframe === "Immediate" || timeframe === "Today") return "TODAY";
  if (timeframe === "Within 3 days") return "WITHIN 3 DAYS";
  return "ACTION NEEDED";
}

// Map trigger type to orchestration trigger type
function mapTriggerType(
  triggerType?: string
): "lab_result" | "refill" | "screening" | "appointment" {
  switch (triggerType) {
    case "OUTCOME_SCORE_ELEVATED":
    case "OUTCOME_MEASURE_SCORED":
      return "screening";
    case "MEDICATION_REFILL_APPROACHING":
      return "refill";
    case "APPOINTMENT_MISSED":
    case "PATIENT_NOT_SEEN":
      return "appointment";
    default:
      return "screening";
  }
}

// Map action type to orchestration action type
function mapActionType(
  actionType: string
): "message" | "order" | "medication" | "task" | "document" {
  switch (actionType) {
    case "message_send":
      return "message";
    case "medication_action":
      return "medication";
    case "note_sign":
    case "note_create":
      return "document";
    default:
      return "task";
  }
}

// Convert unified action to OrchestrationContext for the detail view
function unifiedActionToContext(action: UnifiedAction): OrchestrationContext {
  const patient = action.patient;
  return {
    patient: {
      id: patient.id,
      name: `${patient.first_name} ${patient.last_name}`,
      mrn: patient.id.substring(0, 8),
      dob: patient.date_of_birth,
      age: Math.floor(
        (Date.now() - new Date(patient.date_of_birth).getTime()) / (365.25 * 24 * 60 * 60 * 1000)
      ),
      primaryDiagnosis: action.context || "Mental Health",
      avatar: patient.avatar_url || `https://i.pravatar.cc/150?u=${patient.id}`,
    },
    trigger: {
      type: mapTriggerType(action.trigger_type),
      title: action.title,
      urgency:
        action.urgency === "urgent" ? "urgent" : action.urgency === "high" ? "high" : "medium",
    },
    clinicalData: {},
    suggestedActions: action.suggested_actions.map((suggestion, i) => ({
      id: String(i + 1),
      label: suggestion.label,
      type: mapActionType(suggestion.type),
      checked: suggestion.completed ?? false,
    })),
  };
}

// Convert priority_actions row to unified action format
function priorityActionToUnified(action: PriorityActionWithPatient): UnifiedAction {
  const suggestedActions = Array.isArray(action.suggested_actions)
    ? (action.suggested_actions as string[]).map((s) => ({
        label: s,
        type: "task",
        completed: false,
      }))
    : [];

  return {
    id: action.id,
    source: "priority",
    patient: action.patient,
    title: action.title,
    urgency: action.urgency as "urgent" | "high" | "medium" | "low",
    confidence: action.confidence_score || 85,
    timeframe: action.timeframe,
    context: action.clinical_context,
    suggested_actions: suggestedActions,
  };
}

// Convert substrate_actions row to unified action format
function substrateActionToUnified(action: SubstrateActionWithPatient): UnifiedAction | null {
  if (!action.patient) return null;

  const suggestedActions = Array.isArray(action.suggested_actions)
    ? action.suggested_actions.map((s) => ({
        label: (s as { label?: string }).label || String(s),
        type: (s as { type?: string }).type || "task",
        completed: (s as { completed?: boolean }).completed ?? false,
      }))
    : [];

  return {
    id: action.id,
    source: "substrate",
    patient: action.patient,
    title: action.title,
    urgency: action.urgency as "urgent" | "high" | "medium" | "low",
    confidence: action.ai_confidence,
    timeframe: action.time_frame,
    context: action.context,
    reasoning: action.ai_reasoning,
    trigger_type: action.trigger_type,
    suggested_actions: suggestedActions,
  };
}

/**
 * Fetch substrate actions from API
 */
async function fetchSubstrateActions(): Promise<SubstrateActionWithPatient[]> {
  try {
    const response = await fetch("/api/substrate/actions?status=active&limit=10");
    if (!response.ok) {
      // Silently fail if substrate_actions table doesn't exist yet
      // This is expected until the migration is applied
      return [];
    }
    const data = await response.json();
    return data.actions || [];
  } catch {
    // Silently fail - substrate table may not exist yet
    return [];
  }
}

/**
 * Run substrate scan and return results
 */
async function runSubstrateScan(): Promise<{
  success: boolean;
  actions_created: number;
  triggers_detected: number;
  error?: string;
}> {
  try {
    const response = await fetch("/api/substrate/scan", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ triggered_by: "manual" }),
    });
    if (!response.ok) {
      throw new Error(`Scan failed: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    log.error("Substrate scan failed", error);
    return {
      success: false,
      actions_created: 0,
      triggers_detected: 0,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

// Generate suggested actions for an appointment based on service type and patient context
function generateAppointmentActions(
  apt: AppointmentWithPatient,
  matchingActions: UnifiedAction[]
): SuggestedAction[] {
  // If we have matching priority actions for this patient, use those suggested actions
  if (matchingActions.length > 0) {
    const allSuggestions: SuggestedAction[] = [];
    let idCounter = 1;
    for (const action of matchingActions) {
      for (const suggestion of action.suggested_actions) {
        allSuggestions.push({
          id: String(idCounter++),
          label: suggestion.label,
          type: mapActionType(suggestion.type),
          checked: false,
        });
      }
    }
    // Deduplicate by label and return up to 5
    const seen = new Set<string>();
    return allSuggestions
      .filter((a) => {
        const key = a.label.toLowerCase();
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      })
      .slice(0, 5);
  }

  // Otherwise generate smart defaults based on the appointment/service type
  const serviceType = (apt.service_type || "").toLowerCase();

  if (serviceType.includes("intake") || serviceType.includes("new patient")) {
    return [
      { id: "1", label: "Review intake paperwork and history", type: "document", checked: false },
      { id: "2", label: "Prepare PHQ-9 and GAD-7 assessments", type: "task", checked: false },
      { id: "3", label: "Complete diagnostic assessment", type: "task", checked: false },
      { id: "4", label: "Discuss treatment goals and plan", type: "task", checked: false },
    ];
  }

  if (serviceType.includes("follow") || serviceType.includes("check")) {
    return [
      { id: "1", label: "Review progress since last session", type: "task", checked: false },
      { id: "2", label: "Administer outcome measures", type: "task", checked: false },
      { id: "3", label: "Update treatment plan if needed", type: "document", checked: false },
      { id: "4", label: "Schedule next appointment", type: "task", checked: false },
    ];
  }

  // Default actions for any session type
  return [
    { id: "1", label: "Review patient chart and recent notes", type: "document", checked: false },
    { id: "2", label: "Check outcome measure trends", type: "task", checked: false },
    { id: "3", label: "Review and update treatment plan", type: "document", checked: false },
    { id: "4", label: "Document session notes", type: "document", checked: false },
  ];
}

// Convert appointment to OrchestrationContext for the detail view
function appointmentToContext(
  apt: AppointmentWithPatient,
  allActions: UnifiedAction[] = []
): OrchestrationContext {
  const patient = apt.patient;
  // Find any priority actions that belong to this patient
  const matchingActions = allActions.filter((a) => a.patient.id === patient.id);

  return {
    patient: {
      id: patient.id,
      name: `${patient.first_name} ${patient.last_name}`,
      mrn: patient.id.substring(0, 8),
      dob: patient.date_of_birth,
      age: Math.floor(
        (Date.now() - new Date(patient.date_of_birth).getTime()) / (365.25 * 24 * 60 * 60 * 1000)
      ),
      primaryDiagnosis: apt.service_type || "General Visit",
      avatar: patient.avatar_url || `https://i.pravatar.cc/150?u=${patient.id}`,
    },
    trigger: {
      type: "appointment",
      title: `${apt.service_type} Appointment`,
      urgency: "medium",
    },
    clinicalData: {},
    suggestedActions: generateAppointmentActions(apt, matchingActions),
  };
}

export function PriorityActionsSection({
  className,
  onSelectPatient,
  hideHeader = false,
}: PriorityActionsSectionProps) {
  const router = useRouter();
  const [actions, setActions] = React.useState<UnifiedAction[]>([]);
  const [allActions, setAllActions] = React.useState<UnifiedAction[]>([]);
  const [todayAppts, setTodayAppts] = React.useState<AppointmentWithPatient[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [scanning, setScanning] = React.useState(false);
  const [scanResult, setScanResult] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [dbReady, setDbReady] = React.useState<boolean | null>(null);
  const completedPatientIds = useCompletedPatients();

  const loadData = React.useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Check if database is populated
      const populated = await isDatabasePopulated();
      setDbReady(populated);

      if (!populated) {
        setLoading(false);
        return;
      }

      // Fetch both substrate actions and priority actions in parallel
      const [substrateActions, priorityActions, apptsData] = await Promise.all([
        fetchSubstrateActions(),
        getPriorityActions(),
        getTodayAppointments(),
      ]);

      // Convert to unified format and merge
      const substrateUnified = substrateActions
        .map(substrateActionToUnified)
        .filter((a): a is UnifiedAction => a !== null);

      const priorityUnified = priorityActions.map(priorityActionToUnified);

      // Merge: substrate actions first (they're real intelligence), then priority as fallback
      // Deduplicate by patient_id + similar title
      const seenPatientTitles = new Set<string>();
      const merged: UnifiedAction[] = [];

      // Add substrate actions first
      for (const action of substrateUnified) {
        const key = `${action.patient.id}-${action.title.toLowerCase().substring(0, 30)}`;
        if (!seenPatientTitles.has(key)) {
          seenPatientTitles.add(key);
          merged.push(action);
        }
      }

      // Add priority actions that don't overlap
      for (const action of priorityUnified) {
        const key = `${action.patient.id}-${action.title.toLowerCase().substring(0, 30)}`;
        if (!seenPatientTitles.has(key)) {
          seenPatientTitles.add(key);
          merged.push(action);
        }
      }

      // Sort by urgency priority
      const urgencyOrder: Record<string, number> = {
        urgent: 0,
        high: 1,
        medium: 2,
        low: 3,
      };
      merged.sort((a, b) => {
        const aOrder = urgencyOrder[a.urgency] ?? 4;
        const bOrder = urgencyOrder[b.urgency] ?? 4;
        return aOrder - bOrder;
      });

      setAllActions(merged);
      setActions(merged.slice(2, 4)); // Show middle 2 (removed top 2 and last)
      setTodayAppts(apptsData);
    } catch (err) {
      log.error("Failed to load priority actions", err);
      setError("Failed to load data. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  // Handle substrate scan refresh
  const handleRunAnalysis = React.useCallback(async () => {
    setScanning(true);
    setScanResult(null);

    const result = await runSubstrateScan();

    if (result.success) {
      setScanResult(
        `Analysis complete: ${result.triggers_detected} triggers detected, ${result.actions_created} new actions`
      );
      // Reload data after scan
      await loadData();
    } else {
      setScanResult(`Analysis failed: ${result.error || "Unknown error"}`);
    }

    setScanning(false);

    // Clear message after 5 seconds
    setTimeout(() => setScanResult(null), 5000);
  }, [loadData]);

  React.useEffect(() => {
    loadData();
  }, [loadData]);

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

  // Format demo date (Feb 6, 2026)
  const formattedDate = formatDemoDate("long");

  // Get the first arriving/scheduled patient
  const arrivingPatient = todayAppts.find((a) => a.status === "Scheduled") || todayAppts[0];

  // Loading state with skeleton
  if (loading) {
    return (
      <section className={className}>
        <div className="mb-14 flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-center">
          <div className="flex items-center gap-4">
            <Image
              src="/icons/caring-hands.png"
              alt=""
              role="presentation"
              width={56}
              height={56}
              className="shrink-0"
            />
            <div className="flex-1">
              <Heading level={3} className="text-xl sm:text-2xl">
                Today&apos;s Actions
              </Heading>
              <Text size="xs" muted className="mt-1 tracking-widest uppercase">
                <Skeleton as="span" className="inline-block h-3 w-48" />
              </Text>
            </div>
          </div>
          <Skeleton className="h-10 w-full rounded-full sm:ml-auto sm:w-36" />
        </div>
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
        <div className="mb-10 flex items-center gap-4">
          <Image
            src="/icons/caring-hands.png"
            alt=""
            role="presentation"
            width={56}
            height={56}
            className="shrink-0"
          />
          <div>
            <Heading level={3} className="text-xl sm:text-2xl">
              Today&apos;s Actions
            </Heading>
            <Text size="xs" muted className="mt-1 tracking-widest uppercase">
              {formattedDate}
            </Text>
          </div>
        </div>
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
        <div className="mb-10 flex items-center gap-4">
          <Image
            src="/icons/caring-hands.png"
            alt=""
            role="presentation"
            width={56}
            height={56}
            className="shrink-0"
          />
          <div>
            <Heading level={3} className="text-xl sm:text-2xl">
              Today&apos;s Actions
            </Heading>
            <Text size="xs" muted className="mt-1 tracking-widest uppercase">
              {formattedDate}
            </Text>
          </div>
        </div>
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
        <div className="mb-10 flex items-center gap-4">
          <Image
            src="/icons/caring-hands.png"
            alt=""
            role="presentation"
            width={56}
            height={56}
            className="shrink-0"
          />
          <div>
            <Heading level={3} className="text-xl sm:text-2xl">
              Today&apos;s Actions
            </Heading>
            <Text size="xs" muted className="mt-1 tracking-widest uppercase">
              {formattedDate} •{" "}
              <span className="text-card-foreground font-semibold">
                {todayAppts.length} Appointments
              </span>
            </Text>
          </div>
        </div>
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
        <div className="mb-14 flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-center">
          <div className="flex items-center gap-4">
            <Image
              src="/icons/caring-hands.png"
              alt=""
              role="presentation"
              width={56}
              height={56}
              className="shrink-0"
            />
            <div className="flex-1">
              <Heading level={3} className="text-xl sm:text-2xl">
                Today&apos;s Actions
              </Heading>
              <Text size="xs" muted className="mt-1 tracking-widest uppercase">
                {formattedDate} •{" "}
                <span className="text-card-foreground font-semibold">
                  {todayAppts.length} Appointments
                </span>
              </Text>
            </div>
          </div>
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
            <Button variant="outline" className="shrink-0">
              Complete All Actions
            </Button>
          </div>
        </div>
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
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
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
              secondaryButtonText="View Suggested Actions"
              onSecondaryButtonClick={() => {}}
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
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
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
