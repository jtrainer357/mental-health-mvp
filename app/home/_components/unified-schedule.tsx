"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { ScheduleRowCard } from "@/design-system/components/ui/schedule-row-card";
import type { ScheduleStatus } from "@/design-system/components/ui/schedule-row-card";
import { Card } from "@/design-system/components/ui/card";
import { Heading, Text } from "@/design-system/components/ui/typography";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, Plus, Calendar, ClipboardList, Bell, MapPin, Video, X, Repeat } from "lucide-react";
import { Input } from "@/design-system/components/ui/input";
import { Button } from "@/design-system/components/ui/button";
import { cn } from "@/design-system/lib/utils";
import { getTodayAppointments } from "@/src/lib/queries/appointments";
import { isDatabasePopulated } from "@/src/lib/queries/practice";
import type { AppointmentWithPatient } from "@/src/lib/queries/appointments";
import type { OrchestrationContext } from "@/src/lib/orchestration/types";
import { createLogger } from "@/src/lib/logger";
import { getExternalIdFromUUID } from "@/src/lib/data/adapter";
import { INVOICES as SYNTHETIC_INVOICES } from "@/src/lib/data/billing";
import { PRIORITY_ACTIONS } from "@/src/lib/data/priority-actions";
import { Badge } from "@/design-system/components/ui/badge";
import { VisitPrepPanel } from "./visit-prep-panel";
import { RecurringSeriesPanel } from "./recurring-series-panel";

const log = createLogger("UnifiedSchedule");

// ─── Filter types ──────────────────────────────────────────────────────────

type FilterPill = "all" | "schedule-alerts" | "balance-alerts";

const FILTER_PILLS: { id: FilterPill; label: string }[] = [
  { id: "all", label: "All" },
  { id: "schedule-alerts", label: "Schedule Alerts" },
  { id: "balance-alerts", label: "Balance Alerts" },
];

// ─── Helpers ───────────────────────────────────────────────────────────────

function getPatientOutstandingBalance(patientUUID: string): number {
  const externalId = getExternalIdFromUUID(patientUUID);
  if (!externalId) return 0;
  return SYNTHETIC_INVOICES.filter(
    (inv) => inv.patient_id === externalId && inv.balance > 0
  ).reduce((sum, inv) => sum + inv.balance, 0);
}

/** Map database status to PRD-aligned ScheduleStatus */
function mapStatus(status: string, patientId?: string): ScheduleStatus {
  if (status === "Completed") return "COMPLETED";
  if (status === "Cancelled") return "CANCELED";
  if (status === "No-Show") return "COMPLETED";

  // Robert Fitzgerald shows as arrived
  if (patientId) {
    const extId = getExternalIdFromUUID(patientId);
    if (extId === "robert-fitzgerald") return "ARRIVED";
  }

  return "SCHEDULED";
}

/** Check if appointment has a reschedule requested note */
function hasRescheduleRequest(apt: AppointmentWithPatient): boolean {
  return Boolean(apt.notes?.toLowerCase().includes("reschedule"));
}

/** Check if this is a same-day cancellation */
function isSameDayCancellation(apt: AppointmentWithPatient): boolean {
  return apt.status === "Cancelled" && Boolean(apt.notes?.toLowerCase().includes("cancel"));
}

/** Format time from 24h to 12h */
function formatTime(time: string): string {
  const [hours, minutes] = time.split(":").map(Number);
  const period = hours! >= 12 ? "PM" : "AM";
  const displayHours = hours! % 12 || 12;
  return `${displayHours}:${String(minutes).padStart(2, "0")} ${period}`;
}

/** Compute open time slots between appointments */
interface OpenSlot {
  startTime: string;
  endTime: string;
  /** 24h format for form inputs (HH:MM) */
  startTime24: string;
  endTime24: string;
  label: string;
}

