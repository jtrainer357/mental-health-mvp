"use client";

/**
 * Schedule Page - Full calendar and appointment management
 * Agent: GAMMA | Feature: Scheduling Production
 */

import * as React from "react";
import { useState, useMemo, useCallback } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  format,
  startOfWeek,
  endOfWeek,
  addDays,
  addWeeks,
  subWeeks,
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
  isSameDay,
} from "date-fns";
import { ChevronLeft, ChevronRight, Plus, CalendarDays, LayoutGrid, List } from "lucide-react";

import { Button } from "@/design-system/components/ui/button";
import { CalendarWeekView, type CalendarEvent } from "@/design-system/components/ui/calendar-week-view";
import { AppointmentModal } from "@/src/components/schedule/AppointmentModal";
import { AppointmentDetailPanel } from "@/src/components/schedule/AppointmentDetailPanel";
import { CalendarDayView } from "@/src/components/schedule/CalendarDayView";
import { CalendarMonthView } from "@/src/components/schedule/CalendarMonthView";
import { cn } from "@/design-system/lib/utils";
import { appointmentKeys } from "@/src/lib/queries/keys";
import { getDemoTodayDate, DEMO_DATE } from "@/src/lib/utils/demo-date";
import type { AppointmentStatus } from "@/src/lib/supabase/types";

type ViewMode = "day" | "week" | "month";

// Map status to calendar event color
const STATUS_COLOR_MAP: Record<AppointmentStatus, CalendarEvent["color"]> = {
  Scheduled: "blue",
  Confirmed: "green",
  "Checked-In": "blue",
  "In Session": "orange",
  Completed: "gray",
  "No-Show": "red",
  Cancelled: "gray",
};

interface AppointmentFromAPI {
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
  patient: {
    id: string;
    first_name: string;
    last_name: string;
    avatar_url?: string | null;
    phone_mobile?: string | null;
    email?: string | null;
    risk_level?: "low" | "medium" | "high" | null;
    date_of_birth?: string | null;
    primary_diagnosis_name?: string | null;
  };
}

