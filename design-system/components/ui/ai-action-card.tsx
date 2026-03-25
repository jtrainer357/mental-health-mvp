"use client";

import * as React from "react";
import Link from "next/link";
import { Check } from "lucide-react";
import { Card, CardContent } from "@/design-system/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/design-system/components/ui/avatar";
import { Badge } from "@/design-system/components/ui/badge";
import { cn } from "@/design-system/lib/utils";

type ActionBadgeVariant = "default" | "success" | "warning" | "urgent";

interface AIActionCardProps {
  patientName: string;
  avatarSrc?: string;
  avatarHref?: string;
  mainAction: string;
  statusIndicators: string;
  readyStatus: string;
  suggestedActions?: number;
  badgeText: string;
  badgeVariant?: ActionBadgeVariant;
  completed?: boolean;
  className?: string;
}

export function AIActionCard({
  patientName,
  avatarSrc,
  avatarHref,
  mainAction,
  statusIndicators,
  readyStatus,
  suggestedActions,
  badgeText,
  badgeVariant = "default",
  completed = false,
  className,
}: AIActionCardProps) {
  const initials = patientName
    .split(" ")
    .map((n) => n[0])
    .join("");

  const badgeStyles = {
    default: "bg-stone-100 text-stone-600 border-stone-200",
    success: "bg-emerald-50 text-emerald-700 border-emerald-200",
    warning: "bg-amber-50 text-amber-700 border-amber-200",
    urgent: "bg-red-50 text-red-600 border-red-200",
  };

  return (
    <Card
      opacity="solid"
      className={cn(
        "border-0 shadow-md transition-all duration-200",
        completed && "border-teal/50 bg-teal/5 border-2",
        className
      )}
    >
      <CardContent className="relative p-4 sm:p-5">
        {/* Responsive layout: flex on mobile, table on larger screens */}
        <div className="flex flex-col gap-3 sm:table sm:w-full sm:table-fixed">
          {/* Avatar column - fixed width with gap */}
          <div className="flex items-center gap-3 sm:table-cell sm:w-[100px] sm:align-middle">
            <div className="relative">
              {avatarHref ? (
                <Link href={avatarHref} onClick={(e) => e.stopPropagation()}>
                  <Avatar
                    className={cn(
                      "h-16 w-16 cursor-pointer border-4 border-white transition-opacity hover:opacity-80 sm:h-20 sm:w-20",
                      completed && "border-teal/30"
                    )}
                  >
                    {avatarSrc && <AvatarImage src={avatarSrc} alt={patientName} />}
                    <AvatarFallback className="bg-avatar-fallback text-base font-semibold text-white sm:text-lg">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                </Link>
              ) : (
                <Avatar
                  className={cn(
                    "h-16 w-16 border-4 border-white sm:h-20 sm:w-20",
                    completed && "border-teal/30"
                  )}
                >
                  {avatarSrc && <AvatarImage src={avatarSrc} alt={patientName} />}
                  <AvatarFallback className="bg-avatar-fallback text-base font-semibold text-white sm:text-lg">
                    {initials}
                  </AvatarFallback>
                </Avatar>
              )}
            </div>
          </div>

          {/* Content column - takes remaining space */}
          <div className="sm:table-cell sm:align-middle">
            {/* Patient Name */}
            <div
              className={cn(
                "text-card-foreground truncate text-base font-bold sm:text-lg",
                completed && "text-teal-dark"
              )}
            >
              {patientName}
            </div>

            {/* Main Action */}
            <div
              className={cn(
                "text-card-foreground truncate text-sm sm:text-base",
                completed && "text-stone-500"
              )}
            >
              {completed ? "Actions completed" : mainAction}
            </div>

            {/* Status Indicators */}
            <div
              className={cn(
                "text-muted-foreground mt-0.5 truncate text-sm",
                completed && "text-stone-400"
              )}
            >
              {completed ? "All suggested actions have been executed" : statusIndicators}
            </div>

            {/* Ready Status */}
            <div className="mt-2 flex items-center gap-2">
              {completed ? (
                <>
                  <div className="bg-teal flex h-5 w-5 shrink-0 items-center justify-center rounded-full">
                    <Check className="h-3 w-3 text-white" />
                  </div>
                  <span className="text-teal-dark text-sm font-medium">Completed successfully</span>
                </>
              ) : (
                <>
                  <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-stone-300 bg-white">
                    <Check className="h-3 w-3 text-stone-500" />
                  </div>
                  <span className="text-card-foreground truncate text-sm">
                    {readyStatus}
                    {suggestedActions && suggestedActions > 0 && (
                      <span className="text-primary ml-2 cursor-pointer hover:underline">
                        + {suggestedActions} suggested action{suggestedActions > 1 ? "s" : ""}
                      </span>
                    )}
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Badge column - fixed width, positioned with flex */}
          <div className="absolute top-4 right-4 sm:static sm:table-cell sm:w-[120px] sm:pl-3 sm:align-top">
            <div className="flex justify-end sm:justify-end">
              <Badge
                variant="outline"
                className={cn(
                  "rounded-md border px-2 py-0.5 text-[10px] font-bold tracking-wide whitespace-nowrap sm:text-xs",
                  completed ? "border-teal bg-teal/10 text-teal-dark" : badgeStyles[badgeVariant]
                )}
              >
                {completed ? "COMPLETED" : badgeText}
              </Badge>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