function computeOpenSlots(appointments: AppointmentWithPatient[]): Map<number, OpenSlot> {
  const slots = new Map<number, OpenSlot>();
  const active = appointments.filter((a) => a.status !== "Cancelled");

  for (let i = 0; i < active.length - 1; i++) {
    const current = active[i]!;
    const next = active[i + 1]!;
    const currentEnd = current.end_time;
    const nextStart = next.start_time;

    if (currentEnd < nextStart) {
      // There's a gap — compute duration
      const [endH, endM] = currentEnd.split(":").map(Number);
      const [startH, startM] = nextStart.split(":").map(Number);
      const gapMinutes = (startH! * 60 + startM!) - (endH! * 60 + endM!);

      if (gapMinutes >= 30) {
        // Find the index of 'next' in the original (unfiltered) appointments array
        const nextIndex = appointments.indexOf(next);
        slots.set(nextIndex, {
          startTime: formatTime(currentEnd),
          endTime: formatTime(nextStart),
          startTime24: currentEnd,
          endTime24: nextStart,
          label: `${formatTime(currentEnd)} – ${formatTime(nextStart)} open`,
        });
      }
    }
  }

  return slots;
}

// ─── Inline Create Panel (replaces modal) ─────────────────────────────────

type QuickCreateType = "appointment" | "task" | "reminder";

const QUICK_TYPES: { id: QuickCreateType; label: string; icon: React.ElementType }[] = [
  { id: "appointment", label: "Appointment", icon: Calendar },
  { id: "task", label: "Task", icon: ClipboardList },
  { id: "reminder", label: "Reminder", icon: Bell },
];

