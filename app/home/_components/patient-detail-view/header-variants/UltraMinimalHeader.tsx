"use client";

import * as React from "react";
import { motion, type Variants } from "framer-motion";
import { X, ChevronLeft } from "lucide-react";
import { Badge } from "@/design-system/components/ui/badge";
import { Button } from "@/design-system/components/ui/button";
import { Text } from "@/design-system/components/ui/typography";
import { cn } from "@/design-system/lib/utils";
import type { PatientDetail } from "../types";

interface UltraMinimalHeaderProps {
  patient: PatientDetail;
  noteDate?: string | null;
  noteTitle?: string | null;
  onBack?: () => void;
  onClose?: () => void;
  className?: string;
}

/**
 * Animation variants for content fade
 */
const contentVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.2,
      ease: "easeOut",
    },
  },
  exit: {
    opacity: 0,
    transition: {
      duration: 0.15,
      ease: "easeIn",
    },
  },
};

/**
 * UltraMinimalHeader - 50px header for fullView state
 * Displays only patient name, note date, and navigation controls
 * Used for immersive note viewing experience
 */
export function UltraMinimalHeader({
  patient,
  noteDate,
  noteTitle,
  onBack,
  onClose,
  className,
}: UltraMinimalHeaderProps) {
  const getStatusBadgeVariant = (
    status: PatientDetail["status"]
  ): "default" | "secondary" | "outline" => {
    switch (status) {
      case "ACTIVE":
        return "default";
      case "NEW":
        return "secondary";
      default:
        return "outline";
    }
  };

  return (
    <motion.div
      variants={contentVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className={cn("flex h-full items-center justify-between gap-4 px-4", className)}
    >
      {/* Left: Back button + Patient Name + Status */}
      <div className="flex items-center gap-2">
        {onBack && (
          <Button
            variant="ghost"
            size="icon"
            className="h-11 w-11 shrink-0"
            onClick={onBack}
            aria-label="Go back"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
        )}

        <div className="flex items-center gap-2">
          <Text className="text-sm font-semibold">{patient.name}</Text>
          <Badge
            variant={getStatusBadgeVariant(patient.status)}
            className={cn(
              "shrink-0 rounded-md border-none px-1.5 py-0.5 text-[10px] font-bold",
              patient.status === "INACTIVE" && "bg-muted text-muted-foreground"
            )}
          >
            {patient.status}
          </Badge>
        </div>
      </div>

      {/* Center: Note info (if available) */}
      {(noteDate || noteTitle) && (
        <div className="hidden items-center gap-2 sm:flex">
          {noteTitle && (
            <Text size="sm" className="text-muted-foreground max-w-[200px] truncate">
              {noteTitle}
            </Text>
          )}
          {noteTitle && noteDate && <span className="text-muted-foreground/50 text-xs">|</span>}
          {noteDate && (
            <Text size="xs" className="text-muted-foreground whitespace-nowrap">
              {noteDate}
            </Text>
          )}
        </div>
      )}

      {/* Right: Close button */}
      {onClose && (
        <Button
          variant="ghost"
          size="icon"
          className="h-11 w-11 shrink-0"
          onClick={onClose}
          aria-label="Close full view"
        >
          <X className="h-4 w-4" />
        </Button>
      )}
    </motion.div>
  );
}

export type { UltraMinimalHeaderProps };
