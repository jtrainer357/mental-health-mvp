"use client";

import * as React from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { ScheduleRowCard } from "@/design-system/components/ui/schedule-row-card";
import { Card } from "@/design-system/components/ui/card";
import { Heading, Text } from "@/design-system/components/ui/typography";
import { Loader2, List, CalendarDays } from "lucide-react";
import { cn } from "@/design-system/lib/utils";
import { getTodayAppointments, getUpcomingAppointments } from "@/src/lib/queries/appointments";
import { isDatabasePopulated } from "@/src/lib/queries/practice";
import type { AppointmentWithPatient } from "@/src/lib/queries/appointments";
import type { CalendarEvent } from "@/design-system/components/ui/calendar-week-view";
import type { OrchestrationContext } from "@/src/lib/orchestration/types";
import { createLogger } from "@/src/lib/logger";
import { getExternalIdFromUUID } from "@/src/lib/data/adapter";
import { INVOICES as SYNTHETIC_INVOICES } from "@/src/lib/data/billing";
import { VisitPrepPanel } from "./visit-prep-panel";
import { DEMO_DATE_OBJECT } from "@/src/lib/utils/demo-date";
import { startOfWeek, addDays, parseISO } from "date-fns";

const CalendarWeekView = dynamic(
  () =>
    import("@/design-system/components/ui/calendar-week-view").then((mod) => mod.CalendarWeekView),
  { ssr: false }
);

const log = createLogger("TodaysPatientsList");

// Patient color palette for calendar view
const patientColorPalette: CalendarEvent["color"][] = [
  "teal",
  "rose",
  "sage",
  "lavender",
  "green",
  "yellow",
  "neutral",
  "blue",
];

function getPatientColorIndex(patientName: string): number {
  let hash = 0;
  for (let i = 0; i < patientName.length; i++) {
    hash = (hash * 31 + patientName.charCodeAt(i)) | 0;
  }
  return Math.abs(hash) % patientColorPalette.length;
}

function getEventColor(
  serviceType: string,
  status: string,
  patientName: string
): CalendarEvent["color"] {
  if (status === "Completed") return "gray";
  if (status === "Cancelled" || status === "No-Show") return "pink";
  if (serviceType.toLowerCase().includes("crisis")) return "red";
  return patientColorPalette[getPatientColorIndex(patientName)]!;
}

function appointmentToEvent(apt: AppointmentWithPatient): CalendarEvent {
  const [hours, minutes] = apt.start_time.split(":").map(Number);
  const [endHours, endMinutes] = apt.end_time.split(":").map(Number);
  const date = parseISO(apt.date);
  const startTime = new Date(date);
  startTime.setHours(hours!, minutes!, 0, 0);
  const endTime = new Date(date);
  endTime.setHours(endHours!, endMinutes!, 0, 0);
  const isCancelled = apt.status === "Cancelled";
  const title = isCancelled
    ? `CANCELLED — ${apt.patient.first_name} ${apt.patient.last_name}`
    : `${apt.patient.first_name} ${apt.patient.last_name} - ${apt.service_type}`;
  return {
    id: apt.id,
    title,
    startTime,
    endTime,
    color: getEventColor(
      apt.service_type,
      apt.status,
      `${apt.patient.first_name} ${apt.patient.last_name}`
    ),
    hasNotification: apt.patient.risk_level === "high",
  };
}

// Get outstanding balance for a patient from synthetic billing data
function getPatientOutstandingBalance(patientUUID: string): number {
  const externalId = getExternalIdFromUUID(patientUUID);
  if (!externalId) return 0;
  return SYNTHETIC_INVOICES.filter(
    (inv) => inv.patient_id === externalId && inv.balance > 0
  ).reduce((sum, inv) => sum + inv.balance, 0);
}

import type { ScheduleStatus } from "@/design-system/components/ui/schedule-row-card";

