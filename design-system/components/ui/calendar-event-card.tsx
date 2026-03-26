"use client";

import * as React from "react";
import { cn } from "@/design-system/lib/utils";

export type EventColor =
  | "blue"
  | "pink"
  | "neutral"
  | "green"
  | "yellow"
  | "gray"
  | "red"
  | "orange"
  | "muted"
  | "teal"
  | "rose"
  | "sage"
  | "lavender";

interface CalendarEventCardProps {
  title: string;
  time: string;
  color?: EventColor;
  hasNotification?: boolean;
  onClick?: () => void;
  className?: string;
}

const colorStyles: Record<
  EventColor,
  { bg: string; text: string; borderLeft: string; borderOuter: string }
> = {
  blue: {
    bg: "bg-event-blue-bg/60",
    text: "text-teal",
    borderLeft: "border-l-teal",
    borderOuter: "border-teal/30",
  },
  pink: {
    bg: "bg-primary/10",
    text: "text-primary",
    borderLeft: "border-l-primary",
    borderOuter: "border-primary/20",
  },
  neutral: {
    bg: "bg-event-neutral-bg/80",
    text: "text-foreground",
    borderLeft: "border-l-event-neutral-border",
    borderOuter: "border-event-neutral-border/30",
  },
  green: {
    bg: "bg-event-green-bg/50",
    text: "text-event-green-text",
    borderLeft: "border-l-event-green-border",
    borderOuter: "border-event-green-border/30",
  },
  yellow: {
    bg: "bg-event-warm-bg/60",
    text: "text-event-warm-text",
    borderLeft: "border-l-event-warm-border",
    borderOuter: "border-event-warm-border/40",
  },
  gray: {
    bg: "bg-muted/80",
    text: "text-muted-foreground",
    borderLeft: "border-l-border",
    borderOuter: "border-border/50",
  },
  red: {
    bg: "bg-destructive/10",
    text: "text-destructive",
    borderLeft: "border-l-destructive",
    borderOuter: "border-destructive/20",
  },
  orange: {
    bg: "bg-primary/15",
    text: "text-primary",
    borderLeft: "border-l-primary/80",
    borderOuter: "border-primary/20",
  },
  // muted is an alias for neutral - for subtle, less prominent events
  muted: {
    bg: "bg-event-neutral-bg/80",
    text: "text-foreground",
    borderLeft: "border-l-event-neutral-border",
    borderOuter: "border-event-neutral-border/30",
  },
  teal: {
    bg: "bg-event-teal-bg/60",
    text: "text-event-teal-text",
    borderLeft: "border-l-event-teal-border",
    borderOuter: "border-event-teal-border/30",
  },
  rose: {
    bg: "bg-event-rose-bg/60",
    text: "text-event-rose-text",
    borderLeft: "border-l-event-rose-border",
    borderOuter: "border-event-rose-border/30",
  },
  sage: {
    bg: "bg-event-sage-bg/60",
    text: "text-event-sage-text",
    borderLeft: "border-l-event-sage-border",
    borderOuter: "border-event-sage-border/30",
  },
  lavender: {
    bg: "bg-event-lavender-bg/60",
    text: "text-event-lavender-text",
    borderLeft: "border-l-event-lavender-border",
    borderOuter: "border-event-lavender-border/30",
  },
};

export function CalendarEventCard({
  title,
  time,
  color = "blue",
  hasNotification = false,
  onClick,
  className,
}: CalendarEventCardProps) {
  const styles = colorStyles[color];

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "relative min-h-[44px] w-full overflow-hidden rounded-md border border-l-[3px] px-2 py-2 text-left transition-all hover:brightness-95",
        styles.bg,
        styles.borderLeft,
        styles.borderOuter,
        className
      )}
    >
      {hasNotification && (
        <span className="bg-primary absolute top-1.5 right-1.5 h-1.5 w-1.5 rounded-full" />
      )}
      <p className={cn("truncate text-xs leading-tight font-semibold", styles.text)}>{title}</p>
      <p className={cn("mt-0.5 text-[10px] font-medium opacity-60", styles.text)}>{time}</p>
    </button>
  );
}
