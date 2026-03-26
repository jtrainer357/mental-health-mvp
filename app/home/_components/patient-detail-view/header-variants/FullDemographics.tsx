"use client";

import * as React from "react";
import { motion, type Variants } from "framer-motion";
import {
  Calendar,
  Phone,
  CalendarClock,
  DollarSign,
  MoreVertical,
  MessageSquare,
  FileText,
  Video,
  ChevronLeft,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/design-system/components/ui/avatar";
import { Badge } from "@/design-system/components/ui/badge";
import { Button } from "@/design-system/components/ui/button";
import { Heading, Text } from "@/design-system/components/ui/typography";
import { Card } from "@/design-system/components/ui/card";
import { cn } from "@/design-system/lib/utils";
import { smoothEase } from "@/design-system/lib/animation-constants";
import type { PatientDetail } from "../types";

interface FullDemographicsProps {
  patient: PatientDetail;
  className?: string;
  onBackToRoster?: () => void;
}

/**
 * Animation variants for content fade
 */
const contentVariants: Variants = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.35,
      ease: smoothEase,
      staggerChildren: 0.08,
    },
  },
  exit: {
    opacity: 0,
    y: -8,
    transition: {
      duration: 0.2,
      ease: smoothEase,
    },
  },
};

/**
 * Animation variants for metric cards
 */
const metricVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 15,
    scale: 0.95,
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.35,
      ease: smoothEase,
    },
  },
};

/**
 * FullDemographics - 120px header for default state
 * Displays complete patient information with avatar, demographics, metrics, and action buttons
 */
export function FullDemographics({ patient, className, onBackToRoster }: FullDemographicsProps) {
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
      className={cn("flex flex-col gap-3 p-4", className)}
    >
      {/* Top Row: Avatar, Info, and Actions */}
      <div className="flex items-start justify-between gap-4">
        {/* Left: Back button (mobile) + Avatar and Demographics */}
        <div className="flex items-start gap-3">
          {/* Back button - mobile only */}
          {onBackToRoster && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onBackToRoster}
              className="text-muted-foreground hover:text-foreground -ml-1 h-11 w-11 shrink-0 rounded-full lg:hidden"
              aria-label="Back to patients"
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
          )}
          {/* Avatar - 56px */}
          {patient.avatarSrc ? (
            <Avatar className="h-14 w-14 shrink-0">
              <AvatarImage src={patient.avatarSrc} alt={patient.name} />
              <AvatarFallback
                delayMs={0}
                className="bg-avatar-fallback text-sm font-medium text-white"
              >
                {initials}
              </AvatarFallback>
            </Avatar>
          ) : (
            <div className="bg-avatar-fallback flex h-14 w-14 shrink-0 items-center justify-center rounded-full text-sm font-medium text-white">
              {initials}
            </div>
          )}

          {/* Patient Info */}
          <div className="min-w-0 flex-1">
            {/* Name + Status Badge */}
            <div className="flex flex-wrap items-center gap-2">
              <Heading level={4} className="truncate text-lg">
                {patient.name}
              </Heading>
              <Badge
                variant={getStatusBadgeVariant(patient.status)}
                className={cn(
                  "shrink-0 rounded-md border-none px-2 py-0.5 text-xs font-bold",
                  patient.status === "INACTIVE" && "bg-muted text-muted-foreground"
                )}
              >
                {patient.status}
              </Badge>
            </div>

            {/* DOB, Age, Phone */}
            <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1">
              <div className="flex items-center gap-1.5">
                <Calendar className="text-muted-foreground h-3.5 w-3.5" />
                <Text size="xs" className="text-muted-foreground">
                  DOB: {patient.dob} ({patient.age} yrs)
                </Text>
              </div>
              <div className="flex items-center gap-1.5">
                <Phone className="text-muted-foreground h-3.5 w-3.5" />
                <Text size="xs" className="text-muted-foreground">
                  {patient.phone}
                  {patient.phoneExt && ` x${patient.phoneExt}`}
                </Text>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Action Buttons - hide individual actions on mobile, show more menu */}
        <div className="flex shrink-0 items-center gap-1.5">
          <Button
            variant="ghost"
            size="icon"
            className="text-muted-foreground hover:bg-primary/10 hover:text-primary h-11 w-11 rounded-full transition-colors"
            aria-label="Send message"
          >
            <MessageSquare className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="text-muted-foreground hover:bg-primary/10 hover:text-primary h-11 w-11 rounded-full transition-colors"
            aria-label="Create note"
          >
            <FileText className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="text-muted-foreground hover:bg-primary/10 hover:text-primary h-11 w-11 rounded-full transition-colors"
            aria-label="Start video call"
          >
            <Video className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="text-muted-foreground hover:bg-muted h-11 w-11 rounded-full transition-colors"
            aria-label="More options"
          >
            <MoreVertical className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Metrics Row - horizontally scrollable on mobile */}
      <motion.div
        className="scrollbar-none -mx-4 flex items-center gap-3 overflow-x-auto px-4 pt-2 pb-1 lg:mx-0 lg:gap-4 lg:overflow-visible lg:px-0 lg:pb-2"
        initial="hidden"
        animate="visible"
        variants={{
          hidden: { opacity: 0 },
          visible: {
            opacity: 1,
            transition: { staggerChildren: 0.1, delayChildren: 0.15 },
          },
        }}
      >
        {/* Last Visit */}
        <motion.div variants={metricVariants} className="min-w-0 flex-1">
          <Card className="border-border/40 flex cursor-default items-center gap-3 px-4 py-3 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md">
            <div className="bg-primary/10 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl">
              <Calendar className="text-primary h-4 w-4" />
            </div>
            <div className="min-w-0">
              <Text size="xs" muted className="text-[10px] font-semibold tracking-wider uppercase">
                Last Visit
              </Text>
              <Text size="sm" className="font-semibold">
                {patient.lastVisit.date}
              </Text>
              <Text size="xs" muted className="truncate">
                {patient.lastVisit.type}
              </Text>
            </div>
          </Card>
        </motion.div>

        {/* Appointments */}
        <motion.div variants={metricVariants} className="min-w-0 flex-1">
          <Card className="border-border/40 flex cursor-default items-center gap-3 px-4 py-3 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md">
            <div className="bg-primary/10 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl">
              <CalendarClock className="text-primary h-4 w-4" />
            </div>
            <div className="min-w-0">
              <Text size="xs" muted className="text-[10px] font-semibold tracking-wider uppercase">
                Appointments
              </Text>
              <Text size="sm" className="font-semibold">
                {patient.appointments.total} Total
              </Text>
              <Text size="xs" muted>
                {patient.appointments.dateRange}
              </Text>
            </div>
          </Card>
        </motion.div>

        {/* Balance */}
        <motion.div variants={metricVariants} className="min-w-0 flex-1">
          <Card className="border-border/40 flex cursor-default items-center gap-3 px-4 py-3 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md">
            <div className="bg-primary/10 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl">
              <DollarSign className="text-primary h-4 w-4" />
            </div>
            <div className="min-w-0">
              <Text size="xs" muted className="text-[10px] font-semibold tracking-wider uppercase">
                Balance
              </Text>
              <Text size="sm" className="font-semibold">
                {patient.balance.amount}
              </Text>
              <Text size="xs" muted>
                {patient.balance.type}
              </Text>
            </div>
          </Card>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}

export type { FullDemographicsProps };