/** Map database status to PRD-aligned ScheduleStatus */
function mapStatus(status: string, _startTime: string, patientId?: string): ScheduleStatus {
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

// Format time from 24h to 12h
function formatTime(time: string): string {
  const [hours, minutes] = time.split(":").map(Number);
  const period = hours! >= 12 ? "PM" : "AM";
  const displayHours = hours! % 12 || 12;
  return `${displayHours}:${String(minutes).padStart(2, "0")} ${period}`;
}

// Generate suggested actions based on service type
function generateDefaultActions(serviceType: string): OrchestrationContext["suggestedActions"] {
  const st = (serviceType || "").toLowerCase();

  if (st.includes("intake") || st.includes("new patient")) {
    return [
      { id: "1", label: "Review intake paperwork and history", type: "document", checked: false },
      { id: "2", label: "Prepare PHQ-9 and GAD-7 assessments", type: "task", checked: false },
      { id: "3", label: "Complete diagnostic assessment", type: "task", checked: false },
      { id: "4", label: "Discuss treatment goals and plan", type: "task", checked: false },
    ];
  }

  if (st.includes("follow") || st.includes("check")) {
    return [
      { id: "1", label: "Review progress since last session", type: "task", checked: false },
      { id: "2", label: "Administer outcome measures", type: "task", checked: false },
      { id: "3", label: "Update treatment plan if needed", type: "document", checked: false },
      { id: "4", label: "Schedule next appointment", type: "task", checked: false },
    ];
  }

  return [
    { id: "1", label: "Review patient chart and recent notes", type: "document", checked: false },
    { id: "2", label: "Check outcome measure trends", type: "task", checked: false },
    { id: "3", label: "Review and update treatment plan", type: "document", checked: false },
    { id: "4", label: "Document session notes", type: "document", checked: false },
  ];
}

// Convert appointment to OrchestrationContext for the detail view
function appointmentToContext(apt: AppointmentWithPatient): OrchestrationContext {
  const patient = apt.patient;
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
    suggestedActions: generateDefaultActions(apt.service_type),
  };
}

interface TodaysPatientsListProps {
  className?: string;
  onSelectPatient?: (context: OrchestrationContext) => void;
}

