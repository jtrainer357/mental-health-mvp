"use client";

import * as React from "react";
import dynamic from "next/dynamic";
import { CardWrapper } from "@/design-system/components/ui/card-wrapper";
import { CalendarHeader, CalendarViewType } from "@/design-system/components/ui/calendar-header";
import type { CalendarEvent } from "@/design-system/components/ui/calendar-week-view";
import type { DayEvent } from "@/design-system/components/ui/calendar-day-view";
import { CalendarDateStrip } from "@/design-system/components/ui/calendar-date-strip";
import { FilterTabs } from "@/design-system/components/ui/filter-tabs";
import { Button } from "@/design-system/components/ui/button";
import { Text } from "@/design-system/components/ui/typography";
import { PageShell } from "../_components/shared/page-shell";
import { Plus, CalendarX, X, Repeat } from "lucide-react";
import { Skeleton } from "@/design-system/components/ui/skeleton";
import { Heading } from "@/design-system/components/ui/typography";
import { ErrorState } from "../_components/shared/error-state";
import { EmptyState } from "../_components/shared/empty-state";
import { VisitPrepPanel } from "../_components/visit-prep-panel";
import { RecurringSeriesPanel } from "../_components/recurring-series-panel";
import { Badge } from "@/design-system/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/design-system/components/ui/avatar";
// AnimatePresence removed — simple conditional render for reliability
import { cn } from "@/design-system/lib/utils";

// Dynamic imports for heavy calendar components - code splitting for better performance
const CalendarWeekView = dynamic(
  () =>
    import("@/design-system/components/ui/calendar-week-view").then((mod) => mod.CalendarWeekView),
  {
    loading: () => <Skeleton className="h-full w-full rounded-lg" />,
    ssr: false,
  }
);

const CalendarDayView = dynamic(
  () =>
    import("@/design-system/components/ui/calendar-day-view").then((mod) => mod.CalendarDayView),
  {
    loading: () => <Skeleton className="h-64 w-full rounded-lg" />,
    ssr: false,
  }
);

import {
  addDays,
  startOfWeek,
  endOfWeek,
  format,
  subWeeks,
  addWeeks,
  isSameDay,
  parseISO,
} from "date-fns";
import {
  getUpcomingAppointments,
  type AppointmentWithPatient,
} from "@/src/lib/queries/appointments";
import { DEMO_DATE_OBJECT } from "@/src/lib/utils/demo-date";
import { createLogger } from "@/src/lib/logger";

const log = createLogger("SchedulePage");

// Patient color palette - muted brand colors, rotated per patient for visual variety
const patientColorPalette: CalendarEvent["color"][] = [
  "teal",
  "rose",
  "sage",
  "lavender",
  "green",
  "yellow",
  "neutral",
  "blue",
];

// Deterministic hash from patient name to palette index
function getPatientColorIndex(patientName: string): number {
  let hash = 0;
  for (let i = 0; i < patientName.length; i++) {
    hash = (hash * 31 + patientName.charCodeAt(i)) | 0;
  }
  return Math.abs(hash) % patientColorPalette.length;
}

// Color mapping — status overrides take priority, then per-patient color
function getEventColor(
  serviceType: string,
  status: string,
  patientName: string
): CalendarEvent["color"] {
  if (status === "Completed") return "gray";
  if (status === "Cancelled" || status === "No-Show") return "pink";
  if (serviceType.toLowerCase().includes("crisis")) return "red";
  // Regular appointments: color by patient for visual variety
  return patientColorPalette[getPatientColorIndex(patientName)]!;
}

