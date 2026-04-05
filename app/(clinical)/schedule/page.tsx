"use client";

import * as React from "react";
import { useState, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  format,
  addDays,
  addWeeks,
  addMonths,
  subDays,
  subWeeks,
  subMonths,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
} from "date-fns";
import { ChevronLeft, ChevronRight, Plus, Calendar, CalendarDays, Grid3X3 } from "lucide-react";
import { Button } from "@/design-system/components/ui/button";
import { ToggleGroup, ToggleGroupItem } from "@/design-system/components/ui/toggle-group";
import { Switch } from "@/design-system/components/ui/switch";
import { Label } from "@/design-system/components/ui/label";
import {
  AppointmentModal,
  AppointmentDetailPanel,
  CalendarDayView,
  CalendarWeekView,
  CalendarMonthView,
} from "@/src/components/schedule";
import { appointmentKeys } from "@/src/lib/queries/keys";
import { type AppointmentStatus } from "@/src/lib/supabase/scheduling-types";

type ViewMode = "day" | "week" | "month";

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

export default function SchedulePage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<ViewMode>("week");
  const [showWeekends, setShowWeekends] = useState(true);
  const [appointmentModalOpen, setAppointmentModalOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [detailPanelOpen, setDetailPanelOpen] = useState(false);
  const [newAppointmentDate, setNewAppointmentDate] = useState<Date | undefined>();
  const [newAppointmentTime, setNewAppointmentTime] = useState<string | undefined>();

  const getDateRange = useCallback(() => {
    switch (viewMode) {
      case "day":
        return { startDate: currentDate, endDate: currentDate };
      case "week":
        return { startDate: startOfWeek(currentDate), endDate: endOfWeek(currentDate) };
      case "month":
        return { startDate: startOfMonth(currentDate), endDate: endOfMonth(currentDate) };
    }
  }, [currentDate, viewMode]);

  const { startDate, endDate } = getDateRange();

  const { data: appointmentsData, refetch } = useQuery({
    queryKey: appointmentKeys.list({
      startDate: format(startDate, "yyyy-MM-dd"),
      endDate: format(endDate, "yyyy-MM-dd"),
    }),
    queryFn: async () => {
      const params = new URLSearchParams({
        startDate: format(startDate, "yyyy-MM-dd"),
        endDate: format(endDate, "yyyy-MM-dd"),
      });
      const response = await fetch(`/api/appointments?${params}`);
      if (!response.ok) throw new Error("Failed to fetch appointments");
      const data = await response.json();
      return data.appointments as Appointment[];
    },
  });

  const appointments = appointmentsData || [];

  const goToToday = () => setCurrentDate(new Date());
  const goToPrevious = () => {
    switch (viewMode) {
      case "day":
        setCurrentDate(subDays(currentDate, 1));
        break;
      case "week":
        setCurrentDate(subWeeks(currentDate, 1));
        break;
      case "month":
        setCurrentDate(subMonths(currentDate, 1));
        break;
    }
  };
  const goToNext = () => {
    switch (viewMode) {
      case "day":
        setCurrentDate(addDays(currentDate, 1));
        break;
      case "week":
        setCurrentDate(addWeeks(currentDate, 1));
        break;
      case "month":
        setCurrentDate(addMonths(currentDate, 1));
        break;
    }
  };

  const getDateDisplay = () => {
    switch (viewMode) {
      case "day":
        return format(currentDate, "EEEE, MMMM d, yyyy");
      case "week":
        return `${format(startOfWeek(currentDate), "MMM d")} - ${format(endOfWeek(currentDate), "MMM d, yyyy")}`;
      case "month":
        return format(currentDate, "MMMM yyyy");
    }
  };

  const handleAppointmentClick = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setDetailPanelOpen(true);
  };

  const handleTimeSlotClick = (date: Date, time: string) => {
    setNewAppointmentDate(date);
    setNewAppointmentTime(time);
    setAppointmentModalOpen(true);
  };

  const handleDayClick = (date: Date) => {
    setCurrentDate(date);
    setViewMode("day");
  };

  return (
    <div className="bg-background flex h-full flex-col">
      <div className="border-b px-4 py-3">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={goToToday} className="min-h-[44px]">
              Today
            </Button>
            <div className="flex items-center">
              <Button
                variant="ghost"
                size="icon"
                onClick={goToPrevious}
                className="min-h-[44px] min-w-[44px]"
                aria-label={`Previous ${viewMode}`}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={goToNext}
                className="min-h-[44px] min-w-[44px]"
                aria-label={`Next ${viewMode}`}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
            <h1 className="text-lg font-semibold">{getDateDisplay()}</h1>
          </div>

          <ToggleGroup
            type="single"
            value={viewMode}
            onValueChange={(v) => v && setViewMode(v as ViewMode)}
          >
            <ToggleGroupItem value="day" aria-label="Day view" className="min-h-[44px]">
              <Calendar className="mr-2 h-4 w-4" />
              Day
            </ToggleGroupItem>
            <ToggleGroupItem value="week" aria-label="Week view" className="min-h-[44px]">
              <CalendarDays className="mr-2 h-4 w-4" />
              Week
            </ToggleGroupItem>
            <ToggleGroupItem value="month" aria-label="Month view" className="min-h-[44px]">
              <Grid3X3 className="mr-2 h-4 w-4" />
              Month
            </ToggleGroupItem>
          </ToggleGroup>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Switch id="show-weekends" checked={showWeekends} onCheckedChange={setShowWeekends} />
              <Label htmlFor="show-weekends" className="text-sm">
                Weekends
              </Label>
            </div>
            <Button onClick={() => setAppointmentModalOpen(true)} className="min-h-[44px]">
              <Plus className="mr-2 h-4 w-4" />
              New Appointment
            </Button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-hidden p-4">
        {viewMode === "day" && (
          <CalendarDayView
            date={currentDate}
            appointments={appointments}
            onAppointmentClick={handleAppointmentClick}
            onTimeSlotClick={handleTimeSlotClick}
          />
        )}
        {viewMode === "week" && (
          <CalendarWeekView
            currentDate={currentDate}
            appointments={appointments.map((apt) => ({
              ...apt,
              patient_name: apt.patient
                ? `${apt.patient.first_name} ${apt.patient.last_name}`
                : "Unknown",
            }))}
            onAppointmentClick={(apt) =>
              handleAppointmentClick(
                appointments.find((a) => a.id === apt.id) || (apt as unknown as Appointment)
              )
            }
            onTimeSlotClick={handleTimeSlotClick}
            showWeekends={showWeekends}
          />
        )}
        {viewMode === "month" && (
          <CalendarMonthView
            date={currentDate}
            appointments={appointments}
            onDayClick={handleDayClick}
            showWeekends={showWeekends}
          />
        )}
      </div>

      <AppointmentModal
        open={appointmentModalOpen}
        onOpenChange={setAppointmentModalOpen}
        initialDate={newAppointmentDate}
        initialTime={newAppointmentTime}
        onSuccess={() => refetch()}
      />
      <AppointmentDetailPanel
        appointment={selectedAppointment}
        open={detailPanelOpen}
        onOpenChange={setDetailPanelOpen}
        onStatusChange={() => refetch()}
      />
    </div>
  );
}
