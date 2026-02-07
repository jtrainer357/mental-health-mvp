"use client";

import * as React from "react";
import { LeftNav } from "../_components/left-nav";
import { HeaderSearch } from "../_components/header-search";
import { AnimatedBackground } from "@/design-system/components/ui/animated-background";
import { CardWrapper } from "@/design-system/components/ui/card-wrapper";
import { CalendarHeader, CalendarViewType } from "@/design-system/components/ui/calendar-header";
import { CalendarWeekView, CalendarEvent } from "@/design-system/components/ui/calendar-week-view";
import { CalendarDayView, DayEvent } from "@/design-system/components/ui/calendar-day-view";
import { CalendarDateStrip } from "@/design-system/components/ui/calendar-date-strip";
import { FilterTabs } from "@/design-system/components/ui/filter-tabs";
import { PageTransition } from "@/design-system/components/ui/page-transition";
import { Button } from "@/design-system/components/ui/button";
import { Text } from "@/design-system/components/ui/typography";
import { Plus, Calendar, Trash2, AlertTriangle, RefreshCw, CalendarX } from "lucide-react";
import { Skeleton } from "@/design-system/components/ui/skeleton";
import { Heading } from "@/design-system/components/ui/typography";
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
import { useUpcomingAppointments, type AppointmentWithPatient } from "@/src/lib/queries";
import { DEMO_DATE_OBJECT } from "@/src/lib/utils/demo-date";
// Voice command integration uses custom events instead of store

// Color mapping based on appointment type
function getEventColor(serviceType: string, status: string): CalendarEvent["color"] {
  if (status === "Completed") return "gray";
  if (status === "Cancelled" || status === "No-Show") return "pink";
  if (serviceType.toLowerCase().includes("initial") || serviceType.toLowerCase().includes("intake"))
    return "green";
  if (serviceType.toLowerCase().includes("crisis")) return "pink";
  return "blue";
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

  return {
    id: apt.id,
    title: `${apt.patient.first_name} ${apt.patient.last_name} - ${apt.service_type}`,
    startTime,
    endTime,
    color: getEventColor(apt.service_type, apt.status),
    hasNotification: apt.patient.risk_level === "high",
  };
}

// Helper to create a date at a specific time
function createDateTime(baseDate: Date, dayOffset: number, hour: number, minute: number = 0): Date {
  const date = addDays(baseDate, dayOffset);
  const result = new Date(date);
  result.setHours(hour, minute, 0, 0);
  return result;
}

