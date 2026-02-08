"use client";

/**
 * AppointmentDetailPanel - Slide-out panel for appointment details and status management
 * Agent: GAMMA | Feature: Scheduling Production
 */

import * as React from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { format, parse } from "date-fns";
import {
  User,
  Phone,
  Mail,
  Calendar,
  Clock,
  MapPin,
  Video,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Play,
  Repeat,
  ExternalLink,
} from "lucide-react";
import { useRouter } from "next/navigation";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/design-system/components/ui/sheet";
import { Button } from "@/design-system/components/ui/button";
import { Badge } from "@/design-system/components/ui/badge";
import { Separator } from "@/design-system/components/ui/separator";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/design-system/components/ui/alert-dialog";
import { cn } from "@/design-system/lib/utils";
import {
  type AppointmentStatus,
  APPOINTMENT_STATUS_TRANSITIONS,
  APPOINTMENT_TYPES,
} from "@/src/lib/supabase/scheduling-types";
import { appointmentKeys } from "@/src/lib/queries/keys";

interface Patient {
  id: string;
  first_name: string;
  last_name: string;
  avatar_url?: string | null;
  phone_mobile?: string | null;
  email?: string | null;
  risk_level?: "low" | "medium" | "high" | null;
  date_of_birth?: string;
}

interface Appointment {
  id: string;
  date: string;
  start_time: string;
  end_time: string;
  duration_minutes: number;
  status: AppointmentStatus;
  service_type?: string;
  appointment_type?: string;
  cpt_code?: string | null;
  format?: "in_person" | "telehealth";
  room?: string | null;
  notes?: string | null;
  recurring_group_id?: string | null;
  recurring_pattern?: string | null;
  patient?: Patient;
}

interface AppointmentDetailPanelProps {
  appointment: Appointment | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onStatusChange?: () => void;
}

const STATUS_STYLES: Record<AppointmentStatus, { bg: string; text: string; icon: React.ReactNode }> = {
  Scheduled: { bg: "bg-blue-100 dark:bg-blue-900/30", text: "text-blue-700 dark:text-blue-300", icon: <Calendar className="h-4 w-4" /> },
  Confirmed: { bg: "bg-green-100 dark:bg-green-900/30", text: "text-green-700 dark:text-green-300", icon: <CheckCircle className="h-4 w-4" /> },
  "Checked-In": { bg: "bg-purple-100 dark:bg-purple-900/30", text: "text-purple-700 dark:text-purple-300", icon: <User className="h-4 w-4" /> },
  "In Session": { bg: "bg-amber-100 dark:bg-amber-900/30", text: "text-amber-700 dark:text-amber-300", icon: <Play className="h-4 w-4" /> },
  Completed: { bg: "bg-emerald-100 dark:bg-emerald-900/30", text: "text-emerald-700 dark:text-emerald-300", icon: <CheckCircle className="h-4 w-4" /> },
  "No-Show": { bg: "bg-red-100 dark:bg-red-900/30", text: "text-red-700 dark:text-red-300", icon: <XCircle className="h-4 w-4" /> },
  Cancelled: { bg: "bg-gray-100 dark:bg-gray-900/30", text: "text-gray-700 dark:text-gray-300", icon: <XCircle className="h-4 w-4" /> },
};

const STATUS_ACTIONS: Record<AppointmentStatus, { label: string; next: AppointmentStatus; variant: "default" | "outline" | "destructive" }[]> = {
  Scheduled: [
    { label: "Confirm", next: "Confirmed", variant: "default" },
  ],
  Confirmed: [
    { label: "Check In", next: "Checked-In", variant: "default" },
  ],
  "Checked-In": [
    { label: "Begin Session", next: "In Session", variant: "default" },
    { label: "No-Show", next: "No-Show", variant: "destructive" },
  ],
  "In Session": [
    { label: "Complete", next: "Completed", variant: "default" },
  ],
  Completed: [],
  "No-Show": [],
  Cancelled: [],
};

