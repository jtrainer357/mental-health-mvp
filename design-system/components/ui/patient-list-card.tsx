"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Clock, Mail, MessageSquare, MoreHorizontal } from "lucide-react";
import { Card } from "@/design-system/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/design-system/components/ui/avatar";
import { Badge } from "@/design-system/components/ui/badge";
import { Button } from "@/design-system/components/ui/button";
import { Text } from "@/design-system/components/ui/typography";
import { cn } from "@/design-system/lib/utils";
import { smoothEase } from "@/design-system/lib/animation-constants";

// Elegant spring config for interactions
const springConfig = {
  type: "spring" as const,
  stiffness: 400,
  damping: 30,
};

type PatientStatus = "ACTIVE" | "INACTIVE" | "NEW";

/** Convert "HH:MM" 24h to "H:MM AM/PM" display format */
function formatTime24to12(time24: string): string {
  const parts = time24.split(":").map(Number);
  const h = parts[0] ?? 0;
  const m = parts[1] ?? 0;
  const period = h >= 12 ? "PM" : "AM";
  const hour12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
  return `${hour12}:${m.toString().padStart(2, "0")} ${period}`;
}

interface PatientListCardProps {
  name: string;
  age: number;
  dob: string;
  phone: string;
  lastActivity: string;
  status: PatientStatus;
  avatarSrc?: string;
  selected?: boolean;
  compact?: boolean;
  /** When set, shows clock + time instead of status badge (for Today's Patients) */
  appointmentTime?: string;
  /** End time in HH:MM 24h format */
  appointmentEndTime?: string;
  onSelect?: () => void;
  onMessage?: () => void;
  onEmail?: () => void;
  onMore?: () => void;
  className?: string;
}

