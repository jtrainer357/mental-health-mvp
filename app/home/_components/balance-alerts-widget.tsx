"use client";

import * as React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/design-system/components/ui/avatar";
import { Heading } from "@/design-system/components/ui/typography";
import { PATIENTS } from "@/src/lib/data/patients";
import { INVOICES } from "@/src/lib/data/billing";
import { APPOINTMENTS } from "@/src/lib/data/appointments";
import { today } from "@/src/lib/data/helpers";

interface BalanceAlert {
  id: string;
  name: string;
  initials: string;
  avatarSrc?: string;
  time: string;
  detail: string;
  timeLabel: string;
  unread: boolean;
  amount: number;
}

function buildBalanceAlerts(): BalanceAlert[] {
  const todayStr = today();
  const todayAppts = APPOINTMENTS.filter((a) => a.date === todayStr && a.status === "Scheduled");

  // Find patients with outstanding balances who have appointments today
  const alerts: BalanceAlert[] = [];

  for (const apt of todayAppts) {
    const patient = PATIENTS.find((p) => p.id === apt.patient_id);
    if (!patient) continue;

    const patientInvoices = INVOICES.filter(
      (inv) => inv.patient_id === patient.id && inv.balance > 0
    );
    const totalBalance = patientInvoices.reduce((sum, inv) => sum + inv.balance, 0);
    if (totalBalance <= 0) continue;

    const startH = parseInt(apt.start_time.split(":")[0]!);
    const startM = apt.start_time.split(":")[1];
    const ampm = startH >= 12 ? "PM" : "AM";
    const displayH = startH > 12 ? startH - 12 : startH === 0 ? 12 : startH;
    const timeStr = `${displayH}:${startM} ${ampm}`;

    alerts.push({
      id: `ba-${patient.id}`,
      name: `${patient.first_name} ${patient.last_name}`,
      initials: `${patient.first_name[0]}${patient.last_name[0]}`,
      avatarSrc: patient.avatar_url || undefined,
      time: timeStr,
      detail: apt.service_type,
      timeLabel: alerts.length === 0 ? "NOW" : "ONGOING",
      unread: alerts.length === 0,
      amount: totalBalance,
    });
  }

  // Also add patients with balances NOT on today's schedule
  for (const patient of PATIENTS) {
    if (alerts.some((a) => a.id === `ba-${patient.id}`)) continue;
    const patientInvoices = INVOICES.filter(
      (inv) => inv.patient_id === patient.id && inv.balance > 0
    );
    const totalBalance = patientInvoices.reduce((sum, inv) => sum + inv.balance, 0);
    if (totalBalance <= 0) continue;

    alerts.push({
      id: `ba-${patient.id}`,
      name: `${patient.first_name} ${patient.last_name}`,
      initials: `${patient.first_name[0]}${patient.last_name[0]}`,
      avatarSrc: patient.avatar_url || undefined,
      time: "",
      detail: "Outstanding balance",
      timeLabel: "OVERDUE",
      unread: false,
      amount: totalBalance,
    });
  }

  return alerts.slice(0, 5); // Show top 5
}

const alerts = buildBalanceAlerts();

export function BalanceAlertsWidget() {
  if (alerts.length === 0) return null;

  return (
    <section className="border-border/40 flex flex-col rounded-xl border bg-white/60 p-4 shadow-sm backdrop-blur-lg sm:p-6">
      <div className="flex items-center justify-between pb-4">
        <Heading level={4} className="text-lg">
          Balance Alerts
        </Heading>
      </div>
      <div className="-mx-2 space-y-2 px-2">
        {alerts.map((alert) => (
          <div
            key={alert.id}
            className="!bg-teal/[0.06] hover:!bg-teal/[0.10] border-border/60 cursor-pointer rounded-lg border p-3 opacity-[0.94] transition-all hover:border-white hover:opacity-100 hover:shadow-md"
          >
            <div className="flex items-start gap-3">
              <Avatar className="h-10 w-10">
                {alert.avatarSrc && <AvatarImage src={alert.avatarSrc} alt={alert.name} />}
                <AvatarFallback className="bg-avatar-fallback/70 text-sm text-white">
                  {alert.initials}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <div className="mb-0.5 flex items-center justify-between gap-2">
                  <h5 className="truncate text-sm font-bold">{alert.name}</h5>
                  <div className="flex shrink-0 items-center gap-2">
                    <span className="text-muted-foreground text-xs font-bold whitespace-nowrap">
                      {alert.timeLabel}
                    </span>
                    {alert.unread && <div className="bg-primary h-2 w-2 rounded-full" />}
                  </div>
                </div>
                <p className="text-muted-foreground truncate text-sm font-medium">
                  {alert.time}
                  {alert.time && " · "}
                  {alert.detail}
                </p>
                <p className="text-primary mt-1 text-xs font-semibold">
                  ${alert.amount} outstanding
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
