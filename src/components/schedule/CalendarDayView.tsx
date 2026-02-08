"use client";

/**
 * CalendarDayView - Single day calendar view with time slots
 * Agent: GAMMA | Feature: Scheduling Production
 */

import * as React from "react";
import { format, isSameDay, parse } from "date-fns";
import { cn } from "@/design-system/lib/utils";
import { type AppointmentStatus } from "@/src/lib/supabase/scheduling-types";

interface Patient {
  id: string;
  first_name: string;
  last_name: string;
  avatar_url?: string | null;
  risk_level?: "low" | "medium" | "high" | null;
}

interface Appointment {
  id: string;
  date: string;
  start_time: string;
  end_time: string;
  duration_minutes: number;
  status: AppointmentStatus;
  service_type?: string;
  format?: "in_person" | "telehealth";
  patient?: Patient;
}

interface CalendarDayViewProps {
  date: Date;
  appointments: Appointment[];
  onAppointmentClick: (appointment: Appointment) => void;
  onTimeSlotClick: (date: Date, time: string) => void;
}

const HOURS = Array.from({ length: 11 }, (_, i) => i + 8); // 8 AM to 6 PM

const STATUS_COLORS: Record<AppointmentStatus, string> = {
  Scheduled: "bg-blue-100 border-blue-300 text-blue-800 dark:bg-blue-900/30 dark:border-blue-700 dark:text-blue-300",
  Confirmed: "bg-green-100 border-green-300 text-green-800 dark:bg-green-900/30 dark:border-green-700 dark:text-green-300",
  "Checked-In": "bg-purple-100 border-purple-300 text-purple-800 dark:bg-purple-900/30 dark:border-purple-700 dark:text-purple-300",
  "In Session": "bg-amber-100 border-amber-300 text-amber-800 dark:bg-amber-900/30 dark:border-amber-700 dark:text-amber-300",
  Completed: "bg-emerald-100 border-emerald-300 text-emerald-800 dark:bg-emerald-900/30 dark:border-emerald-700 dark:text-emerald-300",
  "No-Show": "bg-red-100 border-red-300 text-red-800 dark:bg-red-900/30 dark:border-red-700 dark:text-red-300",
  Cancelled: "bg-gray-100 border-gray-300 text-gray-500 dark:bg-gray-900/30 dark:border-gray-700 dark:text-gray-400",
};

export function CalendarDayView({
  date,
  appointments,
  onAppointmentClick,
  onTimeSlotClick,
}: CalendarDayViewProps) {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const isToday = isSameDay(date, new Date());

  // Filter appointments for this day (excluding cancelled)
  const dayAppointments = appointments.filter(
    (apt) => apt.date === format(date, "yyyy-MM-dd") && apt.status !== "Cancelled"
  );

  // Calculate current time indicator position
  const now = new Date();
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();
  const showCurrentTime = isToday && currentHour >= 8 && currentHour < 18;
  const currentTimeTop = showCurrentTime
    ? ((currentHour - 8) * 60 + currentMinute) * (64 / 60)
    : 0;

  // Scroll to current time on mount
  React.useEffect(() => {
    if (containerRef.current && showCurrentTime) {
      const scrollTop = Math.max(0, currentTimeTop - 100);
      containerRef.current.scrollTop = scrollTop;
    }
  }, [currentTimeTop, showCurrentTime]);

  const getAppointmentStyle = (apt: Appointment) => {
    const startParts = apt.start_time.split(":").map(Number);
    const startHour = startParts[0] ?? 9;
    const startMin = startParts[1] ?? 0;
    const top = ((startHour - 8) * 60 + startMin) * (64 / 60);
    const height = apt.duration_minutes * (64 / 60);
    return { top: `${top}px`, height: `${Math.max(height, 32)}px` };
  };

  return (
    <div ref={containerRef} className="flex-1 overflow-y-auto">
      <div className="relative min-h-[704px]">
        {/* Time grid */}
        <div className="absolute inset-0">
          {HOURS.map((hour) => (
            <div
              key={hour}
              className="h-16 border-b border-border flex"
            >
              <div className="w-16 flex-shrink-0 text-xs text-muted-foreground py-1 px-2">
                {format(new Date().setHours(hour, 0), "h a")}
              </div>
              <div
                className="flex-1 cursor-pointer hover:bg-muted/50 transition-colors"
                onClick={() => onTimeSlotClick(date, `${hour.toString().padStart(2, "0")}:00`)}
              />
            </div>
          ))}
        </div>

        {/* Current time indicator */}
        {showCurrentTime && (
          <div
            className="absolute left-16 right-0 z-10 flex items-center pointer-events-none"
            style={{ top: `${currentTimeTop}px` }}
          >
            <div className="w-2 h-2 rounded-full bg-red-500" />
            <div className="flex-1 h-0.5 bg-red-500" />
          </div>
        )}

        {/* Appointments */}
        <div className="absolute left-16 right-2 top-0">
          {dayAppointments.map((apt) => (
            <button
              key={apt.id}
              onClick={() => onAppointmentClick(apt)}
              className={cn(
                "absolute left-0 right-0 p-2 rounded-md border text-left transition-all hover:shadow-md focus:outline-none focus:ring-2 focus:ring-primary",
                STATUS_COLORS[apt.status]
              )}
              style={getAppointmentStyle(apt)}
            >
              <div className="font-medium text-sm truncate">
                {apt.patient ? `${apt.patient.first_name} ${apt.patient.last_name}` : "Unknown Patient"}
              </div>
              <div className="text-xs opacity-75 truncate">
                {apt.start_time.slice(0, 5)} - {apt.end_time.slice(0, 5)}
                {apt.service_type && ` • ${apt.service_type}`}
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
