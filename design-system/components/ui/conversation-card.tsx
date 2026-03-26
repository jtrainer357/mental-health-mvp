"use client";

import * as React from "react";
import { Card } from "@/design-system/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/design-system/components/ui/avatar";
import { cn } from "@/design-system/lib/utils";
import { Mail, MessageSquare } from "lucide-react";

type ChannelType = "sms" | "email";

interface ConversationCardProps {
  name: string;
  preview: string;
  time: string;
  unreadCount?: number;
  avatarSrc?: string;
  countryFlag?: string;
  channel?: ChannelType;
  selected?: boolean;
  pinned?: boolean;
  onClick?: () => void;
  className?: string;
}

export function ConversationCard({
  name,
  preview,
  time,
  unreadCount,
  avatarSrc,
  countryFlag,
  channel,
  selected = false,
  onClick,
  className,
}: ConversationCardProps) {
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2);

  return (
    <Card
      className={cn(
        "hover:bg-card-hover/70 cursor-pointer p-3 transition-all hover:border-white hover:shadow-md",
        selected && "border-selected-border bg-accent/30",
        className
      )}
      onClick={onClick}
      aria-label={`Conversation with ${name}${unreadCount ? `, ${unreadCount} unread messages` : ""}`}
    >
      <div className="flex items-start gap-3">
        <div className="relative">
          <Avatar className="h-10 w-10 shrink-0">
            {avatarSrc && <AvatarImage src={avatarSrc} alt={name} />}
            <AvatarFallback className="bg-avatar-fallback text-primary-foreground text-xs font-medium">
              {initials}
            </AvatarFallback>
          </Avatar>
          {countryFlag && (
            <span className="absolute -right-0.5 -bottom-0.5 text-sm">{countryFlag}</span>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="mb-0.5 flex items-center justify-between gap-2">
            <div className="flex min-w-0 items-center gap-2">
              <h5 className="truncate text-sm font-bold">{name}</h5>
              {channel && (
                <span className="bg-muted text-muted-foreground flex shrink-0 items-center gap-1 rounded-full px-1.5 py-0.5 text-[10px] font-medium">
                  {channel === "sms" ? (
                    <MessageSquare className="h-3 w-3" />
                  ) : (
                    <Mail className="h-3 w-3" />
                  )}
                  {channel.toUpperCase()}
                </span>
              )}
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <span className="text-muted-foreground text-xs whitespace-nowrap">{time}</span>
              {unreadCount && unreadCount > 0 && (
                <span className="bg-primary text-primary-foreground flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-xs font-bold">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </div>
          </div>
          <p className="text-muted-foreground truncate text-sm">{preview}</p>
        </div>
      </div>
    </Card>
  );
}

export type { ConversationCardProps };
