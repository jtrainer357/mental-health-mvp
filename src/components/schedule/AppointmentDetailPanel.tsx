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
  date_of_birth?: string | null;
  primary_diagnosis_name?: string | null;
}

interface AppointmentWithPatient {
  id: string;
  patient_id: string;
  date: string;
  start_time: string;
  end_time: string;
  duration_minutes: number;
  status: AppointmentStatus;
  service_type: string;
  appointment_type?: string | null;
  format?: "in_person" | "telehealth" | null;
  room?: string | null;
  notes?: string | null;
  recurring_group_id?: string | null;
  recurring_pattern?: string | null;
  cancelled_reason?: string | null;
  patient: Patient;
}

interface AppointmentDetailPanelProps {
  appointment: AppointmentWithPatient | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onReschedule?: (appointment: AppointmentWithPatient) => void;
}

// Status badge styles
const STATUS_STYLES: Record<
  AppointmentStatus,
  { bg: string; text: string; icon: React.ElementType; pulsing?: boolean }
> = {
  Scheduled: { bg: "bg-blue-100", text: "text-blue-700", icon: Calendar },
  Confirmed: { bg: "bg-green-100", text: "text-green-700", icon: CheckCircle },
  "Checked-In": { bg: "bg-teal/20", text: "text-teal", icon: User },
  "In Session": { bg: "bg-orange-100", text: "text-orange-700", icon: Play, pulsing: true },
  Completed: { bg: "bg-gray-100", text: "text-gray-600", icon: CheckCircle },
  "No-Show": { bg: "bg-red-100", text: "text-red-700", icon: XCircle },
  Cancelled: { bg: "bg-red-100", text: "text-red-600", icon: XCircle },
};

// Status action buttons
const STATUS_ACTIONS: Record<AppointmentStatus, { label: string; nextStatus: AppointmentStatus }[]> =
  {
    Scheduled: [
      { label: "Confirm", nextStatus: "Confirmed" },
      { label: "Cancel", nextStatus: "Cancelled" },
    ],
    Confirmed: [
      { label: "Check In", nextStatus: "Checked-In" },
      { label: "Cancel", nextStatus: "Cancelled" },
    ],
    "Checked-In": [
      { label: "Begin Session", nextStatus: "In Session" },
      { label: "Mark No-Show", nextStatus: "No-Show" },
    ],
    "In Session": [{ label: "Complete Session", nextStatus: "Completed" }],
    Completed: [],
    "No-Show": [],
    Cancelled: [],
  };

