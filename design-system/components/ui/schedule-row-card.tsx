"use client";

import * as React from "react";
import Link from "next/link";
import { MapPin, Clock } from "lucide-react";
import { Card } from "@/design-system/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/design-system/components/ui/avatar";
import { Badge } from "@/design-system/components/ui/badge";
import { cn } from "@/design-system/lib/utils";

type ScheduleStatus =
  | "ENDED"
  | "IN PROGRESS"
  | "CHECKED IN"
  | "SCHEDULED"
  | "CANCELLED"
  | "ARRIVING";

interface ScheduleRowCardProps {
  time: string;
  patient: string;
  type: string;
  provider: string;
  status: ScheduleStatus;
  room: string;
  avatarSrc?: string;
  avatarHref?: string;
  outstandingBalance?: number;
  actionSlot?: React.ReactNode;
  className?: string;
}

export function ScheduleRowCard({
  time,
  patient,
  type,
  provider: _provider,
  status,
  room,
  avatarSrc,
  avatarHref,
  outstandingBalance,
  actionSlot,
  className,
}: ScheduleRowCardProps) {
  const initials = patient
    .split(" ")
    .map((n) => n[0])
    .join("");

  return (
    <Card
      opacity="transparent"
      className={cn("p-3 transition-all hover:bg-white/70 hover:shadow-md sm:p-4", className)}
    >
      <div className="flex flex-wrap items-center gap-2 sm:flex-nowrap sm:gap-4">
        {/* Time */}
        <div className="flex shrink-0 items-center gap-1.5">
          <Clock className="text-muted-foreground h-4 w-4" />
          <span className="text-sm font-semibold">{time}</span>
        </div>

        {/* Patient info */}
        <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-5">
          {avatarHref ? (
            <Link href={avatarHref} onClick={(e) => e.stopPropagation()}>
              <Avatar className="h-10 w-10 shrink-0 cursor-pointer transition-opacity hover:opacity-80 sm:ml-6">
                {avatarSrc && <AvatarImage src={avatarSrc} alt={patient} />}
                <AvatarFallback className="bg-avatar-fallback text-xs text-white">
                  {initials}
                </AvatarFallback>
              </Avatar>
            </Link>
          ) : (
            <Avatar className="h-10 w-10 shrink-0 sm:ml-6">
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
                status === "CANCELLED" && "line-through opacity-60"
              )}
            >
              {patient}
            </h4>
            <p className="text-muted-foreground truncate text-xs font-bold tracking-wider uppercase">
              {type}
            </p>
          </div>
        </div>

        {/* Right section — fixed width so status pill always starts at the same x */}
        <div className="hidden shrink-0 items-center gap-2 sm:flex sm:w-[300px]">
          <Badge
            variant={
              status === "IN PROGRESS"
                ? "default"
                : status === "CHECKED IN" || status === "ARRIVING"
                  ? "secondary"
                  : "outline"
            }
            className={cn(
              "shrink-0 rounded-md px-2 py-0.5 text-xs font-bold",
              status === "ENDED" && "bg-muted text-muted-foreground border-none",
              status === "SCHEDULED" && "text-muted-foreground border-border border bg-transparent",
              status === "CANCELLED" && "bg-destructive/10 text-destructive border-destructive/20",
              status === "ARRIVING" &&
                "bg-event-green-bg/60 text-event-green-text border-event-green-border/30",
              (status === "IN PROGRESS" || status === "CHECKED IN") && "border-none"
            )}
          >
            {status}
          </Badge>

          {outstandingBalance != null && outstandingBalance > 0 && (
            <Badge
              variant="outline"
              className="border-warning/40 bg-warning-bg text-warning-muted shrink-0 rounded-md px-1.5 py-0.5 text-xs font-bold"
            >
              ${outstandingBalance.toFixed(0)}
            </Badge>
          )}

          {actionSlot}

          <div className="text-muted-foreground ml-auto flex items-center gap-1 text-xs font-bold">
            <MapPin className="h-3.5 w-3.5" />
            {room}
          </div>
        </div>
      </div>
    </Card>
  );
}
