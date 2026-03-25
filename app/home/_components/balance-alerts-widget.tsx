"use client";

import * as React from "react";
import { Card } from "@/design-system/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/design-system/components/ui/avatar";
import { Button } from "@/design-system/components/ui/button";
import { CardWrapper } from "@/design-system/components/ui/card-wrapper";
import { Heading } from "@/design-system/components/ui/typography";

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

const alerts: BalanceAlert[] = [
  {
    id: "ba-1",
    name: "Rachel Torres",
    initials: "RT",
    avatarSrc: "https://i.pravatar.cc/150?u=rachel-torres-demo-1001",
    time: "9:00 AM",
    detail: "session starting",
    timeLabel: "NOW",
    unread: true,
    amount: 247,
  },
  {
    id: "ba-2",
    name: "Lisa Whitfield",
    initials: "LW",
    avatarSrc: "https://i.pravatar.cc/150?u=lisa-whitfield-demo-1008",
    time: "11:30 AM",
    detail: "Individual Therapy",
    timeLabel: "ONGOING",
    unread: false,
    amount: 373,
  },
  {
    id: "ba-3",
    name: "James Okafor",
    initials: "JO",
    avatarSrc: "https://i.pravatar.cc/150?u=james-okafor-demo-1003",
    time: "10:30 AM",
    detail: "Individual Therapy",
    timeLabel: "ONGOING",
    unread: false,
    amount: 84,
  },
];

export function BalanceAlertsWidget() {
  const unreadCount = alerts.filter((a) => a.unread).length;

  return (
    <CardWrapper className="flex flex-col">
      <div className="flex items-center justify-between pb-4">
        <div className="flex items-center gap-2">
          <Heading level={4} className="text-lg">
            Balance Alerts
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
                      {alert.timeLabel}
                    </span>
                    {alert.unread && <div className="bg-primary h-2 w-2 rounded-full" />}
                  </div>
                </div>
                <p className="text-muted-foreground truncate text-sm font-medium">
                  {alert.time} · {alert.detail}
                </p>
                <p className="text-primary mt-1 text-xs font-semibold">
                  ${alert.amount} outstanding
                </p>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </CardWrapper>
  );
}