function OpenSlotRow({
  slot,
  isOpen,
  onToggle,
}: {
  slot: OpenSlot;
  isOpen: boolean;
  onToggle: () => void;
}) {
  const [createType, setCreateType] = React.useState<QuickCreateType>("appointment");
  const [title, setTitle] = React.useState("");
  const [locationType, setLocationType] = React.useState<"in-person" | "telehealth">("in-person");
  const [duration, setDuration] = React.useState("45 min");
  const [recurring, setRecurring] = React.useState(false);
  const [recurringFreq, setRecurringFreq] = React.useState<"weekly" | "biweekly" | "monthly">("weekly");

  // Reset when opening
  React.useEffect(() => {
    if (isOpen) {
      setTitle("");
      setCreateType("appointment");
      setLocationType("in-person");
      setDuration("45 min");
      setRecurring(false);
      setRecurringFreq("weekly");
    }
  }, [isOpen]);

  return (
    <div className="mx-1">
      {/* Collapsed row */}
      <div className="flex items-center gap-3 py-2">
        {!isOpen && <div className="bg-border/40 h-px flex-1" />}
        {isOpen && <div className="flex-1" />}
        <Text size="xs" muted className="whitespace-nowrap font-medium">
          {slot.label}
        </Text>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onToggle();
          }}
          className={cn(
            "flex h-7 w-7 shrink-0 items-center justify-center rounded-full border transition-all duration-200",
            isOpen
              ? "border-muted-foreground/30 bg-white text-muted-foreground hover:border-muted-foreground hover:text-foreground"
              : "border-border bg-white text-muted-foreground hover:border-teal hover:bg-teal hover:text-white hover:shadow-sm"
          )}
          aria-label={isOpen ? "Close" : "Add event in this time slot"}
        >
          {isOpen ? <X className="h-3 w-3" /> : <Plus className="h-3.5 w-3.5" />}
        </button>
        {!isOpen && <div className="bg-border/40 h-px flex-1" />}
        {isOpen && <div className="flex-1" />}
      </div>

      {/* Expanded inline create panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
            className="overflow-hidden"
          >
            <div className="border-border/40 bg-backbone-1/30 mb-4 rounded-xl border p-4">
              {/* Row 1: Type pills + Title input — all horizontal */}
              <div className="flex items-center gap-3">
                {/* Type pills */}
                <div className="border-border/40 flex shrink-0 gap-0.5 rounded-lg border bg-white p-0.5">
                  {QUICK_TYPES.map((type) => {
                    const Icon = type.icon;
                    const active = createType === type.id;
                    return (
                      <button
                        key={type.id}
                        type="button"
                        onClick={() => setCreateType(type.id)}
                        className={cn(
                          "flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium transition-all duration-150",
                          active
                            ? "bg-teal text-white"
                            : "text-muted-foreground hover:bg-backbone-1/60 hover:text-foreground"
                        )}
                      >
                        <Icon className="h-3.5 w-3.5" />
                        {type.label}
                      </button>
                    );
                  })}
                </div>

                {/* Title input */}
                <Input
                  placeholder={
                    createType === "appointment"
                      ? "Patient name or title..."
                      : createType === "task"
                        ? "What needs to be done?"
                        : "Reminder..."
                  }
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="h-9 flex-1 border-border/40 bg-white text-sm shadow-none focus-visible:border-teal focus-visible:ring-1 focus-visible:ring-teal/30 focus-visible:ring-offset-0"
                  autoFocus
                />
              </div>

              {/* Row 2: Time + Location/Duration + Action — horizontal */}
              <div className="mt-3 flex items-center gap-3">
                {/* Time display */}
                <div className="text-muted-foreground flex shrink-0 items-center gap-1.5 text-xs font-medium">
                  <span className="rounded bg-white px-2 py-1 font-semibold">{slot.startTime}</span>
                  <span>–</span>
                  <span className="rounded bg-white px-2 py-1 font-semibold">{slot.endTime}</span>
                </div>

                {/* Separator */}
                <div className="bg-border/40 h-5 w-px shrink-0" />

                {/* Appointment-specific: location + duration */}
                {createType === "appointment" && (
                  <>
                    <div className="flex shrink-0 gap-1">
                      <button
                        type="button"
                        onClick={() => setLocationType("in-person")}
                        className={cn(
                          "flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium transition-all duration-150",
                          locationType === "in-person"
                            ? "bg-white text-foreground shadow-sm"
                            : "text-muted-foreground/50 hover:text-muted-foreground"
                        )}
                      >
                        <MapPin className="h-3 w-3" />
                        Office
                      </button>
                      <button
                        type="button"
                        onClick={() => setLocationType("telehealth")}
                        className={cn(
                          "flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium transition-all duration-150",
                          locationType === "telehealth"
                            ? "bg-white text-foreground shadow-sm"
                            : "text-muted-foreground/50 hover:text-muted-foreground"
                        )}
                      >
                        <Video className="h-3 w-3" />
                        Telehealth
                      </button>
                    </div>

                    <div className="bg-border/40 h-5 w-px shrink-0" />

                    <div className="flex shrink-0 gap-1">
                      {["30m", "45m", "60m"].map((dur) => (
                        <button
                          key={dur}
                          type="button"
                          onClick={() => setDuration(dur)}
                          className={cn(
                            "rounded-md px-2 py-1 text-xs font-medium transition-all duration-150",
                            duration === dur
                              ? "bg-white text-foreground shadow-sm"
                              : "text-muted-foreground/50 hover:text-muted-foreground"
                          )}
                        >
                          {dur}
                        </button>
                      ))}
                    </div>

                    <div className="bg-border/40 h-5 w-px shrink-0" />

                    {/* Recurring toggle */}
                    <button
                      type="button"
                      onClick={() => setRecurring((prev) => !prev)}
                      className={cn(
                        "flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium transition-all duration-150",
                        recurring
                          ? "bg-teal text-white shadow-sm"
                          : "text-muted-foreground/50 hover:text-muted-foreground"
                      )}
                    >
                      <Repeat className="h-3 w-3" />
                      Recurring
                    </button>

                    {recurring && (
                      <div className="flex shrink-0 gap-1">
                        {(["weekly", "biweekly", "monthly"] as const).map((freq) => (
                          <button
                            key={freq}
                            type="button"
                            onClick={() => setRecurringFreq(freq)}
                            className={cn(
                              "rounded-md px-2 py-1 text-xs font-medium capitalize transition-all duration-150",
                              recurringFreq === freq
                                ? "bg-white text-foreground shadow-sm"
                                : "text-muted-foreground/50 hover:text-muted-foreground"
                            )}
                          >
                            {freq}
                          </button>
                        ))}
                      </div>
                    )}
                  </>
                )}

                {/* Spacer */}
                <div className="flex-1" />

                {/* Action button */}
                <Button
                  size="sm"
                  onClick={() => onToggle()}
                  className="h-8 shrink-0 rounded-full px-4 text-xs font-bold"
                >
                  {createType === "appointment"
                    ? "Schedule"
                    : createType === "task"
                      ? "Create"
                      : "Set"}
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Actions Needed Panel ──────────────────────────────────────────────────