// Convert DB appointment to CalendarEvent
function appointmentToEvent(apt: AppointmentWithPatient): CalendarEvent {
  const [hours, minutes] = apt.start_time.split(":").map(Number);
  const [endHours, endMinutes] = apt.end_time.split(":").map(Number);
  const date = parseISO(apt.date);

  const startTime = new Date(date);
  startTime.setHours(hours!, minutes!, 0, 0);

  const endTime = new Date(date);
  endTime.setHours(endHours!, endMinutes!, 0, 0);

  // Prefix cancelled appointments for visibility
  const isCancelled = apt.status === "Cancelled";
  const title = isCancelled
    ? `CANCELLED — ${apt.patient.first_name} ${apt.patient.last_name}`
    : `${apt.patient.first_name} ${apt.patient.last_name} - ${apt.service_type}`;

  return {
    id: apt.id,
    title,
    startTime,
    endTime,
    color: getEventColor(
      apt.service_type,
      apt.status,
      `${apt.patient.first_name} ${apt.patient.last_name}`
    ),
    hasNotification: apt.patient.risk_level === "high",
  };
}

const filterTabs = [
  { id: "all", label: "All Appointments" },
  { id: "scheduled", label: "Scheduled" },
  { id: "completed", label: "Completed" },
];

export default function SchedulePage() {
  // Use demo date as starting point
  const [currentDate, setCurrentDate] = React.useState(DEMO_DATE_OBJECT);
  const [selectedDate, setSelectedDate] = React.useState(DEMO_DATE_OBJECT);
  const [viewType, setViewType] = React.useState<CalendarViewType>("week");
  const [activeFilter, setActiveFilter] = React.useState("all");
  const [completedEvents, setCompletedEvents] = React.useState<Set<string>>(new Set());
  const [appointments, setAppointments] = React.useState<AppointmentWithPatient[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  // Selected event + detail panel
  const [selectedEventId, setSelectedEventId] = React.useState<string | null>(null);
  const [seriesOpen, setSeriesOpen] = React.useState(false);

  // Find the selected appointment for the detail panel
  const selectedAppointment = React.useMemo(() => {
    if (!selectedEventId) return null;
    return appointments.find((apt) => apt.id === selectedEventId) || null;
  }, [selectedEventId, appointments]);

  // Reset series panel when selection changes
  React.useEffect(() => {
    setSeriesOpen(false);
  }, [selectedEventId]);

  // Load appointments from Supabase
  const loadAppointments = React.useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      // Fetch 4 weeks of appointments (all statuses for filter tabs to work)
      const data = await getUpcomingAppointments(undefined, 28, "all");
      setAppointments(data);
    } catch (err) {
      log.error("Failed to load appointments", err);
      setError("Unable to load schedule. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    loadAppointments();
  }, [loadAppointments]);

  // Listen for voice commands to move appointments
  React.useEffect(() => {
    const handleVoiceMoveAppointment = (event: Event) => {
      const detail = (event as CustomEvent).detail as {
        appointmentId: string;
        newTime: { hours: number; minutes: number };
      };

      // If no specific appointment ID, use the selected one
      const targetId = detail.appointmentId || selectedEventId;

      if (!targetId) {
        log.warn("No appointment selected for voice move command");
        return;
      }

      // TODO: Implement voice-based appointment rescheduling via API
      log.info("Voice move command received", { targetId, newTime: detail.newTime });
    };

    window.addEventListener("voice-move-appointment", handleVoiceMoveAppointment);
    return () => {
      window.removeEventListener("voice-move-appointment", handleVoiceMoveAppointment);
    };
  }, [selectedEventId]);

  // Calculate week days
  const weekStart = React.useMemo(
    () => startOfWeek(currentDate, { weekStartsOn: 1 }),
    [currentDate]
  );
  const weekEnd = endOfWeek(currentDate, { weekStartsOn: 1 });
  const weekDays = React.useMemo(() => {
    const days: Date[] = [];
    for (let i = 0; i < 7; i++) {
      days.push(addDays(weekStart, i));
    }
    return days;
  }, [weekStart]);

  // Convert appointments to calendar events - NO DEMO EVENTS, only Supabase data
  const events: CalendarEvent[] = React.useMemo(() => {
    return appointments
      .filter((apt) => {
        if (activeFilter === "scheduled") return apt.status === "Scheduled";
        if (activeFilter === "completed") return apt.status === "Completed";
        return true;
      })
      .map(appointmentToEvent);
  }, [appointments, activeFilter]);

  const dateRange = `${format(weekStart, "MMM d, yyyy")} - ${format(weekEnd, "MMM d, yyyy")}`;

  const handlePrevious = () => {
    setCurrentDate((prev) => subWeeks(prev, 1));
  };

  const handleNext = () => {
    setCurrentDate((prev) => addWeeks(prev, 1));
  };

  const handleToday = () => {
    setCurrentDate(DEMO_DATE_OBJECT);
    setSelectedDate(DEMO_DATE_OBJECT);
  };

  const handleEventToggle = (eventId: string, completed: boolean) => {
    setCompletedEvents((prev) => {
      const next = new Set(prev);
      if (completed) {
        next.add(eventId);
      } else {
        next.delete(eventId);
      }
      return next;
    });
  };

  // Convert events to DayEvent format for day view
  const dayEvents: DayEvent[] = events
    .filter((e) => isSameDay(e.startTime, selectedDate))
    .map((e) => ({
      ...e,
      completed: completedEvents.has(e.id),
    }));

  return (
    <PageShell activePage="schedule" className="mx-auto flex max-w-[1600px] flex-col">
      {/* Desktop: Filter tabs and Add Appointment button */}
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <FilterTabs
          tabs={filterTabs}
          activeTab={activeFilter}
          onTabChange={setActiveFilter}
          className="overflow-x-auto"
        />
        <Button className="w-full shrink-0 gap-2 sm:w-auto">
          <Plus className="h-4 w-4" />
          New Appointment
        </Button>
      </div>

      {/* Calendar Card */}
      <CardWrapper className="flex flex-1 flex-col p-4 sm:p-6">
        {/* Loading State with Skeleton */}
        {loading && (
          <div className="flex h-full flex-col">
            {/* Header skeleton */}
            <div className="mb-6 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Skeleton className="h-9 w-9 rounded-full" />
                <Skeleton className="h-6 w-48" />
                <Skeleton className="h-9 w-9 rounded-full" />
              </div>
              <div className="flex gap-2">
                <Skeleton className="h-9 w-20 rounded-full" />
                <Skeleton className="h-9 w-20 rounded-full" />
              </div>
            </div>
            {/* Calendar grid skeleton */}
            <div className="flex-1">
              <div className="mb-2 grid grid-cols-2 gap-1 sm:grid-cols-4 lg:grid-cols-7">
                {Array.from({ length: 7 }).map((_, i) => (
                  <Skeleton key={i} className="h-8" />
                ))}
              </div>
              <div className="grid grid-cols-1 gap-1 sm:grid-cols-2 lg:grid-cols-7">
                {Array.from({ length: 21 }).map((_, i) => (
                  <Skeleton key={i} className="h-16 rounded-lg" />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <ErrorState title="Unable to Load Schedule" message={error} onRetry={loadAppointments} />
        )}

        {/* Empty State */}
        {!loading && !error && events.length === 0 && (
          <EmptyState
            icon={CalendarX}
            title="No Appointments Found"
            message={
              activeFilter !== "all"
                ? `No ${activeFilter} appointments in this time range.`
                : "No appointments scheduled for this week."
            }
            actionLabel={undefined}
            onAction={undefined}
          />
        )}

        {/* Content - Only show when loaded and has data */}
        {!loading && !error && events.length > 0 && (
          <>
            {/* Desktop View */}
            <div className="hidden h-full flex-col lg:flex">
              <CalendarHeader
                currentDate={currentDate}
                dateRange={dateRange}
                viewType={viewType}
                onPrevious={handlePrevious}
                onNext={handleNext}
                onToday={handleToday}
                className="mb-6"
              />

              <CalendarWeekView
                weekDays={weekDays}
                events={events}
                startHour={6}
                endHour={21}
                selectedEventId={selectedEventId}
                onEventClick={(event) => {
                  setSelectedEventId(selectedEventId === event.id ? null : event.id);
                }}
                className="min-h-0 flex-1"
              />
            </div>

            {/* Mobile/Tablet View */}
            <div className="lg:hidden">
              {/* Mobile Header */}
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-semibold">{format(currentDate, "MMMM yyyy")}</h2>
                <Button variant="ghost" size="sm" onClick={handleToday}>
                  Today
                </Button>
              </div>

              {/* Date Strip */}
              <CalendarDateStrip
                dates={weekDays}
                selectedDate={selectedDate}
                onDateSelect={setSelectedDate}
                className="mb-4"
              />

              {/* Day View */}
              <div className="border-border bg-card rounded-lg border p-3">
                <CalendarDayView
                  date={selectedDate}
                  events={dayEvents}
                  onEventToggle={handleEventToggle}
                />
              </div>

              {/* Calendar integrations hidden for testing */}
            </div>
          </>
        )}
      </CardWrapper>

      {/* Appointment detail modal */}
      {selectedAppointment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={() => setSelectedEventId(null)}>
          <div
            className="bg-card relative mx-4 max-h-[85vh] w-full max-w-3xl overflow-y-auto rounded-2xl border shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Patient header */}
            <div className="sticky top-0 z-10 flex items-center justify-between border-b bg-white/95 px-6 py-4 backdrop-blur-sm">
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  {selectedAppointment.patient.avatar_url && (
                    <AvatarImage
                      src={selectedAppointment.patient.avatar_url}
                      alt={`${selectedAppointment.patient.first_name} ${selectedAppointment.patient.last_name}`}
                    />
                  )}
                  <AvatarFallback className="bg-avatar-fallback text-xs text-white">
                    {selectedAppointment.patient.first_name[0]}
                    {selectedAppointment.patient.last_name[0]}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-base font-bold">
                    {selectedAppointment.patient.first_name}{" "}
                    {selectedAppointment.patient.last_name}
                  </h3>
                  <p className="text-muted-foreground text-xs">
                    {selectedAppointment.service_type} ·{" "}
                    {format(parseISO(selectedAppointment.date), "EEE, MMM d")} at{" "}
                    {format(new Date(`2000-01-01T${selectedAppointment.start_time}`), "h:mm a")}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setSeriesOpen((prev) => !prev)}
                  className={cn(
                    "flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold transition-all",
                    seriesOpen
                      ? "border-teal/30 bg-teal/[0.08] text-teal"
                      : "border-border text-foreground/70 hover:border-teal/30 hover:text-teal"
                  )}
                >
                  <Repeat className="h-3.5 w-3.5" />
                  Edit Series
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedEventId(null)}
                  className="text-muted-foreground hover:text-foreground rounded-full p-1.5 transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Prep panel */}
            <VisitPrepPanel
              appointment={selectedAppointment}
              isExpanded={true}
              showEnterVisit={selectedAppointment.status === "Scheduled"}
              visitButtonLabel={
                selectedAppointment.location?.toLowerCase().includes("telehealth")
                  ? "Join Telehealth"
                  : "Start Visit"
              }
              onEnterVisit={() => {
                const name = `${selectedAppointment.patient.first_name} ${selectedAppointment.patient.last_name}`;
                window.location.href = `/home/patients?patientName=${encodeURIComponent(name)}&startSession=true`;
              }}
              skipAnimation
            />

            {/* Recurring series panel */}
            <RecurringSeriesPanel
              appointment={selectedAppointment}
              allAppointments={appointments}
              isOpen={seriesOpen}
              onClose={() => setSeriesOpen(false)}
            />
          </div>
        </div>
      )}

      {/* Mobile FAB */}
      <div className="fixed right-4 bottom-24 z-40 lg:hidden">
        <Button size="icon" className="h-14 w-14 rounded-full shadow-lg">
          <Plus className="h-6 w-6" />
        </Button>
      </div>
    </PageShell>
  );
}
