"use client";

import * as React from "react";
import { ScheduleRowCard } from "@/design-system/components/ui/schedule-row-card";
import { Card } from "@/design-system/components/ui/card";
import { Heading, Text } from "@/design-system/components/ui/typography";
import { Loader2 } from "lucide-react";
import { cn } from "@/design-system/lib/utils";
import { getTodayAppointments } from "@/src/lib/queries/appointments";
import { isDatabasePopulated } from "@/src/lib/queries/practice";
import type { AppointmentWithPatient } from "@/src/lib/queries/appointments";
import type { OrchestrationContext } from "@/src/lib/orchestration/types";
import { createLogger } from "@/src/lib/logger";
import { getExternalIdFromUUID } from "@/src/lib/data/adapter";
import { INVOICES as SYNTHETIC_INVOICES } from "@/src/lib/data/billing";
import { VisitPrepPanel } from "./visit-prep-panel";

const log = createLogger("TodaysPatientsList");

// Get outstanding balance for a patient from synthetic billing data
function getPatientOutstandingBalance(patientUUID: string): number {
  const externalId = getExternalIdFromUUID(patientUUID);
  if (!externalId) return 0;
  return SYNTHETIC_INVOICES.filter(
    (inv) => inv.patient_id === externalId && inv.balance > 0
  ).reduce((sum, inv) => sum + inv.balance, 0);
}

type AppointmentStatus =
  | "ENDED"
  | "IN PROGRESS"
  | "CHECKED IN"
  | "SCHEDULED"
  | "CANCELLED"
  | "ARRIVING";

// Map database status to component status
function mapStatus(status: string, startTime: string, patientId?: string): AppointmentStatus {
  if (status === "Completed") return "ENDED";
  if (status === "Cancelled") return "CANCELLED";
  if (status === "No-Show") return "ENDED";

  // Robert Fitzgerald shows as arrived
  if (patientId) {
    const extId = getExternalIdFromUUID(patientId);
    if (extId === "robert-fitzgerald") return "ARRIVING";
  }

  // Check if appointment is in progress based on time
  const now = new Date();
  const [hours, minutes] = startTime.split(":").map(Number);
  const appointmentTime = new Date();
  appointmentTime.setHours(hours!, minutes!, 0, 0);

  const diffMinutes = (now.getTime() - appointmentTime.getTime()) / 60000;

  if (diffMinutes >= 0 && diffMinutes <= 60) {
    return "IN PROGRESS";
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
  const [loading, setLoading] = React.useState(true);
  const [dbReady, setDbReady] = React.useState<boolean | null>(null);
  const [expandedId, setExpandedId] = React.useState<string | null>(null);

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

        const data = await getTodayAppointments();
        setAppointments(data);
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

  const handleEnterVisit = (_apt: AppointmentWithPatient) => {
    // No-op: Enter Visit buttons disabled for now
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
      <Heading
        level={6}
        className="text-muted-foreground mb-3 shrink-0 text-xs font-semibold tracking-wider uppercase"
      >
        Today&apos;s Patients ({appointments.length})
      </Heading>

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
                avatarHref={`/home/patients?patient=${apt.patient.id}`}
                outstandingBalance={getPatientOutstandingBalance(apt.patient.id)}
                className="border-0 bg-transparent shadow-none hover:bg-transparent hover:shadow-none"
              />
              <VisitPrepPanel
                appointment={apt}
                isExpanded={isExpanded}
                onEnterVisit={() => handleEnterVisit(apt)}
              />
            </Card>
          );
        })}
      </div>
    </div>
  );
}
