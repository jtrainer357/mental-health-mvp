"use client";

import * as React from "react";
import { MapPin, Clock } from "lucide-react";
import { Card } from "@/design-system/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/design-system/components/ui/avatar";
import { Badge } from "@/design-system/components/ui/badge";
import { cn } from "@/design-system/lib/utils";

type ActionStatus = "SCHEDULED" | "ARRIVED" | "ROOMED" | "COMPLETED" | "CANCELED" | "RESCHEDULED";

interface ActionRowCardProps {
  time: string;
  patient: string;
  type: string;
  provider: string;
  status: ActionStatus;
  room: string;
  avatarSrc?: string;
  className?: string;
}

export function ActionRowCard({
  time,
  patient,
  type,
  provider: _provider,
  status,
  room,
  avatarSrc,
  className,
}: ActionRowCardProps) {
  const initials = patient
    .split(" ")
    .map((n) => n[0])
    .join("");

  return (
    <Card className={cn("p-3 shadow-sm transition-all hover:shadow-md sm:p-4", className)}>
      <div className="flex flex-wrap items-center gap-2 sm:flex-nowrap sm:gap-4">
        {/* Time */}
        <div className="flex shrink-0 items-center gap-1.5">
          <Clock className="text-muted-foreground h-4 w-4" />
          <span className="text-sm font-semibold">{time}</span>
        </div>

        {/* Patient info */}
        <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-4">
          <Avatar className="h-10 w-10 shrink-0 sm:ml-4">
            {avatarSrc && <AvatarImage src={avatarSrc} alt={patient} />}
            <AvatarFallback className="bg-avatar-fallback text-xs text-white">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <h4 className="truncate text-sm font-bold">{patient}</h4>
            <p className="text-muted-foreground truncate text-xs font-bold tracking-wider uppercase">
              {type}
            </p>
          </div>
        </div>

        {/* Status */}
        <Badge
          variant="outline"
          className={cn(
            "shrink-0 rounded-md px-2 py-0.5 text-xs font-bold",
            status === "SCHEDULED" && "text-muted-foreground border-border border bg-transparent",
            status === "ARRIVED" && "bg-event-green-bg/60 text-event-green-text border-event-green-border/30",
            status === "ROOMED" && "bg-growth-1/40 text-growth-4 border-growth-2/30",
            status === "COMPLETED" && "bg-muted text-muted-foreground border-none",
            status === "CANCELED" && "bg-destructive/10 text-destructive border-destructive/20",
            status === "RESCHEDULED" && "border-warning/40 bg-warning-bg text-warning-muted"
          )}
        >
          {status}
        </Badge>

        {/* Room */}
        <div className="text-muted-foreground flex shrink-0 items-center gap-1 text-xs font-bold sm:ml-12">
          <MapPin className="h-3.5 w-3.5" />
          {room}
        </div>
      </div>
    </Card>
  );
}
