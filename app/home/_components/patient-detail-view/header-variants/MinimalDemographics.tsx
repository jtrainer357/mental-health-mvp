"use client";

import * as React from "react";
import { motion, type Variants } from "framer-motion";
import {
  Calendar,
  Phone,
  DollarSign,
  MoreHorizontal,
  ChevronDown,
  ChevronLeft,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/design-system/components/ui/avatar";
import { Badge } from "@/design-system/components/ui/badge";
import { Button } from "@/design-system/components/ui/button";
import { Text } from "@/design-system/components/ui/typography";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/design-system/components/ui/dropdown-menu";
import { cn } from "@/design-system/lib/utils";
import type { PatientDetail } from "../types";

interface MinimalDemographicsProps {
  patient: PatientDetail;
  onExpand?: () => void;
  onBackToRoster?: () => void;
  className?: string;
}

// Elegant easing (typed as tuple for framer-motion)
const smoothEase: [number, number, number, number] = [0.25, 0.1, 0.25, 1.0];

/**
 * Animation variants for content fade
 */
const contentVariants: Variants = {
  hidden: { opacity: 0, y: 8, scale: 0.98 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.35,
      ease: smoothEase,
    },
  },
  exit: {
    opacity: 0,
    y: -6,
    scale: 0.98,
    transition: {
      duration: 0.2,
      ease: smoothEase,
    },
  },
};

/**
 * MinimalDemographics - 90px header for summary/note state
 * Displays compact patient information with essential details and dropdown actions
 */
export function MinimalDemographics({
  patient,
  onExpand,
  onBackToRoster,
  className,
}: MinimalDemographicsProps) {
  const initials = patient.name
    .split(" ")
    .map((n) => n[0])
    .join("");

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
      className={cn("flex flex-col gap-2 p-4", className)}
    >
      {/* Main Row: Avatar, Name + Badge, Actions */}
      <div className="flex items-center justify-between gap-3">
        {/* Left: Back button (mobile) + Avatar and Name/Badge */}
        <div className="flex items-center gap-2">
          {/* Back button - mobile only */}
          {onBackToRoster && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onBackToRoster}
              className="text-muted-foreground hover:text-foreground -ml-2 h-11 w-11 shrink-0 rounded-full lg:hidden"
              aria-label="Back to patients"
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
          )}
          {/* Avatar - 40px */}
          {patient.avatarSrc ? (
            <Avatar className="h-10 w-10 shrink-0">
              <AvatarImage src={patient.avatarSrc} alt={patient.name} />
              <AvatarFallback
                delayMs={0}
                className="bg-avatar-fallback text-xs font-medium text-white"
              >
                {initials}
              </AvatarFallback>
            </Avatar>
          ) : (
            <div className="bg-avatar-fallback flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-xs font-medium text-white">
              {initials}
            </div>
          )}

          {/* Name + Status Badge (inline) */}
          <div className="flex items-center gap-2">
            <Text className="text-base font-semibold">{patient.name}</Text>
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

        {/* Right: Expand button and More Options dropdown */}
        <div className="flex items-center gap-2">
          {onExpand && (
            <Button
              variant="outline"
              size="sm"
              className="border-border/50 hover:border-primary/30 hover:bg-primary/5 h-8 gap-1.5 px-3 text-xs font-medium transition-all"
              onClick={onExpand}
              aria-label="Expand header"
            >
              <span className="hidden sm:inline">Expand</span>
              <ChevronDown className="h-3.5 w-3.5" />
            </Button>
          )}

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="text-muted-foreground hover:bg-muted h-11 w-11 rounded-full transition-colors"
                aria-label="More options"
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem>
                <span>Send Message</span>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <span>Create Note</span>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <span>Start Video Call</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <span>Schedule Appointment</span>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <span>View Full Chart</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <span>Print Summary</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Compact Info Row: DOB | Phone | Last Visit | Balance */}
      <div
        className={cn(
          "bg-muted/30 flex flex-wrap items-center gap-x-4 gap-y-1 rounded-lg px-3 py-1.5",
          onBackToRoster ? "ml-[36px] lg:ml-[52px]" : "ml-[52px]"
        )}
      >
        {/* DOB */}
        <div className="flex items-center gap-1.5">
          <Calendar className="text-muted-foreground/70 h-3.5 w-3.5" />
          <Text size="xs" className="text-muted-foreground">
            {patient.dob}
          </Text>
        </div>

        <div className="bg-border/50 h-3 w-px" />

        {/* Phone */}
        <div className="flex items-center gap-1.5">
          <Phone className="text-muted-foreground/70 h-3.5 w-3.5" />
          <Text size="xs" className="text-muted-foreground">
            {patient.phone}
          </Text>
        </div>

        <div className="bg-border/50 hidden h-3 w-px sm:block" />

        {/* Last Visit */}
        <div className="hidden items-center gap-1.5 sm:flex">
          <Text size="xs" className="text-muted-foreground">
            Last: <span className="font-medium">{patient.lastVisit.date}</span>
          </Text>
        </div>

        <div className="bg-border/50 hidden h-3 w-px sm:block" />

        {/* Balance */}
        <div className="hidden items-center gap-1.5 sm:flex">
          <DollarSign className="text-muted-foreground/70 h-3.5 w-3.5" />
          <Text size="xs" className="text-muted-foreground">
            <span className="font-medium">{patient.balance.amount}</span>
          </Text>
        </div>
      </div>
    </motion.div>
  );
}

export type { MinimalDemographicsProps };
