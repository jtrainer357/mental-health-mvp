"use client";

import * as React from "react";
import { ScheduleRowCard } from "@/design-system/components/ui/schedule-row-card";
import { Heading, Text } from "@/design-system/components/ui/typography";
import { Loader2 } from "lucide-react";
import { cn } from "@/design-system/lib/utils";
import {
  useTodayAppointments,
  useIsDatabasePopulated,
  type AppointmentWithPatient,
} from "@/src/lib/queries";
import type { OrchestrationContext } from "@/src/lib/orchestration/types";

type AppointmentStatus = "ENDED" | "IN PROGRESS" | "CHECKED IN" | "SCHEDULED";

// Map database status to component status
function mapStatus(status: string, startTime: string): AppointmentStatus {
  if (status === "Completed") return "ENDED";
  if (status === "No-Show" || status === "Cancelled") return "ENDED";

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
    suggestedActions: [],
  };
}

interface TodaysPatientsListProps {
  className?: string;
  onSelectPatient?: (context: OrchestrationContext) => void;
}

export function TodaysPatientsList({ className, onSelectPatient }: TodaysPatientsListProps) {
  // Use React Query for database population check
  const { data: dbReady = null, isLoading: dbCheckLoading } = useIsDatabasePopulated();

  // Use React Query for today's appointments
  const { data: appointments = [], isLoading: apptsLoading } = useTodayAppointments();

  // Combined loading state
  const loading = dbCheckLoading || apptsLoading;

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
        {appointments.map((apt) => (
          <div
            key={apt.id}
            onClick={() => onSelectPatient?.(appointmentToContext(apt))}
            className="block cursor-pointer"
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                onSelectPatient?.(appointmentToContext(apt));
              }
            }}
          >
            <ScheduleRowCard
              time={formatTime(apt.start_time)}
              patient={`${apt.patient.first_name} ${apt.patient.last_name}`}
              type={apt.service_type.toUpperCase()}
              provider="Dr. Demo"
              status={mapStatus(apt.status, apt.start_time)}
              room={apt.location || "Main Office"}
              avatarSrc={apt.patient.avatar_url || undefined}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
