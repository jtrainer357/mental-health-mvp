"use client";

/**
 * CalendarMonthView - Month grid showing appointment counts per day
 * Agent: GAMMA | Feature: Scheduling Production
 */

import * as React from "react";
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  format,
  isSameMonth,
  isSameDay,
  isToday,
} from "date-fns";
import { cn } from "@/design-system/lib/utils";
import type { AppointmentStatus } from "@/src/lib/supabase/types";

interface CalendarAppointment {
  id: string;
  date: string;
  status: AppointmentStatus;
}

interface CalendarMonthViewProps {
  date: Date;
  appointments: CalendarAppointment[];
  onDayClick?: (date: Date) => void;
  selectedDate?: Date | null;
  className?: string;
}

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function CalendarMonthView({
  date,
  appointments,
  onDayClick,
  selectedDate,
  className,
}: CalendarMonthViewProps) {
  const monthStart = startOfMonth(date);
  const monthEnd = endOfMonth(date);
  const calendarStart = startOfWeek(monthStart);
  const calendarEnd = endOfWeek(monthEnd);

  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  // Count appointments per day
  const appointmentCounts = React.useMemo(() => {
    const counts: Record<string, { total: number; active: number }> = {};

    appointments.forEach((appt) => {
      const dateKey = appt.date;
      if (!counts[dateKey]) {
        counts[dateKey] = { total: 0, active: 0 };
      }
      counts[dateKey].total++;
      if (!["Cancelled", "No-Show"].includes(appt.status)) {
        counts[dateKey].active++;
      }
    });

    return counts;
  }, [appointments]);

  const getCountForDay = (day: Date) => {
    const dateKey = format(day, "yyyy-MM-dd");
    return appointmentCounts[dateKey] || { total: 0, active: 0 };
  };

  return (
    <div className={cn("border-border/40 overflow-hidden rounded-xl border", className)}>
      {/* Month header */}
      <div className="border-border/40 border-b bg-white/80 px-4 py-3 backdrop-blur-sm">
        <p className="text-lg font-semibold">{format(date, "MMMM yyyy")}</p>
      </div>

      {/* Day names header */}
      <div className="border-border/40 grid grid-cols-7 border-b bg-white/60">
        {DAY_NAMES.map((day) => (
          <div
            key={day}
            className="border-border/40 border-r py-2 text-center last:border-r-0"
          >
            <span className="text-muted-foreground text-xs font-semibold uppercase">{day}</span>
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 bg-white/40">
        {days.map((day, index) => {
          const isCurrentMonth = isSameMonth(day, date);
          const isSelected = selectedDate && isSameDay(day, selectedDate);
          const today = isToday(day);
          const counts = getCountForDay(day);
          const hasAppointments = counts.active > 0;

          return (
            <button
              key={index}
              type="button"
              onClick={() => onDayClick?.(day)}
              className={cn(
                "border-border/40 group relative flex min-h-[80px] flex-col border-r border-b p-2 text-left transition-colors last:border-r-0",
                !isCurrentMonth && "bg-muted/20",
                isCurrentMonth && "hover:bg-teal/5",
                isSelected && "bg-teal/10 ring-teal ring-2 ring-inset",
                today && "bg-primary/5"
              )}
            >
              {/* Day number */}
              <span
                className={cn(
                  "flex h-7 w-7 items-center justify-center rounded-full text-sm font-medium",
                  !isCurrentMonth && "text-muted-foreground/50",
                  today && "bg-primary text-primary-foreground",
                  isSelected && !today && "bg-teal/20 text-teal"
                )}
              >
                {format(day, "d")}
              </span>

              {/* Appointment count */}
              {hasAppointments && (
                <div className="mt-auto">
                  <span
                    className={cn(
                      "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
                      counts.active >= 5
                        ? "bg-orange-100 text-orange-700"
                        : counts.active >= 3
                          ? "bg-blue-100 text-blue-700"
                          : "bg-teal/10 text-teal"
                    )}
                  >
                    {counts.active} appt{counts.active !== 1 ? "s" : ""}
                  </span>
                </div>
              )}

              {/* Hover indicator */}
              {isCurrentMonth && !isSelected && (
                <div className="bg-teal/10 absolute inset-0 opacity-0 transition-opacity group-hover:opacity-100" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
