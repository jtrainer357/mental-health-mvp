"use client";

import * as React from "react";
import { Calendar, Phone, Mail, Shield, MoreVertical } from "lucide-react";
import { CardWrapper } from "@/design-system/components/ui/card-wrapper";
import { Avatar, AvatarFallback, AvatarImage } from "@/design-system/components/ui/avatar";
import { Badge } from "@/design-system/components/ui/badge";
import { Button } from "@/design-system/components/ui/button";
import { Heading, Text } from "@/design-system/components/ui/typography";
import { cn } from "@/design-system/lib/utils";

export type PatientStatus = "ACTIVE" | "INACTIVE" | "NEW";

export interface PatientHeaderData {
  id: string;
  name: string;
  status: PatientStatus;
  dob: string;
  age: number;
  phone: string;
  phoneExt?: string;
  email: string;
  insurance?: string;
  avatarSrc?: string;
}

interface PatientHeaderProps {
  patient: PatientHeaderData;
  className?: string;
  onMoreClick?: () => void;
}

export function PatientHeader({ patient, className, onMoreClick }: PatientHeaderProps) {
  const initials = patient.name
    .split(" ")
    .map((n) => n[0])
    .join("");

  return (
    <CardWrapper className={cn("relative", className)}>
      <div className="flex flex-col gap-4 pr-8 sm:gap-6 sm:pr-0 lg:flex-row lg:items-start lg:justify-between">
        {/* Left - Avatar and Info */}
        <div className="flex items-start gap-3 sm:gap-4">
          <Avatar className="h-16 w-16 shrink-0 sm:h-20 sm:w-20 lg:h-24 lg:w-24">
            {patient.avatarSrc && <AvatarImage src={patient.avatarSrc} alt={patient.name} />}
            <AvatarFallback className="bg-avatar-fallback text-base font-medium text-white sm:text-lg lg:text-xl">
              {initials}
            </AvatarFallback>
          </Avatar>

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
          className="absolute top-4 right-4 h-8 w-8 shrink-0 sm:relative sm:top-auto sm:right-auto sm:self-start"
          onClick={onMoreClick}
          aria-label="More patient actions"
        >
          <MoreVertical className="h-4 w-4 sm:h-5 sm:w-5" aria-hidden="true" />
        </Button>
      </div>
    </CardWrapper>
  );
}

export type { PatientHeaderProps };
