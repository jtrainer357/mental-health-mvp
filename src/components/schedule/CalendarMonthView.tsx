"use client";

/**
 * CalendarMonthView - Month grid calendar view
 * Agent: GAMMA | Feature: Scheduling Production
 */

import * as React from "react";
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  isToday,
} from "date-fns";
import { cn } from "@/design-system/lib/utils";
import { type AppointmentStatus } from "@/src/lib/supabase/scheduling-types";

interface Appointment {
  id: string;
  date: string;
  start_time: string;
  end_time: string;
  status: AppointmentStatus;
}

interface CalendarMonthViewProps {
  date: Date;
  appointments: Appointment[];
  onDayClick: (date: Date) => void;
  showWeekends?: boolean;
}

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function CalendarMonthView({
  date,
  appointments,
  onDayClick,
  showWeekends = true,
}: CalendarMonthViewProps) {
  const monthStart = startOfMonth(date);
  const monthEnd = endOfMonth(date);
  const calendarStart = startOfWeek(monthStart);
  const calendarEnd = endOfWeek(monthEnd);

  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  // Filter days based on weekend setting
  const filteredDays = showWeekends
    ? days
    : days.filter((d) => d.getDay() !== 0 && d.getDay() !== 6);

  const weekdayHeaders = showWeekends
    ? WEEKDAYS
    : WEEKDAYS.filter((_, i) => i !== 0 && i !== 6);

  // Count appointments per day (excluding cancelled)
  const appointmentCounts = new Map<string, number>();
  appointments
    .filter((apt) => apt.status !== "Cancelled")
    .forEach((apt) => {
      const count = appointmentCounts.get(apt.date) || 0;
      appointmentCounts.set(apt.date, count + 1);
    });

  return (
    <div className="flex-1 flex flex-col">
      {/* Weekday headers */}
      <div className={cn("grid gap-1", showWeekends ? "grid-cols-7" : "grid-cols-5")}>
        {weekdayHeaders.map((day) => (
          <div
            key={day}
            className="h-10 flex items-center justify-center text-sm font-medium text-muted-foreground"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className={cn("grid gap-1 flex-1", showWeekends ? "grid-cols-7" : "grid-cols-5")}>
        {filteredDays.map((day) => {
          const dateKey = format(day, "yyyy-MM-dd");
          const count = appointmentCounts.get(dateKey) || 0;
          const isCurrentMonth = isSameMonth(day, date);
          const isDayToday = isToday(day);

          return (
            <button
              key={dateKey}
              onClick={() => onDayClick(day)}
              className={cn(
                "min-h-24 p-2 border rounded-lg text-left transition-all hover:bg-muted/50 focus:outline-none focus:ring-2 focus:ring-primary",
                !isCurrentMonth && "opacity-40",
                isDayToday && "ring-2 ring-primary bg-primary/5"
              )}
            >
              <div
                className={cn(
                  "text-sm font-medium mb-1",
                  isDayToday && "text-primary"
                )}
              >
                {format(day, "d")}
              </div>
              {count > 0 && (
                <div className="text-xs text-muted-foreground">
                  {count} appointment{count !== 1 ? "s" : ""}
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