export default function SchedulePage() {
  const queryClient = useQueryClient();

  // Use demo date as initial date
  const demoToday = getDemoTodayDate();
  const [currentDate, setCurrentDate] = useState(demoToday);
  const [viewMode, setViewMode] = useState<ViewMode>("week");
  const [showWeekends, setShowWeekends] = useState(true);

  // Modal states
  const [appointmentModalOpen, setAppointmentModalOpen] = useState(false);
  const [defaultModalDate, setDefaultModalDate] = useState<string | undefined>();
  const [defaultModalTime, setDefaultModalTime] = useState<string | undefined>();

  // Detail panel state
  const [selectedAppointment, setSelectedAppointment] = useState<AppointmentFromAPI | null>(null);
  const [detailPanelOpen, setDetailPanelOpen] = useState(false);

  // Calculate date range based on view mode
  const { startDate, endDate, weekDays } = useMemo(() => {
    let start: Date;
    let end: Date;

    switch (viewMode) {
      case "day":
        start = currentDate;
        end = currentDate;
        break;
      case "week":
        start = startOfWeek(currentDate);
        end = endOfWeek(currentDate);
        break;
      case "month":
        start = startOfMonth(currentDate);
        end = endOfMonth(currentDate);
        break;
    }

    // Generate week days for week view
    const weekStart = startOfWeek(currentDate);
    const days = showWeekends
      ? Array.from({ length: 7 }, (_, i) => addDays(weekStart, i))
      : Array.from({ length: 5 }, (_, i) => addDays(weekStart, i + 1));

    return {
      startDate: format(start, "yyyy-MM-dd"),
      endDate: format(end, "yyyy-MM-dd"),
      weekDays: days,
    };
  }, [currentDate, viewMode, showWeekends]);

  // Fetch appointments
  const { data: appointmentsData, isLoading } = useQuery({
    queryKey: appointmentKeys.lists(),
    queryFn: async () => {
      // Fetch a wider range for smooth navigation
      const rangeStart = format(subMonths(currentDate, 1), "yyyy-MM-dd");
      const rangeEnd = format(addMonths(currentDate, 2), "yyyy-MM-dd");

      const response = await fetch(
        `/api/appointments?startDate=${rangeStart}&endDate=${rangeEnd}`
      );
      if (!response.ok) throw new Error("Failed to fetch appointments");
      const data = await response.json();
      return data.appointments as AppointmentFromAPI[];
    },
    staleTime: 30000,
  });

  const appointments = appointmentsData || [];

  // Convert appointments to calendar events for week view
  const calendarEvents: CalendarEvent[] = useMemo(() => {
    return appointments.map((appt) => {
      const startParts = appt.start_time.split(":").map(Number);
      const endParts = appt.end_time.split(":").map(Number);

      const hours = startParts[0] ?? 9;
      const minutes = startParts[1] ?? 0;
      const endHours = endParts[0] ?? 10;
      const endMinutes = endParts[1] ?? 0;

      const startTime = new Date(appt.date);
      startTime.setHours(hours, minutes, 0);

      const endTime = new Date(appt.date);
      endTime.setHours(endHours, endMinutes, 0);

      return {
        id: appt.id,
        title: `${appt.patient.first_name} ${appt.patient.last_name}`,
        startTime,
        endTime,
        color: STATUS_COLOR_MAP[appt.status] || ("blue" as const),
        hasNotification: appt.status === "In Session",
      };
    });
  }, [appointments]);

  // Navigation handlers
  const handlePrevious = useCallback(() => {
    switch (viewMode) {
      case "day":
        setCurrentDate((d) => addDays(d, -1));
        break;
      case "week":
        setCurrentDate((d) => subWeeks(d, 1));
        break;
      case "month":
        setCurrentDate((d) => subMonths(d, 1));
        break;
    }
  }, [viewMode]);

  const handleNext = useCallback(() => {
    switch (viewMode) {
      case "day":
        setCurrentDate((d) => addDays(d, 1));
        break;
      case "week":
        setCurrentDate((d) => addWeeks(d, 1));
        break;
      case "month":
        setCurrentDate((d) => addMonths(d, 1));
        break;
    }
  }, [viewMode]);

  const handleToday = useCallback(() => {
    setCurrentDate(demoToday);
  }, [demoToday]);

  // Event handlers
  const handleEventClick = useCallback(
    (event: CalendarEvent) => {
      const appt = appointments.find((a) => a.id === event.id);
      if (appt) {
        setSelectedAppointment(appt);
        setDetailPanelOpen(true);
      }
    },
    [appointments]
  );

  const handleDayAppointmentClick = useCallback(
    (appt: { id: string }) => {
      const fullAppt = appointments.find((a) => a.id === appt.id);
      if (fullAppt) {
        setSelectedAppointment(fullAppt);
        setDetailPanelOpen(true);
      }
    },
    [appointments]
  );

  const handleTimeSlotClick = useCallback((date: Date, time: string) => {
    setDefaultModalDate(format(date, "yyyy-MM-dd"));
    setDefaultModalTime(time);
    setAppointmentModalOpen(true);
  }, []);

  const handleDayClick = useCallback(
    (date: Date) => {
      setCurrentDate(date);
      setViewMode("day");
    },
    []
  );

  const handleNewAppointment = useCallback(() => {
    setDefaultModalDate(format(currentDate, "yyyy-MM-dd"));
    setDefaultModalTime("09:00");
    setAppointmentModalOpen(true);
  }, [currentDate]);

  const handleAppointmentCreated = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: appointmentKeys.all });
  }, [queryClient]);

  // Day view data
  const dayViewAppointments = useMemo(() => {
    return appointments.map((appt) => ({
      id: appt.id,
      patientName: `${appt.patient.first_name} ${appt.patient.last_name}`,
      startTime: appt.start_time,
      endTime: appt.end_time,
      date: appt.date,
      status: appt.status,
      appointmentType: appt.appointment_type || undefined,
      format: appt.format,
      isRecurring: !!appt.recurring_group_id,
    }));
  }, [appointments]);

  // Month view data
  const monthViewAppointments = useMemo(() => {
    return appointments.map((appt) => ({
      id: appt.id,
      date: appt.date,
      status: appt.status,
    }));
  }, [appointments]);

  // Title based on view mode
  const headerTitle = useMemo(() => {
    switch (viewMode) {
      case "day":
        return format(currentDate, "EEEE, MMMM d, yyyy");
      case "week":
        const weekStart = startOfWeek(currentDate);
        const weekEnd = endOfWeek(currentDate);
        return `${format(weekStart, "MMM d")} - ${format(weekEnd, "MMM d, yyyy")}`;
      case "month":
        return format(currentDate, "MMMM yyyy");
    }
  }, [viewMode, currentDate]);

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <header className="border-border/40 flex items-center justify-between border-b bg-white/80 px-6 py-4 backdrop-blur-sm">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-light">Schedule</h1>
          <Button variant="outline-white" size="sm" onClick={handleToday}>
            Today
          </Button>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" onClick={handlePrevious}>
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" onClick={handleNext}>
              <ChevronRight className="h-5 w-5" />
            </Button>
          </div>
          <span className="text-lg font-medium">{headerTitle}</span>
        </div>

        <div className="flex items-center gap-3">
          {/* View toggle */}
          <div className="bg-muted flex rounded-lg p-1">
            <Button
              variant="ghost"
              size="sm"
              className={cn(
                "rounded-md px-3",
                viewMode === "day" && "bg-background shadow-sm"
              )}
              onClick={() => setViewMode("day")}
            >
              <List className="mr-1.5 h-4 w-4" />
              Day
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className={cn(
                "rounded-md px-3",
                viewMode === "week" && "bg-background shadow-sm"
              )}
              onClick={() => setViewMode("week")}
            >
              <CalendarDays className="mr-1.5 h-4 w-4" />
              Week
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className={cn(
                "rounded-md px-3",
                viewMode === "month" && "bg-background shadow-sm"
              )}
              onClick={() => setViewMode("month")}
            >
              <LayoutGrid className="mr-1.5 h-4 w-4" />
              Month
            </Button>
          </div>

          {/* Weekend toggle (week view only) */}
          {viewMode === "week" && (
            <Button
              variant="outline-white"
              size="sm"
              onClick={() => setShowWeekends(!showWeekends)}
            >
              {showWeekends ? "Hide" : "Show"} Weekends
            </Button>
          )}

          {/* New appointment button */}
          <Button onClick={handleNewAppointment}>
            <Plus className="mr-2 h-4 w-4" />
            New Appointment
          </Button>
        </div>
      </header>

      {/* Calendar view */}
      <main className="flex-1 overflow-hidden p-6">
        {isLoading ? (
          <div className="flex h-full items-center justify-center">
            <div className="text-muted-foreground">Loading appointments...</div>
          </div>
        ) : (
          <>
            {viewMode === "day" && (
              <CalendarDayView
                date={currentDate}
                appointments={dayViewAppointments}
                onAppointmentClick={handleDayAppointmentClick}
                onTimeSlotClick={handleTimeSlotClick}
                selectedAppointmentId={selectedAppointment?.id}
                currentTime={demoToday}
                className="h-full"
              />
            )}

            {viewMode === "week" && (
              <CalendarWeekView
                weekDays={weekDays}
                events={calendarEvents}
                startHour={8}
                endHour={18}
                onEventClick={handleEventClick}
                selectedEventId={selectedAppointment?.id}
                className="h-full"
              />
            )}

            {viewMode === "month" && (
              <CalendarMonthView
                date={currentDate}
                appointments={monthViewAppointments}
                onDayClick={handleDayClick}
                selectedDate={currentDate}
                className="h-full"
              />
            )}
          </>
        )}
      </main>

      {/* Appointment creation modal */}
      <AppointmentModal
        open={appointmentModalOpen}
        onOpenChange={setAppointmentModalOpen}
        defaultDate={defaultModalDate}
        defaultTime={defaultModalTime}
        onSuccess={handleAppointmentCreated}
      />

      {/* Appointment detail panel */}
      <AppointmentDetailPanel
        appointment={selectedAppointment}
        open={detailPanelOpen}
        onOpenChange={setDetailPanelOpen}
        onReschedule={(appt) => {
          setDefaultModalDate(appt.date);
          setDefaultModalTime(appt.start_time.slice(0, 5));
          setAppointmentModalOpen(true);
          setDetailPanelOpen(false);
        }}
      />
    </div>
  );
}
