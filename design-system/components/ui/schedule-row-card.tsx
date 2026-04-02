"use client";

import * as React from "react";
import Link from "next/link";
import { MapPin, Clock, Video } from "lucide-react";
import { Card } from "@/design-system/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/design-system/components/ui/avatar";
import { Badge } from "@/design-system/components/ui/badge";
import { cn } from "@/design-system/lib/utils";

/** PRD-aligned appointment statuses */
export type ScheduleStatus =
  | "SCHEDULED"
  | "ARRIVED"
  | "ROOMED"
  | "COMPLETED"
  | "CANCELED"
  | "RESCHEDULED";

interface ScheduleRowCardProps {
  time: string;
  endTime?: string;
  patient: string;
  type: string;
  provider: string;
  status: ScheduleStatus;
  room: string;
  avatarSrc?: string;
  avatarHref?: string;
  outstandingBalance?: number;
  isTelehealth?: boolean;
  isCancellation?: boolean;
  rescheduleRequested?: boolean;
  actionSlot?: React.ReactNode;
  primaryAction?: { label: string; onClick: () => void };
  className?: string;
}

export function ScheduleRowCard({
  time,
  endTime,
  patient,
  type,
  provider: _provider,
  status,
  room,
  avatarSrc,
  avatarHref,
  outstandingBalance,
  isTelehealth,
  isCancellation,
  rescheduleRequested,
  actionSlot,
  primaryAction,
  className,
}: ScheduleRowCardProps) {
  const initials = patient
    .split(" ")
    .map((n) => n[0])
    .join("");

  return (
    <Card
      opacity="transparent"
      className={cn(
        "p-4 transition-all hover:bg-white/70 hover:shadow-md sm:p-5",
        isCancellation && "bg-destructive/[0.04] border-destructive/20",
        className
      )}
    >
      <div className="flex flex-wrap items-center gap-2 sm:flex-nowrap sm:gap-4">
        {/* Time */}
        <div className="flex w-[88px] shrink-0 flex-col items-start gap-0.5">
          <div className="flex items-center gap-1.5">
            <Clock className="text-muted-foreground h-4 w-4" />
            <span className="text-sm font-semibold">{time}</span>
          </div>
          {endTime && (
            <span className="text-muted-foreground pl-[22px] text-[11px]">{endTime}</span>
          )}
        </div>

        {/* Patient info */}
        <div className="flex min-w-0 items-center gap-2 sm:max-w-[280px] sm:flex-1 sm:gap-5">
          {avatarHref ? (
            <Link href={avatarHref} onClick={(e) => e.stopPropagation()}>
              <Avatar className="h-10 w-10 shrink-0 cursor-pointer transition-opacity hover:opacity-80 sm:ml-3">
                {avatarSrc && <AvatarImage src={avatarSrc} alt={patient} />}
                <AvatarFallback className="bg-avatar-fallback text-xs text-white">
                  {initials}
                </AvatarFallback>
              </Avatar>
            </Link>
          ) : (
            <Avatar className="h-10 w-10 shrink-0 sm:ml-3">
              {avatarSrc && <AvatarImage src={avatarSrc} alt={patient} />}
              <AvatarFallback className="bg-avatar-fallback text-xs text-white">
                {initials}
              </AvatarFallback>
            </Avatar>
          )}
          <div className="min-w-0">
            <h4
              className={cn(
                "truncate text-sm font-bold",
                status === "CANCELED" && "line-through opacity-60"
              )}
            >
              {patient}
            </h4>
            <div className="flex items-center gap-2">
              <p className="text-muted-foreground truncate text-xs font-bold tracking-wider uppercase">
                {type}
              </p>
              {isTelehealth && (
                <span className="text-growth-3 flex items-center gap-0.5 text-[10px] font-semibold">
                  <Video className="h-3 w-3" />
                  Telehealth
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Right section — tags and status */}
        <div className="hidden min-w-0 flex-1 items-center gap-2 pl-4 sm:flex lg:pl-8">
          {/* Tags group — wraps together when space is tight */}
          <div className="flex min-w-0 flex-1 flex-wrap items-center gap-1.5">
            {/* Action slot */}
            {actionSlot && (
              <div className="flex shrink-0">
                {actionSlot}
              </div>
            )}

            {/* Status pill */}
            <Badge
              variant="outline"
              className={cn(
                "shrink-0 rounded-md px-2 py-0.5 text-xs font-bold",
                status === "SCHEDULED" && "text-muted-foreground border-border border bg-transparent",
                status === "ARRIVED" &&
                  "bg-event-green-bg/60 text-event-green-text border-event-green-border/30",
                status === "ROOMED" && "bg-growth-1/40 text-growth-4 border-growth-2/30",
                status === "COMPLETED" && "bg-muted text-muted-foreground border-none",
                status === "CANCELED" && "bg-destructive/10 text-destructive border-destructive/20",
                status === "RESCHEDULED" &&
                  "border-warning/40 bg-warning-bg text-warning-muted"
              )}
            >
              {status}
            </Badge>

            {/* Other badges */}
            {rescheduleRequested && (
              <Badge
                variant="outline"
                className="border-warning/40 bg-warning-bg text-warning-muted shrink-0 rounded-md px-1.5 py-0.5 text-xs font-bold"
              >
                Reschedule
              </Badge>
            )}

            {outstandingBalance != null && outstandingBalance > 0 && (
              <Badge
                variant="outline"
                className="border-warning/40 bg-warning-bg text-warning-muted shrink-0 rounded-md px-1.5 py-0.5 text-xs font-bold"
              >
                ${outstandingBalance.toFixed(0)}
              </Badge>
            )}
          </div>

          {/* Right-pinned action or location */}
          {primaryAction ? (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                primaryAction.onClick();
              }}
              className="shrink-0 rounded-full bg-primary px-4 py-2 text-sm font-bold text-white transition-opacity hover:opacity-90 lg:px-6"
            >
              {primaryAction.label}
            </button>
          ) : (
            <div className="text-muted-foreground flex shrink-0 items-center gap-1 text-xs font-bold">
              <MapPin className="h-3.5 w-3.5" />
              <span className="truncate max-w-[100px]">{room}</span>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
