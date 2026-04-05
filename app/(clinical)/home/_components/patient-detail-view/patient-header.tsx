"use client";

import {
  Calendar,
  Phone,
  Mail,
  Shield,
  MoreVertical,
  CalendarClock,
  DollarSign,
} from "lucide-react";
import { CardWrapper } from "@/design-system/components/ui/card-wrapper";
import { Avatar, AvatarFallback, AvatarImage } from "@/design-system/components/ui/avatar";
import { Badge } from "@/design-system/components/ui/badge";
import { Button } from "@/design-system/components/ui/button";
import { PatientStatCard } from "@/design-system/components/ui/patient-stat-card";
import { Heading, Text } from "@/design-system/components/ui/typography";
import { cn } from "@/design-system/lib/utils";
import type { PatientDetail } from "./types";

interface PatientHeaderProps {
  patient: PatientDetail;
}

export function PatientHeader({ patient }: PatientHeaderProps) {
  const initials = patient.name
    .split(" ")
    .map((n) => n[0])
    .join("");

  return (
    <CardWrapper className="relative">
      <div className="flex flex-col gap-4 pr-8 sm:gap-6 sm:pr-0 lg:flex-row lg:items-start lg:justify-between">
        {/* Left - Avatar and Info */}
        <div className="flex items-start gap-3 sm:gap-4">
          {patient.avatarSrc ? (
            <Avatar className="h-16 w-16 shrink-0 sm:h-20 sm:w-20 lg:h-24 lg:w-24">
              <AvatarImage src={patient.avatarSrc} alt={patient.name} />
              <AvatarFallback
                delayMs={0}
                className="bg-avatar-fallback text-base font-medium text-white sm:text-lg lg:text-xl"
              >
                {initials}
              </AvatarFallback>
            </Avatar>
          ) : (
            <div className="bg-avatar-fallback flex h-16 w-16 shrink-0 items-center justify-center rounded-full text-base font-medium text-white sm:h-20 sm:w-20 sm:text-lg lg:h-24 lg:w-24 lg:text-xl">
              {initials}
            </div>
          )}

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              <Heading level={3} className="truncate text-xl sm:text-2xl">
                {patient.name}
              </Heading>
              <Badge
                variant={
                  patient.status === "ACTIVE"
                    ? "default"
                    : patient.status === "NEW"
                      ? "secondary"
                      : "outline"
                }
                className={cn(
                  "shrink-0 rounded-md border-none px-2 py-0.5 text-xs font-bold sm:px-2.5 sm:py-1",
                  patient.status === "INACTIVE" && "bg-muted text-muted-foreground"
                )}
              >
                {patient.status}
              </Badge>
            </div>

            {/* Contact Info */}
            <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1.5 sm:mt-3 sm:gap-x-6 sm:gap-y-2">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <Calendar className="text-muted-foreground h-3.5 w-3.5 sm:h-4 sm:w-4" />
                <Text size="xs" className="sm:text-sm">
                  DOB: {patient.dob} ({patient.age} yrs)
                </Text>
              </div>
              <div className="flex items-center gap-1.5 sm:gap-2">
                <Phone className="text-muted-foreground h-3.5 w-3.5 sm:h-4 sm:w-4" />
                <Text size="xs" className="sm:text-sm">
                  {patient.phone}
                  {patient.phoneExt && ` x${patient.phoneExt}`}
                </Text>
              </div>
            </div>
            <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1.5 sm:mt-2 sm:gap-x-6 sm:gap-y-2">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <Mail className="text-muted-foreground h-3.5 w-3.5 sm:h-4 sm:w-4" />
                <Text size="xs" className="truncate sm:text-sm">
                  {patient.email}
                </Text>
              </div>
              {patient.insurance && (
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <Shield className="text-muted-foreground h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  <Text size="xs" className="sm:text-sm">
                    {patient.insurance}
                  </Text>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right - More Actions */}
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-4 right-4 h-11 w-11 shrink-0 sm:relative sm:top-auto sm:right-auto sm:self-start"
          aria-label="More patient options"
        >
          <MoreVertical className="h-5 w-5" />
        </Button>
      </div>

      {/* Stats Row */}
      <div className="mt-4 grid grid-cols-1 gap-3 sm:mt-6 sm:grid-cols-3 sm:gap-4">
        <PatientStatCard
          icon={Calendar}
          label="Last Visit"
          value={patient.lastVisit.date}
          subtitle={patient.lastVisit.type}
        />
        <PatientStatCard
          icon={CalendarClock}
          label="Appointments"
          value={`${patient.appointments.total} Total`}
          subtitle={patient.appointments.dateRange}
        />
        <PatientStatCard
          icon={DollarSign}
          label="Balance"
          value={patient.balance.amount}
          subtitle={patient.balance.type}
        />
      </div>
    </CardWrapper>
  );
}
