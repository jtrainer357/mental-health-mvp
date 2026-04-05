"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CalendarDays, Repeat, X, Check, AlertCircle } from "lucide-react";
import { Button } from "@/design-system/components/ui/button";
import { Badge } from "@/design-system/components/ui/badge";
import { Text } from "@/design-system/components/ui/typography";
import { cn } from "@/design-system/lib/utils";
import type { AppointmentWithPatient } from "@/src/lib/queries/appointments";

// ─── Types ──────────────────────────────────────────────────────────────────

interface RecurringSeriesPanelProps {
  /** Current appointment context */
  appointment: AppointmentWithPatient;
  /** All appointments for this patient (to show series) */
  allAppointments: AppointmentWithPatient[];
  isOpen: boolean;
  onClose: () => void;
  className?: string;
}

// ─── Helpers ────────────────────────────────────────────────────────────────

function formatDate(dateStr: string): string {
  const d = new Date(dateStr + "T12:00:00");
  return d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
}

function formatTime(time: string): string {
  const [hours, minutes] = time.split(":").map(Number);
  const period = hours! >= 12 ? "PM" : "AM";
  const displayHours = hours! % 12 || 12;
  return `${displayHours}:${String(minutes).padStart(2, "0")} ${period}`;
}

// ─── Component ──────────────────────────────────────────────────────────────

export function RecurringSeriesPanel({
  appointment,
  allAppointments,
  isOpen,
  onClose,
  className,
}: RecurringSeriesPanelProps) {
  const [cancellingId, setCancellingId] = React.useState<string | null>(null);
  const [cancelledIds, setCancelledIds] = React.useState<Set<string>>(new Set());
  const [confirmCancelAll, setConfirmCancelAll] = React.useState(false);
  const [allCancelled, setAllCancelled] = React.useState(false);

  // Get future scheduled appointments for this patient (series view)
  const futureAppointments = React.useMemo(() => {
    const today = appointment.date;
    return allAppointments
      .filter(
        (apt) =>
          apt.patient_id === appointment.patient_id &&
          apt.date > today &&
          apt.status === "Scheduled" &&
          !cancelledIds.has(apt.id)
      )
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(0, 6);
  }, [allAppointments, appointment, cancelledIds]);

  const patientName = `${appointment.patient.first_name} ${appointment.patient.last_name}`;
  const dayName = new Date(appointment.date + "T12:00:00").toLocaleDateString("en-US", {
    weekday: "long",
  });

  const handleCancelSingle = (aptId: string) => {
    setCancelledIds((prev) => new Set([...prev, aptId]));
    setCancellingId(null);
  };

  const handleCancelAllFuture = () => {
    const ids = new Set(futureAppointments.map((a) => a.id));
    setCancelledIds((prev) => new Set([...prev, ...ids]));
    setConfirmCancelAll(false);
    setAllCancelled(true);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
          className={cn("overflow-hidden", className)}
        >
          <div className="border-border/30 mx-5 border-t" />
          <div className="px-5 py-4">
            {/* Header */}
            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Repeat className="text-teal h-4 w-4" />
                <Text size="sm" className="font-bold">
                  Recurring Series
                </Text>
                <Badge
                  variant="outline"
                  className="border-teal/20 bg-teal/[0.06] text-teal rounded-full px-2 py-0.5 text-[10px] font-bold"
                >
                  Weekly · {dayName}s at {formatTime(appointment.start_time)}
                </Badge>
              </div>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onClose();
                }}
                className="text-muted-foreground hover:text-foreground rounded-full p-1 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Success message after cancel all */}
            {allCancelled && (
              <div className="bg-success/10 border-success/20 mb-3 flex items-center gap-2 rounded-lg border px-3 py-2">
                <Check className="text-success h-4 w-4 shrink-0" />
                <Text size="xs" className="text-success">
                  All future appointments cancelled. Recurring series preserved — you can
                  reschedule individual sessions.
                </Text>
              </div>
            )}

            {/* Appointments list */}
            {futureAppointments.length > 0 ? (
              <div className="space-y-1.5">
                {futureAppointments.map((apt) => {
                  const isConfirming = cancellingId === apt.id;

                  return (
                    <div
                      key={apt.id}
                      className={cn(
                        "flex items-center justify-between rounded-lg px-3 py-2 transition-all",
                        isConfirming ? "bg-destructive/[0.06] border-destructive/20 border" : "bg-muted/30"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <CalendarDays className="text-muted-foreground h-4 w-4 shrink-0" />
                        <div>
                          <Text size="sm" className="font-medium">
                            {formatDate(apt.date)}
                          </Text>
                          <Text size="xs" muted>
                            {formatTime(apt.start_time)} – {formatTime(apt.end_time)} ·{" "}
                            {apt.service_type}
                          </Text>
                        </div>
                      </div>

                      {isConfirming ? (
                        <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                          <Text size="xs" className="text-destructive font-medium">
                            Cancel this appointment?
                          </Text>
                          <Button
                            size="sm"
                            variant="destructive"
                            className="h-7 rounded-full px-3 text-[11px] font-bold"
                            onClick={() => handleCancelSingle(apt.id)}
                          >
                            Yes, Cancel
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-7 rounded-full px-3 text-[11px] font-bold"
                            onClick={() => setCancellingId(null)}
                          >
                            Keep
                          </Button>
                        </div>
                      ) : (
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-muted-foreground hover:text-destructive h-7 rounded-full px-3 text-[11px] font-medium"
                          onClick={(e) => {
                            e.stopPropagation();
                            setCancellingId(apt.id);
                          }}
                        >
                          Cancel
                        </Button>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-muted-foreground py-4 text-center text-sm">
                No upcoming appointments in this series
              </div>
            )}

            {/* Cancel All Future / footer actions */}
            {futureAppointments.length > 0 && !allCancelled && (
              <div className="mt-3 flex items-center justify-between border-t border-border/30 pt-3">
                {confirmCancelAll ? (
                  <div className="flex items-center gap-3" onClick={(e) => e.stopPropagation()}>
                    <AlertCircle className="text-destructive h-4 w-4 shrink-0" />
                    <Text size="xs" className="text-destructive font-medium">
                      Cancel all {futureAppointments.length} future appointments? The series can be
                      restored later.
                    </Text>
                    <Button
                      size="sm"
                      variant="destructive"
                      className="h-7 shrink-0 rounded-full px-3 text-[11px] font-bold"
                      onClick={handleCancelAllFuture}
                    >
                      Cancel All
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-7 shrink-0 rounded-full px-3 text-[11px] font-bold"
                      onClick={() => setConfirmCancelAll(false)}
                    >
                      Never mind
                    </Button>
                  </div>
                ) : (
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-destructive/70 hover:text-destructive h-7 rounded-full px-3 text-[11px] font-medium"
                    onClick={(e) => {
                      e.stopPropagation();
                      setConfirmCancelAll(true);
                    }}
                  >
                    Cancel all future appointments
                  </Button>
                )}
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