export function AppointmentDetailPanel({
  appointment,
  open,
  onOpenChange,
  onReschedule,
}: AppointmentDetailPanelProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [cancelDialogOpen, setCancelDialogOpen] = React.useState(false);
  const [pendingStatus, setPendingStatus] = React.useState<AppointmentStatus | null>(null);

  // Status update mutation
  const statusMutation = useMutation({
    mutationFn: async (newStatus: AppointmentStatus) => {
      const response = await fetch(`/api/appointments/${appointment?.id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: newStatus,
          cancelReason: newStatus === "Cancelled" ? "provider" : undefined,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update status");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: appointmentKeys.all });
      setCancelDialogOpen(false);
      setPendingStatus(null);
    },
  });

  if (!appointment) return null;

  const patient = appointment.patient;
  const statusStyle = STATUS_STYLES[appointment.status] || STATUS_STYLES.Scheduled;
  const StatusIcon = statusStyle.icon;
  const actions = STATUS_ACTIONS[appointment.status] || [];
  const isTerminal = ["Completed", "No-Show", "Cancelled"].includes(appointment.status);

  const formatTime = (timeStr: string) => {
    try {
      const date = parse(timeStr, "HH:mm:ss", new Date());
      return format(date, "h:mm a");
    } catch {
      return timeStr;
    }
  };

  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return format(date, "EEEE, MMMM d, yyyy");
    } catch {
      return dateStr;
    }
  };

  const handleStatusChange = (newStatus: AppointmentStatus) => {
    if (newStatus === "Cancelled") {
      setPendingStatus(newStatus);
      setCancelDialogOpen(true);
    } else if (newStatus === "In Session") {
      // Navigate to patient 360 with session context
      router.push(`/patients?id=${patient.id}&session=${appointment.id}`);
    } else {
      statusMutation.mutate(newStatus);
    }
  };

  const appointmentTypeLabel =
    APPOINTMENT_TYPES.find((t: { code: string }) => t.code === appointment.appointment_type)?.label ||
    appointment.service_type;

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent className="w-full overflow-y-auto sm:max-w-md">
          <SheetHeader className="space-y-1">
            <SheetTitle className="flex items-center gap-2">
              <span>Appointment Details</span>
              {appointment.recurring_group_id && (
                <Repeat className="text-muted-foreground h-4 w-4" />
              )}
            </SheetTitle>
            <SheetDescription>
              {formatDate(appointment.date)} at {formatTime(appointment.start_time)}
            </SheetDescription>
          </SheetHeader>

          <div className="mt-6 space-y-6">
            {/* Status Badge */}
            <div className="flex items-center justify-between">
              <Badge
                className={cn(
                  "flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-medium",
                  statusStyle.bg,
                  statusStyle.text,
                  statusStyle.pulsing && "animate-pulse"
                )}
              >
                <StatusIcon className="h-3.5 w-3.5" />
                {appointment.status}
              </Badge>

              {appointment.status === "Cancelled" && appointment.cancelled_reason && (
                <span className="text-muted-foreground text-sm">
                  Reason: {appointment.cancelled_reason}
                </span>
              )}
            </div>

            <Separator />

            {/* Patient Info */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold">Patient</h3>
              <div className="flex items-center gap-3">
                <div className="bg-teal/10 text-teal flex h-12 w-12 items-center justify-center rounded-full text-lg font-semibold">
                  {patient.first_name[0]}
                  {patient.last_name[0]}
                </div>
                <div className="flex-1">
                  <p className="font-medium">
                    {patient.first_name} {patient.last_name}
                  </p>
                  {patient.primary_diagnosis_name && (
                    <p className="text-muted-foreground text-sm">
                      {patient.primary_diagnosis_name}
                    </p>
                  )}
                </div>
                {patient.risk_level === "high" && (
                  <Badge variant="destructive" className="gap-1">
                    <AlertTriangle className="h-3 w-3" />
                    High Risk
                  </Badge>
                )}
              </div>

              {/* Contact Info */}
              <div className="space-y-2">
                {patient.phone_mobile && (
                  <a
                    href={`tel:${patient.phone_mobile}`}
                    className="text-muted-foreground hover:text-foreground flex items-center gap-2 text-sm"
                  >
                    <Phone className="h-4 w-4" />
                    {patient.phone_mobile}
                  </a>
                )}
                {patient.email && (
                  <a
                    href={`mailto:${patient.email}`}
                    className="text-muted-foreground hover:text-foreground flex items-center gap-2 text-sm"
                  >
                    <Mail className="h-4 w-4" />
                    {patient.email}
                  </a>
                )}
              </div>
            </div>

            <Separator />

            {/* Appointment Details */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold">Appointment</h3>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="text-muted-foreground h-4 w-4" />
                  <span>{formatDate(appointment.date)}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="text-muted-foreground h-4 w-4" />
                  <span>
                    {formatTime(appointment.start_time)} - {formatTime(appointment.end_time)}
                  </span>
                  <span className="text-muted-foreground">({appointment.duration_minutes} min)</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  {appointment.format === "telehealth" ? (
                    <Video className="text-muted-foreground h-4 w-4" />
                  ) : (
                    <MapPin className="text-muted-foreground h-4 w-4" />
                  )}
                  <span>
                    {appointment.format === "telehealth" ? "Telehealth" : "In-Person"}
                    {appointment.room && ` - ${appointment.room}`}
                  </span>
                </div>
                <div className="text-muted-foreground text-sm">{appointmentTypeLabel}</div>
              </div>

              {appointment.notes && (
                <div className="bg-muted/50 mt-3 rounded-lg p-3">
                  <p className="text-muted-foreground text-sm">{appointment.notes}</p>
                </div>
              )}
            </div>

            <Separator />

            {/* Actions */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold">Actions</h3>

              {/* Status Actions */}
              {actions.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {actions.map((action) => (
                    <Button
                      key={action.nextStatus}
                      variant={action.nextStatus === "Cancelled" ? "destructive" : "default"}
                      size="sm"
                      onClick={() => handleStatusChange(action.nextStatus)}
                      disabled={statusMutation.isPending}
                    >
                      {action.label}
                    </Button>
                  ))}
                </div>
              )}

              {/* Begin Session button for Checked-In */}
              {appointment.status === "Checked-In" && (
                <Button
                  className="w-full"
                  onClick={() =>
                    router.push(`/patients?id=${patient.id}&session=${appointment.id}`)
                  }
                >
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Begin Session
                </Button>
              )}

              {/* Reschedule option for non-terminal statuses */}
              {!isTerminal && onReschedule && (
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => onReschedule(appointment)}
                >
                  Reschedule
                </Button>
              )}

              {/* View Patient for completed/no-show */}
              {isTerminal && (
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => router.push(`/patients?id=${patient.id}`)}
                >
                  <User className="mr-2 h-4 w-4" />
                  View Patient Record
                </Button>
              )}
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Cancel Confirmation Dialog */}
      <AlertDialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel Appointment?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to cancel this appointment with {patient.first_name}{" "}
              {patient.last_name}? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep Appointment</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => pendingStatus && statusMutation.mutate(pendingStatus)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {statusMutation.isPending ? "Cancelling..." : "Cancel Appointment"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