export function PatientListCard({
  name,
  age,
  dob,
  phone,
  lastActivity,
  status,
  avatarSrc,
  selected = false,
  compact = false,
  appointmentTime,
  appointmentEndTime,
  onSelect,
  onMessage,
  onEmail,
  onMore,
  className,
}: PatientListCardProps) {
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("");

  // Compact view: smaller avatar with name underneath
  if (compact) {
    return (
      <motion.div
        whileHover={{ scale: 1.03, y: -2 }}
        whileTap={{ scale: 0.98 }}
        transition={springConfig}
      >
        <Card
          className={cn(
            "hover:bg-card-hover/70 relative cursor-pointer overflow-hidden p-2 transition-colors hover:border-white hover:shadow-md",
            selected && "border-selected-border bg-accent/30",
            className
          )}
          onClick={onSelect}
          aria-label={`Patient ${name}`}
          aria-selected={selected}
        >
          {/* Selection indicator ring */}
          <AnimatePresence>
            {selected && (
              <motion.div
                className="ring-primary/40 absolute inset-0 rounded-[inherit] ring-2"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.25, ease: smoothEase }}
              />
            )}
          </AnimatePresence>
          <div className="flex items-center gap-2.5">
            <motion.div animate={{ scale: selected ? 1.05 : 1 }} transition={{ duration: 0.2 }}>
              <Avatar className="h-8 w-8 shrink-0">
                {avatarSrc && <AvatarImage src={avatarSrc} alt={name} />}
                <AvatarFallback className="bg-avatar-fallback text-[10px] font-medium text-white">
                  {initials}
                </AvatarFallback>
              </Avatar>
            </motion.div>
            <span className="text-card-foreground min-w-0 text-left text-xs leading-tight font-medium">
              {name}
            </span>
          </div>
        </Card>
      </motion.div>
    );
  }

  return (
    <motion.div
      whileHover={{ scale: 1.01, y: -1 }}
      whileTap={{ scale: 0.995 }}
      transition={springConfig}
    >
      <Card
        className={cn(
          "hover:bg-card-hover/70 relative cursor-pointer overflow-hidden p-3 transition-colors hover:border-white hover:shadow-md sm:p-4",
          selected && "border-selected-border bg-accent/30",
          className
        )}
        onClick={onSelect}
        aria-label={`Patient ${name}, ${status.toLowerCase()}, Age ${age}`}
        aria-selected={selected}
      >
        {/* Selection indicator - animated border highlight */}
        <AnimatePresence>
          {selected && (
            <motion.div
              className="ring-primary/40 absolute inset-0 rounded-[inherit] ring-2"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.25, ease: smoothEase }}
            />
          )}
        </AnimatePresence>

        {/* Subtle gradient overlay when selected */}
        <AnimatePresence>
          {selected && (
            <motion.div
              className="from-primary/5 pointer-events-none absolute inset-0 rounded-[inherit] bg-gradient-to-r to-transparent"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            />
          )}
        </AnimatePresence>

        <div className="relative flex items-start gap-3">
          {/* Avatar */}
          <motion.div
            animate={{ scale: selected ? 1.03 : 1 }}
            transition={{ duration: 0.2, ease: smoothEase }}
          >
            <Avatar className="h-10 w-10 shrink-0 sm:h-11 sm:w-11">
              {avatarSrc && <AvatarImage src={avatarSrc} alt={name} />}
              <AvatarFallback className="bg-avatar-fallback text-xs font-medium text-white">
                {initials}
              </AvatarFallback>
            </Avatar>
          </motion.div>

          {/* Patient Info */}
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-2">
              <motion.h4
                className={cn(
                  "truncate text-sm font-bold transition-colors",
                  selected ? "text-primary" : "text-card-foreground"
                )}
                animate={{ color: selected ? "var(--primary)" : undefined }}
                transition={{ duration: 0.2 }}
              >
                {name}
              </motion.h4>
              {appointmentTime ? (
                <div className="flex shrink-0 flex-col items-end gap-0.5">
                  <div className="flex items-center gap-1.5">
                    <Clock className="text-muted-foreground h-4 w-4" />
                    <span className="text-sm font-semibold">{formatTime24to12(appointmentTime)}</span>
                  </div>
                  {appointmentEndTime && (
                    <span className="text-muted-foreground text-[11px]">{formatTime24to12(appointmentEndTime)}</span>
                  )}
                </div>
              ) : (
                <Badge
                  variant={status === "ACTIVE" ? "active" : status === "NEW" ? "new" : "inactive"}
                  className="shrink-0 rounded-md border-none px-2 py-0.5 text-xs font-bold"
                >
                  {status}
                </Badge>
              )}
            </div>
            <Text size="xs" muted className="mt-0.5">
              Age {age} &bull; {dob}
            </Text>
            <Text size="xs" muted className="mt-0.5">
              {phone}
            </Text>
          </div>
        </div>

        {/* Bottom row - Last Activity and Actions */}
        <div className="border-border/50 relative mt-2 -mb-1 flex items-center justify-between border-t pt-1">
          <Text size="xs" muted className="font-medium tracking-wide uppercase">
            Last Activity: {lastActivity}
          </Text>
          <div className="-mr-1 flex items-center">
            <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
              <Button
                variant="ghost"
                size="icon"
                className="text-muted-foreground hover:text-foreground relative h-11 w-11"
                onClick={(e) => {
                  e.stopPropagation();
                  onMessage?.();
                }}
                aria-label={`Send message to ${name}`}
              >
                <MessageSquare className="h-4 w-4" />
              </Button>
            </motion.div>
            <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
              <Button
                variant="ghost"
                size="icon"
                className="text-muted-foreground hover:text-foreground relative h-11 w-11"
                onClick={(e) => {
                  e.stopPropagation();
                  onEmail?.();
                }}
                aria-label={`Send email to ${name}`}
              >
                <Mail className="h-4 w-4" />
              </Button>
            </motion.div>
            <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
              <Button
                variant="ghost"
                size="icon"
                className="text-muted-foreground hover:text-foreground relative h-11 w-11"
                onClick={(e) => {
                  e.stopPropagation();
                  onMore?.();
                }}
                aria-label={`More options for ${name}`}
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </motion.div>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}

export type { PatientListCardProps, PatientStatus };