// Generate hardcoded demo events for a realistic-looking calendar
function generateDemoEvents(weekStart: Date): CalendarEvent[] {
  const demoEvents: CalendarEvent[] = [];

  // Patient names for demo - diverse and realistic with varied colors
  const patients = [
    { name: "Marcus Johnson", type: "Follow-up Session", color: "blue" as const },
    { name: "Sarah Chen", type: "Initial Assessment", color: "green" as const },
    { name: "Emily Rodriguez", type: "Therapy Session", color: "yellow" as const },
    { name: "David Kim", type: "Crisis Follow-up", color: "pink" as const },
    { name: "Amanda Foster", type: "CBT Session", color: "blue" as const },
    { name: "James Wilson", type: "Medication Review", color: "yellow" as const },
    { name: "Lisa Thompson", type: "Couples Therapy", color: "neutral" as const },
    { name: "Michael Brown", type: "Intake Evaluation", color: "green" as const },
    { name: "Jennifer Davis", type: "EMDR Session", color: "blue" as const },
    { name: "Robert Garcia", type: "Group Prep", color: "yellow" as const },
    { name: "Michelle Lee", type: "Family Session", color: "neutral" as const },
    { name: "Christopher Martinez", type: "Follow-up Session", color: "blue" as const },
    { name: "Ashley Williams", type: "DBT Session", color: "yellow" as const },
    { name: "Daniel Anderson", type: "Initial Consult", color: "green" as const },
    { name: "Jessica Taylor", type: "Progress Review", color: "neutral" as const },
    { name: "Matthew Jackson", type: "Therapy Session", color: "blue" as const },
    { name: "Rachel White", type: "Crisis Session", color: "pink" as const, hasNotification: true },
    { name: "Kevin Harris", type: "Anxiety Treatment", color: "yellow" as const },
    { name: "Stephanie Clark", type: "Depression Follow-up", color: "blue" as const },
    { name: "Andrew Lewis", type: "Trauma Processing", color: "green" as const },
  ];

  // Monday (day 0) - Full day
  demoEvents.push(
    {
      id: "demo-mon-1",
      title: `${patients[0]!.name} - ${patients[0]!.type}`,
      startTime: createDateTime(weekStart, 0, 7, 0),
      endTime: createDateTime(weekStart, 0, 8, 0),
      color: patients[0]!.color,
    },
    {
      id: "demo-mon-2",
      title: `${patients[1]!.name} - ${patients[1]!.type}`,
      startTime: createDateTime(weekStart, 0, 8, 30),
      endTime: createDateTime(weekStart, 0, 9, 30),
      color: patients[1]!.color,
    },
    {
      id: "demo-mon-3",
      title: `${patients[2]!.name} - ${patients[2]!.type}`,
      startTime: createDateTime(weekStart, 0, 10, 0),
      endTime: createDateTime(weekStart, 0, 11, 0),
      color: patients[2]!.color,
    },
    {
      id: "demo-mon-block-1",
      title: "Chart Notes & Documentation",
      startTime: createDateTime(weekStart, 0, 11, 0),
      endTime: createDateTime(weekStart, 0, 12, 0),
      color: "gray" as const,
    },
    {
      id: "demo-mon-4",
      title: `${patients[3]!.name} - ${patients[3]!.type}`,
      startTime: createDateTime(weekStart, 0, 13, 0),
      endTime: createDateTime(weekStart, 0, 14, 0),
      color: patients[3]!.color,
      hasNotification: true,
    },
    {
      id: "demo-mon-5",
      title: `${patients[4]!.name} - ${patients[4]!.type}`,
      startTime: createDateTime(weekStart, 0, 14, 30),
      endTime: createDateTime(weekStart, 0, 15, 30),
      color: patients[4]!.color,
    },
    {
      id: "demo-mon-6",
      title: `${patients[5]!.name} - ${patients[5]!.type}`,
      startTime: createDateTime(weekStart, 0, 16, 0),
      endTime: createDateTime(weekStart, 0, 16, 30),
      color: patients[5]!.color,
    },
    {
      id: "demo-mon-7",
      title: `${patients[6]!.name} - ${patients[6]!.type}`,
      startTime: createDateTime(weekStart, 0, 17, 0),
      endTime: createDateTime(weekStart, 0, 18, 30),
      color: patients[6]!.color,
    }
  );

  // Tuesday (day 1) - Busy morning, lighter afternoon
  demoEvents.push(
    {
      id: "demo-tue-1",
      title: `${patients[7]!.name} - ${patients[7]!.type}`,
      startTime: createDateTime(weekStart, 1, 6, 30),
      endTime: createDateTime(weekStart, 1, 8, 0),
      color: patients[7]!.color,
    },
    {
      id: "demo-tue-2",
      title: `${patients[8]!.name} - ${patients[8]!.type}`,
      startTime: createDateTime(weekStart, 1, 8, 30),
      endTime: createDateTime(weekStart, 1, 9, 30),
      color: patients[8]!.color,
    },
    {
      id: "demo-tue-3",
      title: `${patients[9]!.name} - ${patients[9]!.type}`,
      startTime: createDateTime(weekStart, 1, 10, 0),
      endTime: createDateTime(weekStart, 1, 11, 0),
      color: patients[9]!.color,
    },
    {
      id: "demo-tue-block-1",
      title: "Staff Meeting",
      startTime: createDateTime(weekStart, 1, 11, 30),
      endTime: createDateTime(weekStart, 1, 12, 30),
      color: "gray" as const,
    },
    {
      id: "demo-tue-4",
      title: `${patients[10]!.name} - ${patients[10]!.type}`,
      startTime: createDateTime(weekStart, 1, 13, 30),
      endTime: createDateTime(weekStart, 1, 15, 0),
      color: patients[10]!.color,
    },
    {
      id: "demo-tue-block-2",
      title: "Peer Supervision",
      startTime: createDateTime(weekStart, 1, 15, 30),
      endTime: createDateTime(weekStart, 1, 17, 0),
      color: "gray" as const,
    },
    {
      id: "demo-tue-5",
      title: `${patients[11]!.name} - ${patients[11]!.type}`,
      startTime: createDateTime(weekStart, 1, 17, 30),
      endTime: createDateTime(weekStart, 1, 18, 30),
      color: patients[11]!.color,
    },
    {
      id: "demo-tue-6",
      title: `${patients[12]!.name} - ${patients[12]!.type}`,
      startTime: createDateTime(weekStart, 1, 19, 0),
      endTime: createDateTime(weekStart, 1, 20, 0),
      color: patients[12]!.color,
    }
  );

  // Wednesday (day 2) - Mixed day
  demoEvents.push(
    {
      id: "demo-wed-block-1",
      title: "Morning Admin Block",
      startTime: createDateTime(weekStart, 2, 6, 0),
      endTime: createDateTime(weekStart, 2, 7, 30),
      color: "gray" as const,
    },
    {
      id: "demo-wed-1",
      title: `${patients[13]!.name} - ${patients[13]!.type}`,
      startTime: createDateTime(weekStart, 2, 8, 0),
      endTime: createDateTime(weekStart, 2, 9, 0),
      color: patients[13]!.color,
    },
    {
      id: "demo-wed-2",
      title: `${patients[14]!.name} - ${patients[14]!.type}`,
      startTime: createDateTime(weekStart, 2, 9, 30),
      endTime: createDateTime(weekStart, 2, 10, 30),
      color: patients[14]!.color,
    },
    {
      id: "demo-wed-3",
      title: `${patients[15]!.name} - ${patients[15]!.type}`,
      startTime: createDateTime(weekStart, 2, 11, 0),
      endTime: createDateTime(weekStart, 2, 12, 0),
      color: patients[15]!.color,
    },
    {
      id: "demo-wed-4",
      title: `${patients[16]!.name} - ${patients[16]!.type}`,
      startTime: createDateTime(weekStart, 2, 13, 0),
      endTime: createDateTime(weekStart, 2, 14, 0),
      color: patients[16]!.color,
      hasNotification: true,
    },
    {
      id: "demo-wed-5",
      title: `${patients[17]!.name} - ${patients[17]!.type}`,
      startTime: createDateTime(weekStart, 2, 14, 30),
      endTime: createDateTime(weekStart, 2, 15, 30),
      color: patients[17]!.color,
    },
    {
      id: "demo-wed-6",
      title: `${patients[18]!.name} - ${patients[18]!.type}`,
      startTime: createDateTime(weekStart, 2, 16, 0),
      endTime: createDateTime(weekStart, 2, 17, 0),
      color: patients[18]!.color,
    },
    {
      id: "demo-wed-block-2",
      title: "Treatment Planning",
      startTime: createDateTime(weekStart, 2, 17, 30),
      endTime: createDateTime(weekStart, 2, 19, 0),
      color: "gray" as const,
    },
    {
      id: "demo-wed-7",
      title: `${patients[19]!.name} - ${patients[19]!.type}`,
      startTime: createDateTime(weekStart, 2, 19, 30),
      endTime: createDateTime(weekStart, 2, 20, 30),
      color: patients[19]!.color,
    }
  );

  // Thursday (day 3) - Heavy day
  demoEvents.push(
    {
      id: "demo-thu-1",
      title: `${patients[0]!.name} - ${patients[0]!.type}`,
      startTime: createDateTime(weekStart, 3, 7, 0),
      endTime: createDateTime(weekStart, 3, 8, 0),
      color: patients[0]!.color,
    },
    {
      id: "demo-thu-2",
      title: `${patients[2]!.name} - ${patients[2]!.type}`,
      startTime: createDateTime(weekStart, 3, 8, 30),
      endTime: createDateTime(weekStart, 3, 9, 30),
      color: patients[2]!.color,
    },
    {
      id: "demo-thu-3",
      title: `${patients[4]!.name} - ${patients[4]!.type}`,
      startTime: createDateTime(weekStart, 3, 10, 0),
      endTime: createDateTime(weekStart, 3, 11, 0),
      color: patients[4]!.color,
    },
    {
      id: "demo-thu-4",
      title: `${patients[6]!.name} - ${patients[6]!.type}`,
      startTime: createDateTime(weekStart, 3, 11, 30),
      endTime: createDateTime(weekStart, 3, 13, 0),
      color: patients[6]!.color,
    },
    {
      id: "demo-thu-5",
      title: `${patients[8]!.name} - ${patients[8]!.type}`,
      startTime: createDateTime(weekStart, 3, 13, 30),
      endTime: createDateTime(weekStart, 3, 14, 30),
      color: patients[8]!.color,
    },
    {
      id: "demo-thu-6",
      title: `${patients[10]!.name} - ${patients[10]!.type}`,
      startTime: createDateTime(weekStart, 3, 15, 0),
      endTime: createDateTime(weekStart, 3, 16, 30),
      color: patients[10]!.color,
    },
    {
      id: "demo-thu-block-1",
      title: "Consultation Call",
      startTime: createDateTime(weekStart, 3, 17, 0),
      endTime: createDateTime(weekStart, 3, 17, 30),
      color: "gray" as const,
    },
    {
      id: "demo-thu-7",
      title: `${patients[12]!.name} - ${patients[12]!.type}`,
      startTime: createDateTime(weekStart, 3, 18, 0),
      endTime: createDateTime(weekStart, 3, 19, 0),
      color: patients[12]!.color,
    },
    {
      id: "demo-thu-8",
      title: `${patients[14]!.name} - ${patients[14]!.type}`,
      startTime: createDateTime(weekStart, 3, 19, 30),
      endTime: createDateTime(weekStart, 3, 20, 30),
      color: patients[14]!.color,
    }
  );

  // Friday (day 4) - Demo day (Feb 6, 2026)
  // NOTE: Most Friday appointments come from the database - only add non-patient blocks here
  // to avoid duplicates with DB data

  // Saturday (day 5) - Lighter weekend hours
  demoEvents.push(
    {
      id: "demo-sat-1",
      title: `${patients[15]!.name} - ${patients[15]!.type}`,
      startTime: createDateTime(weekStart, 5, 9, 0),
      endTime: createDateTime(weekStart, 5, 10, 0),
      color: patients[15]!.color,
    },
    {
      id: "demo-sat-2",
      title: `${patients[17]!.name} - ${patients[17]!.type}`,
      startTime: createDateTime(weekStart, 5, 10, 30),
      endTime: createDateTime(weekStart, 5, 11, 30),
      color: patients[17]!.color,
    },
    {
      id: "demo-sat-3",
      title: `${patients[19]!.name} - ${patients[19]!.type}`,
      startTime: createDateTime(weekStart, 5, 12, 0),
      endTime: createDateTime(weekStart, 5, 13, 0),
      color: patients[19]!.color,
    }
  );

  // Sunday (day 6) - Emergency/on-call only with a few appointments
  demoEvents.push(
    {
      id: "demo-sun-block-1",
      title: "On-Call Coverage",
      startTime: createDateTime(weekStart, 6, 8, 0),
      endTime: createDateTime(weekStart, 6, 12, 0),
      color: "neutral" as const,
    },
    {
      id: "demo-sun-1",
      title: `${patients[0]!.name} - Individual Session`,
      startTime: createDateTime(weekStart, 6, 10, 30),
      endTime: createDateTime(weekStart, 6, 11, 30),
      color: "yellow" as const,
    }
  );

  return demoEvents;
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

  // Use React Query for appointments
  const {
    data: appointments = [],
    isLoading: loading,
    error: queryError,
    refetch: loadAppointments,
  } = useUpcomingAppointments(undefined, 14, "all");

  const error = queryError ? "Unable to load schedule. Please try again." : null;

  // Voice command integration
  const [selectedEventId, setSelectedEventId] = React.useState<string | null>(null);
  const [_movedEventId, setMovedEventId] = React.useState<string | null>(null);
  const [localDemoEvents, setLocalDemoEvents] = React.useState<CalendarEvent[]>([]);

  // Note: selectedEventId is used by the voice-move-appointment event listener below

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
        console.warn("No appointment selected for voice move command");
        return;
      }

      // Update the local demo events to move the appointment
      setLocalDemoEvents((prev) => {
        const updatedEvents = prev.map((evt) => {
          if (evt.id === targetId) {
            const newStartTime = new Date(evt.startTime);
            const duration = evt.endTime.getTime() - evt.startTime.getTime();
            newStartTime.setHours(detail.newTime.hours, detail.newTime.minutes, 0, 0);
            const newEndTime = new Date(newStartTime.getTime() + duration);

            return {
              ...evt,
              startTime: newStartTime,
              endTime: newEndTime,
              justMoved: true,
            };
          }
          return evt;
        });
        return updatedEvents;
      });

      // Mark the event as just moved for animation
      setMovedEventId(targetId);

      // Clear the justMoved flag after animation completes
      setTimeout(() => {
        setMovedEventId(null);
        setLocalDemoEvents((prev) => prev.map((evt) => ({ ...evt, justMoved: false })));
      }, 1000);
    };

    window.addEventListener("voice-move-appointment", handleVoiceMoveAppointment);
    return () => {
      window.removeEventListener("voice-move-appointment", handleVoiceMoveAppointment);
    };
  }, [selectedEventId]);

  // Calculate week days - memoize weekStart to prevent infinite loops
  const weekStartTime = React.useMemo(
    () => startOfWeek(currentDate, { weekStartsOn: 1 }).getTime(),
    [currentDate]
  );
  const weekStart = React.useMemo(() => new Date(weekStartTime), [weekStartTime]);
  const weekEnd = endOfWeek(currentDate, { weekStartsOn: 1 });
  const weekDays = React.useMemo(() => {
    const days: Date[] = [];
    for (let i = 0; i < 7; i++) {
      days.push(addDays(weekStart, i));
    }
    return days;
  }, [weekStart]);

  // Generate demo events for the current week
  const baseDemoEvents = React.useMemo(() => generateDemoEvents(weekStart), [weekStart]);

  // Initialize local demo events when base events change
  React.useEffect(() => {
    setLocalDemoEvents(baseDemoEvents);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- baseDemoEvents is derived from weekStart, using weekStartTime to avoid re-renders
  }, [weekStartTime]);

  // Use local demo events (which can be modified by voice commands) or fall back to base
  const demoEvents = localDemoEvents.length > 0 ? localDemoEvents : baseDemoEvents;

  // Convert appointments to calendar events and merge with demo events
  const events: CalendarEvent[] = React.useMemo(() => {
    const dbEvents = appointments
      .filter((apt) => {
        if (activeFilter === "scheduled") return apt.status === "Scheduled";
        if (activeFilter === "completed") return apt.status === "Completed";
        return true;
      })
      .map(appointmentToEvent);

    // For demo purposes, always include demo events when filter is "all" or "scheduled"
    if (activeFilter === "completed") {
      return dbEvents;
    }

    // Merge DB events with demo events, demo events fill in the gaps
    return [...dbEvents, ...demoEvents];
  }, [appointments, activeFilter, demoEvents]);

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
    <div className="min-h-screen pb-24 lg:pb-0">
      <AnimatedBackground />

      {/* Left Nav */}
      <LeftNav activePage="schedule" />

      {/* Main Content Wrapper */}
      <div className="lg:pl-36">
        <HeaderSearch />

        <main
          id="main-content"
          role="main"
          aria-label="Schedule content"
          className="px-4 py-4 sm:px-6 sm:py-6 md:py-8"
        >
          <PageTransition>
            <div className="mx-auto flex max-w-[1600px] flex-col overflow-hidden lg:h-[calc(100vh-8.5rem)]">
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
              <CardWrapper className="flex flex-1 flex-col overflow-hidden p-4 sm:p-6">
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
                      {/* Mobile: single column, Desktop: 7 columns */}
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
                  <div className="flex flex-1 flex-col items-center justify-center py-12">
                    <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-100">
                      <AlertTriangle className="h-7 w-7 text-red-600" />
                    </div>
                    <Heading level={4} className="mb-2 text-lg font-semibold">
                      Unable to Load Schedule
                    </Heading>
                    <Text muted className="mb-4 max-w-sm text-center">
                      {error}
                    </Text>
                    <Button onClick={loadAppointments} variant="outline" className="gap-2">
                      <RefreshCw className="h-4 w-4" />
                      Try Again
                    </Button>
                  </div>
                )}

                {/* Empty State - only show if no events at all including demo */}
                {!loading && !error && events.length === 0 && (
                  <div className="flex flex-1 flex-col items-center justify-center py-12">
                    <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-gray-100">
                      <CalendarX className="h-7 w-7 text-gray-400" />
                    </div>
                    <Heading level={4} className="mb-2 text-lg font-semibold">
                      No Appointments Found
                    </Heading>
                    <Text muted className="mb-4 max-w-sm text-center">
                      {activeFilter !== "all"
                        ? `No ${activeFilter} appointments in this time range.`
                        : "No appointments scheduled for this week."}
                    </Text>
                    <Button className="gap-2">
                      <Plus className="h-4 w-4" />
                      Schedule Appointment
                    </Button>
                  </div>
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
                        onViewTypeChange={setViewType}
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

                      <div className="mt-4 flex flex-wrap gap-2">
                        <Button variant="outline" size="sm" className="gap-2">
                          <Calendar className="h-3.5 w-3.5" />
                          Connect Google
                        </Button>
                        <Button variant="outline" size="sm" className="gap-2">
                          <Calendar className="h-3.5 w-3.5" />
                          Connect Outlook
                        </Button>
                        <Button variant="outline" size="sm" className="gap-2">
                          <Calendar className="h-3.5 w-3.5" />
                          Connect Apple
                        </Button>
                      </div>
                    </div>

                    {/* Mobile/Tablet View */}
                    <div className="lg:hidden">
                      {/* Mobile Header */}
                      <div className="mb-4 flex items-center justify-between">
                        <h2 className="text-lg font-semibold">
                          {format(currentDate, "MMMM yyyy")}
                        </h2>
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

                      <div className="mt-4 flex flex-wrap gap-2">
                        <Button variant="outline" size="sm" className="gap-2">
                          <Calendar className="h-3.5 w-3.5" />
                          Connect Google
                        </Button>
                        <Button variant="outline" size="sm" className="gap-2">
                          <Calendar className="h-3.5 w-3.5" />
                          Connect Outlook
                        </Button>
                        <Button variant="outline" size="sm" className="gap-2">
                          <Calendar className="h-3.5 w-3.5" />
                          Connect Apple
                        </Button>
                      </div>
                    </div>
                  </>
                )}
              </CardWrapper>

              {/* Mobile FAB */}
              <div className="fixed right-4 bottom-24 z-40 flex flex-col gap-2 lg:hidden">
                <Button
                  size="icon"
                  variant="outline"
                  className="h-12 w-12 rounded-full bg-white shadow-lg"
                >
                  <Trash2 className="h-5 w-5 text-orange-500" />
                </Button>
                <Button size="icon" className="h-12 w-12 rounded-full shadow-lg">
                  <Calendar className="h-5 w-5" />
                </Button>
                <Button
                  size="icon"
                  variant="outline"
                  className="h-12 w-12 rounded-full bg-white shadow-lg"
                >
                  <Plus className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </PageTransition>
        </main>
      </div>
    </div>
  );
}
