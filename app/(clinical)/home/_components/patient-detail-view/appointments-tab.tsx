"use client";

import { AppointmentPreviewCard } from "@/design-system/components/ui/appointment-preview-card";
import { Text } from "@/design-system/components/ui/typography";
import type { PatientDetail } from "./types";

interface AppointmentsTabProps {
  patient: PatientDetail;
}

export function AppointmentsTab({ patient }: AppointmentsTabProps) {
  const appointments = patient.allAppointments || patient.upcomingAppointments;

  return (
    <div className="space-y-2">
      {appointments.map((apt) => (
        <AppointmentPreviewCard
          key={apt.id}
          status={
            apt.status as
              | "Scheduled"
              | "Confirmed"
              | "Checked In"
              | "In Progress"
              | "Completed"
              | "Cancelled"
              | "No-Show"
          }
          date={apt.date}
          time={apt.time}
          type={apt.type}
          provider={apt.provider}
        />
      ))}
      {appointments.length === 0 && (
        <div className="border-muted-foreground/30 rounded-lg border-2 border-dashed py-8">
          <Text size="sm" muted className="text-center">
            No appointments found
          </Text>
        </div>
      )}
    </div>
  );
}
