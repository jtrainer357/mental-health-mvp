"use client";

import * as React from "react";
import { Card } from "@/design-system/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/design-system/components/ui/avatar";
import { Button } from "@/design-system/components/ui/button";
import { CardWrapper } from "@/design-system/components/ui/card-wrapper";
import { Heading } from "@/design-system/components/ui/typography";
import { cn } from "@/design-system/lib/utils";

interface ScheduleAlert {
  id: string;
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

const alerts: ScheduleAlert[] = [
  {
    id: "sa-1",
    name: "Kevin Rhodes",
    initials: "KR",
    time: "2:30 PM",
    detail: "Individual Therap...",
    timeAgo: "9 MIN AGO",
    unread: true,
    status: "Cancelled today",
    statusColor: "destructive",
  },
  {
    id: "sa-2",
    name: "Sarah Johnson",
    initials: "SJ",
    avatarSrc: "https://i.pravatar.cc/150?u=p001-sarah-f",
    time: "Tue 11:00 AM",
    detail: "needs new ti...",
    timeAgo: "12 MIN AGO",
    unread: true,
    status: "Reschedule requested",
    statusColor: "warning",
  },
  {
    id: "sa-3",
    name: "Rachel Torres",
    initials: "RT",
    avatarSrc: "https://i.pravatar.cc/150?u=rachel-torres-demo-1001",
    time: "9:00 AM",
    detail: "Individual Therap...",
    timeAgo: "JUST NOW",
    unread: false,
    status: "Patient arrived",
    statusColor: "success",
  },
];

const statusStyles: Record<string, string> = {
  destructive: "text-destructive",
  warning: "text-warning-muted",
  success: "text-success",
};

export function ScheduleAlertsWidget() {
  const unreadCount = alerts.filter((a) => a.unread).length;

  return (
    <CardWrapper className="flex flex-col">
      <div className="flex items-center justify-between pb-4">
        <div className="flex items-center gap-2">
          <Heading level={4} className="text-lg">
            Schedule Alerts
          </Heading>
          {unreadCount > 0 && (
            <span className="bg-primary text-primary-foreground flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold">
              {unreadCount}
            </span>
          )}
        </div>
        <Button variant="outline" size="sm" className="h-7 rounded-full px-4 text-xs font-bold">
          View all
        </Button>
      </div>
      <div className="-mx-2 space-y-2 px-2">
        {alerts.map((alert) => (
          <Card
            key={alert.id}
            className="hover:bg-card-hover/70 cursor-pointer p-3 transition-all hover:border-white hover:shadow-md"
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
                      {alert.timeAgo}
                    </span>
                    {alert.unread && <div className="bg-primary h-2 w-2 rounded-full" />}
                  </div>
                </div>
                <p className="text-muted-foreground truncate text-sm font-medium">
                  {alert.time} · {alert.detail}
                </p>
                <p className={cn("mt-1 text-xs font-semibold", statusStyles[alert.statusColor])}>
                  {alert.status}
                </p>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </CardWrapper>
  );
}