export function AppointmentDetailPanel({
  appointment,
  open,
  onOpenChange,
  onStatusChange,
}: AppointmentDetailPanelProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [cancelDialogOpen, setCancelDialogOpen] = React.useState(false);

  const statusMutation = useMutation({
    mutationFn: async (newStatus: AppointmentStatus) => {
      const response = await fetch(`/api/appointments/${appointment?.id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!response.ok) throw new Error("Failed to update status");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: appointmentKeys.all });
      onStatusChange?.();
    },
  });

  const cancelMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/appointments/${appointment?.id}?reason=provider`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to cancel");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: appointmentKeys.all });
      setCancelDialogOpen(false);
      onOpenChange(false);
      onStatusChange?.();
    },
  });

  if (!appointment) return null;

  const patient = appointment.patient;
  const statusStyle = STATUS_STYLES[appointment.status] || STATUS_STYLES.Scheduled;
  const actions = STATUS_ACTIONS[appointment.status] || [];
  const allowedTransitions = APPOINTMENT_STATUS_TRANSITIONS[appointment.status] || [];

  const appointmentTypeConfig = APPOINTMENT_TYPES.find((t) => t.code === appointment.appointment_type);
  const formattedDate = format(parse(appointment.date, "yyyy-MM-dd", new Date()), "EEEE, MMMM d, yyyy");
  const formattedTime = `${appointment.start_time.slice(0, 5)} - ${appointment.end_time.slice(0, 5)}`;

  const handleBeginSession = () => {
    statusMutation.mutate("In Session");
    if (patient) {
      router.push(`/patients/${patient.id}?tab=session`);
    }
  };

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent className="w-[400px] sm:w-[540px] overflow-y-auto">
          <SheetHeader>
            <SheetTitle className="flex items-center justify-between">
              <span>Appointment Details</span>
              <Badge className={cn(statusStyle.bg, statusStyle.text, "flex items-center gap-1")}>
                {statusStyle.icon}
                {appointment.status}
              </Badge>
            </SheetTitle>
            <SheetDescription>
              {appointmentTypeConfig?.label || appointment.service_type}
              {appointment.cpt_code && <span className="ml-2 text-xs">({appointment.cpt_code})</span>}
            </SheetDescription>
          </SheetHeader>

          <div className="mt-6 space-y-6">
            {/* Patient Info */}
            {patient && (
              <div className="space-y-3">
                <h3 className="text-sm font-medium text-muted-foreground">Patient</h3>
                <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <div className="font-medium flex items-center gap-2">
                      {patient.first_name} {patient.last_name}
                      {patient.risk_level === "high" && (
                        <AlertTriangle className="h-4 w-4 text-red-500" />
                      )}
                    </div>
                    {patient.phone_mobile && (
                      <div className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                        <Phone className="h-3 w-3" />
                        {patient.phone_mobile}
                      </div>
                    )}
                    {patient.email && (
                      <div className="text-sm text-muted-foreground flex items-center gap-1">
                        <Mail className="h-3 w-3" />
                        {patient.email}
                      </div>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => router.push(`/patients/${patient.id}`)}
                    className="min-h-[44px]"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}

            <Separator />

            {/* Date & Time */}
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-muted-foreground">When</h3>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>{formattedDate}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span>{formattedTime} ({appointment.duration_minutes} minutes)</span>
                </div>
                {appointment.recurring_pattern && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Repeat className="h-4 w-4" />
                    <span className="text-sm">Recurring {appointment.recurring_pattern}</span>
                  </div>
                )}
              </div>
            </div>

            <Separator />

            {/* Format & Location */}
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-muted-foreground">Format</h3>
              <div className="flex items-center gap-2">
                {appointment.format === "telehealth" ? (
                  <>
                    <Video className="h-4 w-4 text-blue-500" />
                    <span>Telehealth</span>
                  </>
                ) : (
                  <>
                    <MapPin className="h-4 w-4 text-green-500" />
                    <span>In-Person{appointment.room && ` • ${appointment.room}`}</span>
                  </>
                )}
              </div>
            </div>

            {appointment.notes && (
              <>
                <Separator />
                <div className="space-y-3">
                  <h3 className="text-sm font-medium text-muted-foreground">Notes</h3>
                  <p className="text-sm">{appointment.notes}</p>
                </div>
              </>
            )}

            <Separator />

            {/* Actions */}
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-muted-foreground">Actions</h3>
              <div className="flex flex-wrap gap-2">
                {actions.map((action) => (
                  <Button
                    key={action.next}
                    variant={action.variant}
                    onClick={() => {
                      if (action.next === "In Session") {
                        handleBeginSession();
                      } else {
                        statusMutation.mutate(action.next);
                      }
                    }}
                    disabled={statusMutation.isPending}
                    className="min-h-[44px]"
                  >
                    {action.label}
                  </Button>
                ))}
                {allowedTransitions.includes("Cancelled") && (
                  <Button
                    variant="outline"
                    onClick={() => setCancelDialogOpen(true)}
                    className="min-h-[44px] text-red-600 hover:text-red-700"
                  >
                    Cancel Appointment
                  </Button>
                )}
              </div>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      <AlertDialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel Appointment</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to cancel this appointment with {patient?.first_name} {patient?.last_name}?
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep Appointment</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => cancelMutation.mutate()}
              className="bg-red-600 hover:bg-red-700"
            >
              {cancelMutation.isPending ? "Cancelling..." : "Cancel Appointment"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
