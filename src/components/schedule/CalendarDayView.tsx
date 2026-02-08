"use client";

/**
 * CalendarDayView - Single day view with 15-minute time slots
 * Agent: GAMMA | Feature: Scheduling Production
 */

import * as React from "react";
import { format, isSameDay, parse } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/design-system/lib/utils";
import { CalendarEventCard, type EventColor } from "@/design-system/components/ui/calendar-event-card";
import type { AppointmentStatus } from "@/src/lib/supabase/types";

interface CalendarAppointment {
  id: string;
  patientName: string;
  startTime: string;
  endTime: string;
  date: string;
  status: AppointmentStatus;
  appointmentType?: string;
  format?: "in_person" | "telehealth" | null;
  isRecurring?: boolean;
}

interface CalendarDayViewProps {
  date: Date;
  appointments: CalendarAppointment[];
  startHour?: number;
  endHour?: number;
  onAppointmentClick?: (appointment: CalendarAppointment) => void;
  onTimeSlotClick?: (date: Date, time: string) => void;
  selectedAppointmentId?: string | null;
  currentTime?: Date;
  className?: string;
}

const HOUR_HEIGHT = 64;
const SLOT_INTERVAL = 15; // minutes

// Map status to event color
const STATUS_COLOR_MAP: Record<AppointmentStatus, EventColor> = {
  Scheduled: "blue",
  Confirmed: "green",
  "Checked-In": "blue",
  "In Session": "orange",
  Completed: "gray",
  "No-Show": "red",
  Cancelled: "gray",
};

export function CalendarDayView({
  date,
  appointments,
  startHour = 8,
  endHour = 18,
  onAppointmentClick,
  onTimeSlotClick,
  selectedAppointmentId,
  currentTime,
  className,
}: CalendarDayViewProps) {
  const hours = React.useMemo(() => {
    const result: number[] = [];
    for (let i = startHour; i <= endHour; i++) {
      result.push(i);
    }
    return result;
  }, [startHour, endHour]);

  const formatHour = (hour: number) => {
    if (hour === 12) return "12 PM";
    if (hour > 12) return `${hour - 12} PM`;
    return `${hour} AM`;
  };

  const getEventPosition = (startTimeStr: string, endTimeStr: string) => {
    const startTime = parse(startTimeStr, "HH:mm:ss", new Date());
    const endTime = parse(endTimeStr, "HH:mm:ss", new Date());

    const eventHour = startTime.getHours();
    const eventMinutes = startTime.getMinutes();
    const endHourEvent = endTime.getHours();
    const endMinutes = endTime.getMinutes();

    const top = (eventHour - startHour) * HOUR_HEIGHT + (eventMinutes / 60) * HOUR_HEIGHT;
    const duration = (endHourEvent - eventHour) * 60 + (endMinutes - eventMinutes);
    const height = (duration / 60) * HOUR_HEIGHT;

    return { top, height: Math.max(height, 32) };
  };

  const dayAppointments = appointments.filter((appt) =>
    isSameDay(new Date(appt.date), date)
  );

  // Current time indicator
  const now = currentTime || new Date();
  const isToday = isSameDay(date, now);
  const currentTimeTop =
    (now.getHours() - startHour) * HOUR_HEIGHT + (now.getMinutes() / 60) * HOUR_HEIGHT;
  const showCurrentTime = isToday && now.getHours() >= startHour && now.getHours() <= endHour;

  const handleTimeSlotClick = (hour: number, quarterIndex: number) => {
    if (!onTimeSlotClick) return;
    const minutes = quarterIndex * SLOT_INTERVAL;
    const time = `${hour.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`;
    onTimeSlotClick(date, time);
  };

  return (
    <div className={cn("border-border/40 flex flex-col overflow-hidden rounded-xl border", className)}>
      {/* Header */}
      <div className="border-border/40 border-b bg-white/80 px-4 py-3 backdrop-blur-sm">
        <p className="text-lg font-semibold">{format(date, "EEEE, MMMM d, yyyy")}</p>
        <p className="text-muted-foreground text-sm">
          {dayAppointments.length} appointment{dayAppointments.length !== 1 ? "s" : ""}
        </p>
      </div>

      {/* Time grid */}
      <div className="relative flex-1 overflow-auto bg-white/40">
        <div className="relative min-h-full">
          {/* Hour rows */}
          {hours.map((hour) => (
            <div
              key={hour}
              className="border-border/40 relative grid grid-cols-[56px_1fr] border-b"
              style={{ height: HOUR_HEIGHT }}
            >
              {/* Time label */}
              <div className="relative">
                <span className="text-muted-foreground absolute -top-[9px] right-3 bg-transparent px-1 text-[11px] font-medium">
                  {formatHour(hour)}
                </span>
              </div>

              {/* Time slots (4 x 15-minute slots per hour) */}
              <div className="grid grid-cols-4">
                {[0, 1, 2, 3].map((quarterIndex) => (
                  <button
                    key={quarterIndex}
                    type="button"
                    className={cn(
                      "border-border/20 border-l transition-colors",
                      hour < 8 || hour >= 18 ? "bg-muted/20" : "hover:bg-teal/5",
                      quarterIndex > 0 && "border-dashed"
                    )}
                    onClick={() => handleTimeSlotClick(hour, quarterIndex)}
                    aria-label={`${formatHour(hour)}:${(quarterIndex * 15).toString().padStart(2, "0")}`}
                  />
                ))}
              </div>
            </div>
          ))}

          {/* Appointments overlay */}
          <div className="pointer-events-none absolute inset-0 left-14">
            <AnimatePresence mode="popLayout">
              {dayAppointments.map((appt) => {
                const { top, height } = getEventPosition(appt.startTime, appt.endTime);
                const isSelected = selectedAppointmentId === appt.id;
                const isCancelled = appt.status === "Cancelled" || appt.status === "No-Show";

                return (
                  <motion.div
                    key={appt.id}
                    layoutId={appt.id}
                    className={cn(
                      "pointer-events-auto absolute inset-x-2",
                      isCancelled && "opacity-50"
                    )}
                    initial={false}
                    animate={{
                      top,
                      height,
                      scale: isSelected ? 1.02 : 1,
                      zIndex: isSelected ? 10 : 1,
                    }}
                    transition={{
                      type: "spring",
                      stiffness: 300,
                      damping: 30,
                    }}
                    style={{ height }}
                  >
                    <div
                      className={cn(
                        "h-full rounded-md",
                        isSelected && "ring-teal ring-2 ring-offset-1"
                      )}
                    >
                      <CalendarEventCard
                        title={appt.patientName}
                        time={format(parse(appt.startTime, "HH:mm:ss", new Date()), "h:mm a")}
                        color={STATUS_COLOR_MAP[appt.status]}
                        hasNotification={appt.status === "In Session"}
                        onClick={() => onAppointmentClick?.(appt)}
                        className={cn("h-full", isCancelled && "line-through")}
                      />
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>

          {/* Current time indicator */}
          {showCurrentTime && (
            <div
              className="pointer-events-none absolute right-0 left-14 z-20 flex items-center"
              style={{ top: currentTimeTop }}
            >
              <div className="bg-primary h-2.5 w-2.5 rounded-full" />
              <div className="border-primary flex-1 border-t-2" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
