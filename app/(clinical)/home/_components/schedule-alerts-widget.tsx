"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/design-system/components/ui/avatar";
import { Heading } from "@/design-system/components/ui/typography";
import { cn } from "@/design-system/lib/utils";
import { PATIENTS } from "@/src/lib/data/patients";
import { APPOINTMENTS } from "@/src/lib/data/appointments";
import { today, daysFromNow } from "@/src/lib/data/helpers";

interface ScheduleAlert {
  id: string;
  patientId: string;
  name: string;
  initials: string;
  avatarSrc?: string;
  time: string;
  detail: string;
  timeAgo: string;
  unread: boolean;
  status: string;
  statusColor: "destructive" | "warning" | "success";
}

function formatTime(startTime: string): string {
  const startH = parseInt(startTime.split(":")[0]!);
  const startM = startTime.split(":")[1];
  const ampm = startH >= 12 ? "PM" : "AM";
  const displayH = startH > 12 ? startH - 12 : startH === 0 ? 12 : startH;
  return `${displayH}:${startM} ${ampm}`;
}

function formatDateLabel(date: string): string {
  const d = new Date(date + "T12:00:00");
  return d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
}

function buildScheduleAlerts(): ScheduleAlert[] {
  const todayStr = today();
  const nextWeekEnd = daysFromNow(7);
  const alerts: ScheduleAlert[] = [];

  // 1. Upcoming cancellations (today through next 7 days) — most urgent
  const upcomingCancelled = APPOINTMENTS.filter(
    (a) => a.status === "Cancelled" && a.date >= todayStr && a.date <= nextWeekEnd
  ).sort((a, b) => a.date.localeCompare(b.date) || a.start_time.localeCompare(b.start_time));

  for (const apt of upcomingCancelled) {
    const patient = PATIENTS.find((p) => p.id === apt.patient_id);
    if (!patient) continue;
    const isToday = apt.date === todayStr;
    const dateLabel = isToday ? "" : `${formatDateLabel(apt.date)} `;
    const statusText = apt.notes?.includes("Reschedule")
      ? "Reschedule requested"
      : isToday
        ? "Cancelled today"
        : "Cancelled";
    const statusColor = apt.notes?.includes("Reschedule")
      ? ("warning" as const)
      : ("destructive" as const);

    alerts.push({
      id: `sa-cancel-${apt.id}`,
      patientId: patient.id,
      name: `${patient.first_name} ${patient.last_name}`,
      initials: `${patient.first_name[0]}${patient.last_name[0]}`,
      avatarSrc: patient.avatar_url || undefined,
      time: `${dateLabel}${formatTime(apt.start_time)}`,
      detail: apt.service_type,
      timeAgo: isToday ? "9 MIN AGO" : "12 MIN AGO",
      unread: true,
      status: statusText,
      statusColor,
    });
  }

  return alerts.slice(0, 5);
}

const alerts = buildScheduleAlerts();

const statusStyles: Record<string, string> = {
  destructive: "text-destructive",
  warning: "text-warning-muted",
  success: "text-success",
};

export function ScheduleAlertsWidget() {
  const router = useRouter();

  if (alerts.length === 0) return null;

  return (
    <section className="border-border/40 flex flex-col rounded-xl border bg-white/[0.64] p-6 shadow-none backdrop-blur-lg lg:p-7">
      <div className="flex items-center justify-between pb-4">
        <Heading level={4} className="text-lg">
          Schedule Alerts
        </Heading>
      </div>
      <div className="-mx-2 space-y-2 px-2">
        {alerts.map((alert) => (
          <div
            key={alert.id}
            onClick={() => router.push("/home/schedule")}
            className="!bg-teal/[0.06] hover:!bg-teal/[0.10] border-border/60 cursor-pointer rounded-lg border p-3 opacity-[0.94] transition-all hover:border-white hover:opacity-100 hover:shadow-md"
          >
            <div className="flex items-center gap-3">
              <Link
                href={`/home/patients?patientName=${encodeURIComponent(alert.name)}`}
                onClick={(e) => e.stopPropagation()}
              >
                <Avatar className="h-10 w-10 cursor-pointer transition-opacity hover:opacity-80">
                  {alert.avatarSrc && <AvatarImage src={alert.avatarSrc} alt={alert.name} />}
                  <AvatarFallback className="bg-avatar-fallback/70 text-sm text-white">
                    {alert.initials}
                  </AvatarFallback>
                </Avatar>
              </Link>
              <div className="min-w-0 flex-1">
                <div className="mb-0.5 flex items-center justify-between gap-2">
                  <h5 className="truncate text-sm font-bold">{alert.name}</h5>
                  <div className="flex shrink-0 items-center gap-2">
                    <span className="text-muted-foreground text-xs font-bold whitespace-nowrap">
                      {alert.timeAgo}
                    </span>
                    {alert.unread && <div className="bg-primary h-2 w-2 rounded-full" />}
                  </div>
                </div>
                <p className="text-muted-foreground truncate text-sm font-medium">
                  {alert.time}
                  {alert.time && " · "}
                  {alert.detail}
                </p>
                <p className={cn("mt-1 text-xs font-semibold", statusStyles[alert.statusColor])}>
                  {alert.status}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
