"use client";

import * as React from "react";
import { Phone, Mail, MessageSquare, MoreHorizontal } from "lucide-react";
import { motion } from "framer-motion";
import { Card } from "@/design-system/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/design-system/components/ui/avatar";
import { Badge } from "@/design-system/components/ui/badge";
import { Button } from "@/design-system/components/ui/button";
import { Text } from "@/design-system/components/ui/typography";
import { cn } from "@/design-system/lib/utils";
import type { PatientCardBaseProps } from "./types";
import { ROSTER_ANIMATION_CONFIG } from "./types";

interface PatientCardFullProps extends PatientCardBaseProps {
  onMessage?: () => void;
  onEmail?: () => void;
  onMore?: () => void;
}

/**
 * Full patient card for default roster state (320px width)
 * Displays complete patient information with action buttons
 */
export function PatientCardFull({
  patient,
  selected = false,
  onSelect,
  onMessage,
  onEmail,
  onMore,
  className,
}: PatientCardFullProps) {
  const initials = `${patient.firstName[0] ?? ""}${patient.lastName[0] ?? ""}`;

  // Map status to badge variant
  const statusVariant = React.useMemo(() => {
    switch (patient.status) {
      case "ACTIVE":
        return "active";
      case "NEW":
        return "new";
      case "INACTIVE":
        return "inactive";
      default:
        return "secondary";
    }
  }, [patient.status]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{
        duration: ROSTER_ANIMATION_CONFIG.duration,
        ease: ROSTER_ANIMATION_CONFIG.ease,
      }}
      layout
    >
      <Card
        className={cn(
          "hover:bg-card-hover/70 cursor-pointer p-3 transition-colors hover:border-white hover:shadow-md sm:p-4",
          "min-h-[120px]", // Ensure minimum touch target height
          selected && "border-selected-border bg-accent/30",
          className
        )}
        onClick={onSelect}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onSelect?.();
          }
        }}
        aria-label={`Patient ${patient.name}, ${patient.status.toLowerCase()}, Age ${patient.age}`}
        aria-pressed={selected}
      >
        <div className="flex items-start gap-3">
          {/* Avatar - 48px as specified */}
          <Avatar className="h-12 w-12 shrink-0">
            {patient.avatarSrc && <AvatarImage src={patient.avatarSrc} alt={patient.name} />}
            <AvatarFallback className="bg-avatar-fallback text-sm font-medium text-white">
              {initials}
            </AvatarFallback>
          </Avatar>

          {/* Patient Info */}
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-2">
              <h4 className="text-card-foreground truncate text-sm font-bold">{patient.name}</h4>
              <Badge
                variant={statusVariant}
                className="shrink-0 rounded-md border-none px-2 py-0.5 text-xs font-bold"
              >
                {patient.status}
              </Badge>
            </div>
            <Text size="xs" muted className="mt-0.5">
              Age {patient.age} &bull; {patient.dob}
            </Text>
            <div className="mt-0.5 flex items-center gap-1.5">
              <Phone className="text-muted-foreground h-3 w-3" aria-hidden="true" />
              <Text size="xs" muted>
                {patient.phone}
              </Text>
            </div>
          </div>
        </div>

        {/* Bottom row - Last Activity and Actions */}
        <div className="border-border/50 mt-2.5 -mb-1 flex items-center justify-between border-t pt-1.5">
          <Text size="xs" muted className="font-medium tracking-wide uppercase">
            Last: {patient.lastActivity}
          </Text>
          <div className="-mr-1 flex items-center">
            <Button
              variant="ghost"
              size="icon"
              className="text-muted-foreground hover:text-foreground relative h-11 w-11"
              onClick={(e) => {
                e.stopPropagation();
                onMessage?.();
              }}
              aria-label={`Send message to ${patient.name}`}
            >
              <MessageSquare className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="text-muted-foreground hover:text-foreground relative h-11 w-11"
              onClick={(e) => {
                e.stopPropagation();
                onEmail?.();
              }}
              aria-label={`Send email to ${patient.name}`}
            >
              <Mail className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="text-muted-foreground hover:text-foreground relative h-11 w-11"
              onClick={(e) => {
                e.stopPropagation();
                onMore?.();
              }}
              aria-label={`More options for ${patient.name}`}
            >
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