/** Get priority actions for a patient by external ID */
function getActionsForPatient(patientUUID: string): string[] {
  const externalId = getExternalIdFromUUID(patientUUID);
  if (!externalId) return [];
  const action = PRIORITY_ACTIONS.find((a) => a.patient_id === externalId);
  if (!action) return [];
  return action.suggested_actions;
}

/** Hardcoded action items for patients without priority actions (David Nakamura) */
const FALLBACK_ACTIONS = [
  "Review last session notes and treatment progress",
  "Check outcome measure scores for trends",
  "Confirm insurance authorization is current",
];

function ActionsNeededPanel({
  patientUUID,
  isOpen,
  onComplete,
  summaryContent,
}: {
  patientUUID: string;
  isOpen: boolean;
  onComplete: () => void;
  summaryContent: React.ReactNode;
}) {
  const actions = getActionsForPatient(patientUUID);
  const items = actions.length > 0 ? actions : FALLBACK_ACTIONS;
  const [checked, setChecked] = React.useState<Set<number>>(new Set());
  const [showSummary, setShowSummary] = React.useState(false);

  // Reset summary when panel closes
  React.useEffect(() => {
    if (!isOpen) setShowSummary(false);
  }, [isOpen]);

  const toggleItem = (idx: number) => {
    setChecked((prev) => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx);
      else next.add(idx);
      return next;
    });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
          className="overflow-hidden"
        >
          <div className="border-border/30 mx-5 border-t" />
          <div className="px-5 py-4">
            <div className="space-y-2">
              {items.map((item, idx) => (
                <label
                  key={idx}
                  className="flex cursor-pointer items-start gap-3 rounded-lg px-2 py-1.5 transition-colors hover:bg-backbone-1/30"
                  onClick={(e) => e.stopPropagation()}
                >
                  <input
                    type="checkbox"
                    checked={checked.has(idx)}
                    onChange={() => toggleItem(idx)}
                    className="accent-teal mt-0.5 h-4 w-4 shrink-0 rounded"
                  />
                  <span
                    className={cn(
                      "text-sm leading-snug transition-all",
                      checked.has(idx) && "text-muted-foreground line-through"
                    )}
                  >
                    {item}
                  </span>
                </label>
              ))}
            </div>
            <div className="mt-4 flex items-center justify-between">
              {/* Clinical Summary toggle */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowSummary((prev) => !prev);
                }}
                className="text-muted-foreground hover:text-foreground flex items-center gap-1.5 text-sm font-medium transition-colors"
              >
                Clinical Summary
                <motion.span
                  animate={{ rotate: showSummary ? 90 : 0 }}
                  transition={{ duration: 0.15 }}
                  className="inline-block"
                >
                  ›
                </motion.span>
              </button>

              <Button
                size="sm"
                variant="outline"
                onClick={(e) => {
                  e.stopPropagation();
                  onComplete();
                }}
                className="h-8 rounded-full px-4 text-xs font-bold"
              >
                {checked.size === items.length ? "Done" : "Run Suggested Actions"}
              </Button>
            </div>

            {/* Clinical Summary — slides open */}
            <AnimatePresence>
              {showSummary && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
                  className="overflow-hidden"
                >
                  <div className="border-border/30 mt-3 border-t pt-3">
                    {summaryContent}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ─── Filter Pills ──────────────────────────────────────────────────────────

interface FilterPillsProps {
  active: FilterPill;
  onChange: (pill: FilterPill) => void;
}

function FilterPillsBar({ active, onChange }: FilterPillsProps) {
  return (
    <div className="mb-4 flex gap-2">
      {FILTER_PILLS.map((pill) => (
        <button
          key={pill.id}
          type="button"
          onClick={() => onChange(pill.id)}
          className={cn(
            "min-h-[36px] rounded-full px-4 py-1.5 text-xs font-bold transition-all",
            active === pill.id
              ? "bg-teal text-white shadow-sm"
              : "bg-backbone-1/60 text-synapse-5 hover:bg-backbone-2/60"
          )}
        >
          {pill.label}
        </button>
      ))}
    </div>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────

interface UnifiedScheduleProps {
  className?: string;
  onSelectPatient?: (context: OrchestrationContext) => void;
}

export function UnifiedSchedule({ className, onSelectPatient }: UnifiedScheduleProps) {
  const router = useRouter();
  const [appointments, setAppointments] = React.useState<AppointmentWithPatient[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [dbReady, setDbReady] = React.useState<boolean | null>(null);
  const [expandedId, setExpandedId] = React.useState<string | null>(null);
  const [activeFilter, setActiveFilter] = React.useState<FilterPill>("all");
  const [openSlotIndex, setOpenSlotIndex] = React.useState<number | null>(null);
  const [actionsOpenId, setActionsOpenId] = React.useState<string | null>(null);
  const [seriesOpenId, setSeriesOpenId] = React.useState<string | null>(null);

  React.useEffect(() => {
    async function loadAppointments() {
      try {
        setLoading(true);
        const populated = await isDatabasePopulated();
        setDbReady(populated);

        if (!populated) {
          setLoading(false);
          return;
        }

        const todayData = await getTodayAppointments();
        setAppointments(todayData);
      } catch (err) {
        log.error("Failed to load today's appointments", err);
      } finally {
        setLoading(false);
      }
    }
    loadAppointments();
  }, []);

  // Determine the "next patient" — first arrived, or first upcoming scheduled
  const nextPatientId = React.useMemo(() => {
    const arrived = appointments.find(
      (apt) => mapStatus(apt.status, apt.patient.id) === "ARRIVED"
    );
    if (arrived) return arrived.id;
    // Otherwise first non-completed, non-cancelled appointment
    const upcoming = appointments.find(
      (apt) =>
        apt.status !== "Completed" &&
        apt.status !== "Cancelled" &&
        apt.status !== "No-Show"
    );
    return upcoming?.id ?? null;
  }, [appointments]);

  // Filter appointments based on active pill
  const filteredAppointments = React.useMemo(() => {
    if (activeFilter === "all") return appointments;
    if (activeFilter === "schedule-alerts") {
      return appointments.filter(
        (apt) =>
          apt.status === "Cancelled" ||
          hasRescheduleRequest(apt) ||
          mapStatus(apt.status, apt.patient.id) === "ARRIVED"
      );
    }
    if (activeFilter === "balance-alerts") {
      return appointments.filter(
        (apt) => getPatientOutstandingBalance(apt.patient.id) > 0
      );
    }
    return appointments;
  }, [appointments, activeFilter]);

  // Compute open slots for the full list (only show in "all" view)
  const openSlots = React.useMemo(() => {
    if (activeFilter !== "all") return new Map<number, OpenSlot>();
    return computeOpenSlots(filteredAppointments);
  }, [filteredAppointments, activeFilter]);

  const handleRowClick = (aptId: string) => {
    setExpandedId((prev) => (prev === aptId ? null : aptId));
  };

  const handleEnterVisit = (apt: AppointmentWithPatient) => {
    const name = `${apt.patient.first_name} ${apt.patient.last_name}`;
    router.push(`/home/patients?patientName=${encodeURIComponent(name)}&startSession=true`);
  };

  // Loading state
  if (loading) {
    return (
      <div className={cn("flex min-h-0 flex-col", className)}>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="text-muted-foreground h-6 w-6 animate-spin" />
        </div>
      </div>
    );
  }

  // No data state
  if (dbReady === false || appointments.length === 0) {
    return (
      <div className={cn("flex min-h-0 flex-col", className)}>
        <div className="border-muted-foreground/30 bg-muted/10 flex items-center justify-center rounded-lg border border-dashed py-12">
          <Text size="sm" muted className="text-center">
            {dbReady === false ? "No data imported yet" : "No appointments today"}
          </Text>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("flex min-h-0 flex-col", className)}>
      {filteredAppointments.length === 0 ? (
        <div className="border-muted-foreground/30 bg-muted/10 flex items-center justify-center rounded-lg border border-dashed py-8">
          <Text size="sm" muted className="text-center">
            No appointments match this filter
          </Text>
        </div>
      ) : (
        <div className="-mx-2 min-h-0 flex-1 space-y-1 overflow-y-auto px-2 pb-2">
          {filteredAppointments.map((apt, index) => {
            const isExpanded = expandedId === apt.id;
            const balance = getPatientOutstandingBalance(apt.patient.id);
            const status = mapStatus(apt.status, apt.patient.id);
            const isReschedule = hasRescheduleRequest(apt);
            const isCancellation = apt.status === "Cancelled";
            const openSlot = openSlots.get(index);
            const isNextPatient = apt.id === nextPatientId;

            // Count non-cancelled appointments up to this index to determine top 3
            const activeIndex = filteredAppointments
              .slice(0, index + 1)
              .filter((a) => a.status !== "Cancelled").length;
            const showActionsNeeded = !isCancellation && activeIndex <= 3;
            const isActionsOpen = actionsOpenId === apt.id;

            return (
              <React.Fragment key={apt.id}>
                {/* Open time slot indicator */}
                {openSlot && (
                  <OpenSlotRow
                    slot={openSlot}
                    isOpen={openSlotIndex === index}
                    onToggle={() =>
                      setOpenSlotIndex((prev) => (prev === index ? null : index))
                    }
                  />
                )}

                <Card
                  opacity="transparent"
                  onClick={() => {
                    if (showActionsNeeded) {
                      // Toggle actions panel for rows with actions
                      setActionsOpenId((prev) => (prev === apt.id ? null : apt.id));
                    } else {
                      // Toggle clinical summary for other rows
                      handleRowClick(apt.id);
                    }
                  }}
                  className={cn(
                    "cursor-pointer overflow-hidden transition-all",
                    "border-border/60",
                    isNextPatient && "bg-priority-bg/50 border-priority-bg/60 shadow-md",
                    isCancellation && !isNextPatient && "bg-destructive/[0.03]",
                    !isNextPatient && (isExpanded ? "bg-white/70 shadow-md" : "hover:bg-white/70 hover:shadow-md")
                  )}
                >
                  <ScheduleRowCard
                    time={formatTime(apt.start_time)}
                    endTime={formatTime(apt.end_time)}
                    patient={`${apt.patient.first_name} ${apt.patient.last_name}`}
                    type={apt.service_type.toUpperCase()}
                    provider="Dr. Demo"
                    status={status}
                    room={apt.location || "Main Office"}
                    avatarSrc={apt.patient.avatar_url || undefined}
                    avatarHref={`/home/patients?patientName=${encodeURIComponent(`${apt.patient.first_name} ${apt.patient.last_name}`)}`}
                    outstandingBalance={balance}
                    isTelehealth={apt.location?.toLowerCase().includes("telehealth")}
                    isCancellation={isCancellation}
                    rescheduleRequested={isReschedule}
                    actionSlot={
                      showActionsNeeded ? (
                        <Badge
                          variant="outline"
                          className="border-teal/30 bg-teal/[0.08] text-teal shrink-0 rounded-md px-2 py-0.5 text-xs font-bold"
                        >
                          Actions Needed
                        </Badge>
                      ) : undefined
                    }
                    primaryAction={
                      isNextPatient
                        ? {
                            label: "Start Visit",
                            onClick: () => handleEnterVisit(apt),
                          }
                        : undefined
                    }
                    className="border-0 bg-transparent shadow-none hover:bg-transparent hover:shadow-none"
                  />
                  {showActionsNeeded ? (
                    <ActionsNeededPanel
                      patientUUID={apt.patient.id}
                      isOpen={isActionsOpen}
                      onComplete={() => setActionsOpenId(null)}
                      summaryContent={
                        <>
                          <VisitPrepPanel
                            appointment={apt}
                            isExpanded={true}
                            showEnterVisit={
                              status === "ARRIVED" || getExternalIdFromUUID(apt.patient.id) === "robert-fitzgerald"
                            }
                            visitButtonLabel={
                              apt.location?.toLowerCase().includes("telehealth") ? "Join Telehealth" : "Start Visit"
                            }
                            onEnterVisit={() => handleEnterVisit(apt)}
                            skipAnimation
                          />
                          {/* Manage Series toggle */}
                          {!isCancellation && (
                            <div className="flex justify-start px-5 pb-2">
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSeriesOpenId((prev) => (prev === apt.id ? null : apt.id));
                                }}
                                className="text-muted-foreground hover:text-teal flex items-center gap-1.5 text-xs font-medium transition-colors"
                              >
                                <Repeat className="h-3 w-3" />
                                {seriesOpenId === apt.id ? "Hide Series" : "Manage Series"}
                              </button>
                            </div>
                          )}
                          <RecurringSeriesPanel
                            appointment={apt}
                            allAppointments={appointments}
                            isOpen={seriesOpenId === apt.id}
                            onClose={() => setSeriesOpenId(null)}
                          />
                        </>
                      }
                    />
                  ) : (
                    <>
                      <VisitPrepPanel
                        appointment={apt}
                        isExpanded={isExpanded}
                        showEnterVisit={
                          status === "ARRIVED" || getExternalIdFromUUID(apt.patient.id) === "robert-fitzgerald"
                        }
                        visitButtonLabel={
                          apt.location?.toLowerCase().includes("telehealth") ? "Join Telehealth" : "Start Visit"
                        }
                        onEnterVisit={() => handleEnterVisit(apt)}
                      />
                      {/* Manage Series toggle — visible when row is expanded */}
                      {isExpanded && !isCancellation && (
                        <>
                          <div className="flex justify-start px-5 pb-2">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSeriesOpenId((prev) => (prev === apt.id ? null : apt.id));
                              }}
                              className="text-muted-foreground hover:text-teal flex items-center gap-1.5 text-xs font-medium transition-colors"
                            >
                              <Repeat className="h-3 w-3" />
                              {seriesOpenId === apt.id ? "Hide Series" : "Manage Series"}
                            </button>
                          </div>
                          <RecurringSeriesPanel
                            appointment={apt}
                            allAppointments={appointments}
                            isOpen={seriesOpenId === apt.id}
                            onClose={() => setSeriesOpenId(null)}
                          />
                        </>
                      )}
                    </>
                  )}
                </Card>
              </React.Fragment>
            );
          })}
        </div>
      )}

    </div>
  );
}
