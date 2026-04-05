"use client";

import * as React from "react";
import Link from "next/link";
import { Check } from "lucide-react";
import { Card } from "@/design-system/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/design-system/components/ui/avatar";
import { Badge } from "@/design-system/components/ui/badge";
import { Button } from "@/design-system/components/ui/button";
import { cn } from "@/design-system/lib/utils";

export type ActionType = "results_ready" | "first_appt" | "urgent_refill" | "priority_action";

export interface PriorityAction {
  id: string;
  patientId: string;
  patientName: string;
  patientAvatar: string;
  appointmentTime: string;
  actionType: ActionType;
  description: string;
  metadata: string;
  ctaLabel: string;
}

interface PriorityActionCardProps {
  action: PriorityAction;
  className?: string;
}

const badgeStyles: Record<ActionType, string> = {
  results_ready: "bg-emerald-100 text-emerald-700 border-emerald-200",
  first_appt: "bg-teal-50 text-teal-700 border-teal-200",
  urgent_refill: "bg-orange-500 text-white border-orange-500",
  priority_action: "bg-emerald-600 text-white border-emerald-600",
};

const badgeLabels: Record<ActionType, string> = {
  results_ready: "RESULTS READY",
  first_appt: "FIRST APPT TODAY",
  urgent_refill: "URGENT REFILL",
  priority_action: "PRIORITY ACTION",
};

export function PriorityActionCard({ action, className }: PriorityActionCardProps) {
  const initials = action.patientName
    .split(" ")
    .map((n) => n[0])
    .join("");

  return (
    <Link href={`/home/patients?patient=${action.patientId}`} prefetch={true} className="block">
      <Card
        className={cn("cursor-pointer overflow-hidden transition-all hover:shadow-lg", className)}
      >
        {/* Teal Gradient Header */}
        <div className="bg-gradient-to-r from-teal-600 to-teal-500 px-4 py-2 sm:px-5">
          <span className="text-[10px] font-bold tracking-widest text-white/90 uppercase">
            PRIORITY ACTION
          </span>
        </div>

        {/* Card Body */}
        <div className="p-4 sm:p-5">
          <div className="flex gap-4">
            {/* Patient Avatar */}
            <Avatar className="h-16 w-16 shrink-0 shadow-sm sm:h-20 sm:w-20">
              {action.patientAvatar && (
                <AvatarImage src={action.patientAvatar} alt={action.patientName} />
              )}
              <AvatarFallback className="bg-avatar-fallback text-sm font-semibold text-white sm:text-base">
                {initials}
              </AvatarFallback>
            </Avatar>

            {/* Content */}
            <div className="min-w-0 flex-1">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  {/* Patient Name */}
                  <h3 className="text-card-foreground text-base font-bold sm:text-lg">
                    {action.patientName}
                  </h3>

                  {/* Appointment Time */}
                  <p className="text-muted-foreground mt-0.5 text-sm">{action.appointmentTime}</p>
                </div>

                {/* Badge */}
                <Badge
                  variant="outline"
                  className={cn(
                    "shrink-0 rounded-md border px-2.5 py-1 text-[10px] font-bold tracking-wide sm:text-xs",
                    badgeStyles[action.actionType]
                  )}
                >
                  {badgeLabels[action.actionType]}
                </Badge>
              </div>

              {/* Action Description */}
              <p className="text-card-foreground mt-2 text-sm font-medium">{action.description}</p>

              {/* Metadata + CTA */}
              <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-stone-300 bg-white">
                    <Check className="h-3 w-3 text-stone-500" />
                  </div>
                  <span className="text-muted-foreground text-xs sm:text-sm">
                    {action.metadata}
                  </span>
                </div>

                <Button
                  size="sm"
                  className="h-8 w-full bg-orange-500 px-4 text-xs font-bold text-white hover:bg-orange-600 sm:w-auto"
                  onClick={(e) => e.stopPropagation()}
                >
                  {action.ctaLabel}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </Link>
  );
}