export function TodaysPatientsList({ className, onSelectPatient }: TodaysPatientsListProps) {
  const [appointments, setAppointments] = React.useState<AppointmentWithPatient[]>([]);
  const [weekAppointments, setWeekAppointments] = React.useState<AppointmentWithPatient[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [dbReady, setDbReady] = React.useState<boolean | null>(null);
  const [expandedId, setExpandedId] = React.useState<string | null>(null);
  const [viewMode, setViewMode] = React.useState<"list" | "calendar">("list");
  const [selectedEventId, setSelectedEventId] = React.useState<string | null>(null);

  // Week days for calendar view
  const weekDays = React.useMemo(() => {
    const start = startOfWeek(DEMO_DATE_OBJECT, { weekStartsOn: 0 });
    return Array.from({ length: 7 }, (_, i) => addDays(start, i));
  }, []);

  // Convert week appointments to calendar events
  const calendarEvents = React.useMemo(
    () => weekAppointments.map(appointmentToEvent),
    [weekAppointments]
  );

  React.useEffect(() => {
    async function loadAppointments() {
      try {
        setLoading(true);

        // Check if database is populated
        const populated = await isDatabasePopulated();
        setDbReady(populated);

        if (!populated) {
          setLoading(false);
          return;
        }

        const [todayData, weekData] = await Promise.all([
          getTodayAppointments(),
          getUpcomingAppointments(undefined, 7, "all"),
        ]);
        setAppointments(todayData);
        setWeekAppointments(weekData);
      } catch (err) {
        log.error("Failed to load today's appointments", err);
      } finally {
        setLoading(false);
      }
    }

    loadAppointments();
  }, []);

  const handleRowClick = (aptId: string) => {
    setExpandedId((prev) => (prev === aptId ? null : aptId));
  };

  const router = useRouter();

  const handleEnterVisit = (apt: AppointmentWithPatient) => {
    const name = `${apt.patient.first_name} ${apt.patient.last_name}`;
    router.push(`/home/patients?patientName=${encodeURIComponent(name)}&startSession=true`);
  };

  // Loading state
  if (loading) {
    return (
      <div className={cn("flex min-h-0 flex-col", className)}>
        <Heading
          level={6}
          className="text-muted-foreground mb-3 shrink-0 text-xs font-semibold tracking-wider uppercase"
        >
          Today&apos;s Patients
        </Heading>
        <div className="flex items-center justify-center py-8">
          <Loader2 className="text-muted-foreground h-6 w-6 animate-spin" />
        </div>
      </div>
    );
  }

  // No data state
  if (dbReady === false || appointments.length === 0) {
    return (
      <div className={cn("flex min-h-0 flex-col", className)}>
        <Heading
          level={6}
          className="text-muted-foreground mb-3 shrink-0 text-xs font-semibold tracking-wider uppercase"
        >
          Today&apos;s Patients
        </Heading>
        <div className="border-muted-foreground/30 bg-muted/10 flex items-center justify-center rounded-lg border border-dashed py-8">
          <Text size="sm" muted className="text-center">
            {dbReady === false ? "No data imported yet" : "No appointments today"}
          </Text>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("flex min-h-0 flex-col", className)}>
      <div className="mb-3 flex shrink-0 items-center justify-between">
        <Heading
          level={6}
          className="text-muted-foreground text-xs font-semibold tracking-wider uppercase"
        >
          Today&apos;s Patients ({appointments.length})
        </Heading>
      </div>

      {viewMode === "list" ? (
        <div className="-mx-2 min-h-0 flex-1 space-y-2 overflow-y-auto px-2 pb-2">
          {appointments.map((apt) => {
            const isExpanded = expandedId === apt.id;
            return (
              <Card
                key={apt.id}
                opacity="transparent"
                onClick={() => handleRowClick(apt.id)}
                className={cn(
                  "cursor-pointer overflow-hidden transition-all",
                  "border-border/60",
                  isExpanded ? "bg-white/70 shadow-md" : "hover:bg-white/70 hover:shadow-md"
                )}
              >
                <ScheduleRowCard
                  time={formatTime(apt.start_time)}
                  patient={`${apt.patient.first_name} ${apt.patient.last_name}`}
                  type={apt.service_type.toUpperCase()}
                  provider="Dr. Demo"
                  status={mapStatus(apt.status, apt.start_time, apt.patient.id)}
                  room={apt.location || "Main Office"}
                  avatarSrc={apt.patient.avatar_url || undefined}
                  avatarHref={`/home/patients?patientName=${encodeURIComponent(`${apt.patient.first_name} ${apt.patient.last_name}`)}`}
                  outstandingBalance={getPatientOutstandingBalance(apt.patient.id)}
                  className="border-0 bg-transparent shadow-none hover:bg-transparent hover:shadow-none"
                />
                <VisitPrepPanel
                  appointment={apt}
                  isExpanded={isExpanded}
                  showEnterVisit={getExternalIdFromUUID(apt.patient.id) === "robert-fitzgerald"}
                  visitButtonLabel={
                    apt.location?.toLowerCase().includes("telehealth") ? "Join Telehealth" : "Start Visit"
                  }
                  onEnterVisit={() => handleEnterVisit(apt)}
                />
              </Card>
            );
          })}
        </div>
      ) : (
        <div className="min-h-0 flex-1">
          <CalendarWeekView
            weekDays={weekDays}
            events={calendarEvents}
            startHour={8}
            endHour={18}
            selectedEventId={selectedEventId}
            onEventClick={(event) => {
              setSelectedEventId(selectedEventId === event.id ? null : event.id);
            }}
          />
        </div>
      )}
    </div>
  );
}
