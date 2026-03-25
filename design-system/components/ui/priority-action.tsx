"use client";
import * as React from "react";
import Link from "next/link";
import { Card, CardContent } from "@/design-system/components/ui/card";
import { Button } from "@/design-system/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/design-system/components/ui/avatar";
import { Heading, Text } from "@/design-system/components/ui/typography";
import { cn } from "@/design-system/lib/utils";

export interface PriorityActionProps {
  label?: string;
  title: string;
  subtitle: string;
  avatarInitials?: string;
  avatarSrc?: string;
  avatarHref?: string;
  buttonText: string;
  onButtonClick?: () => void;
  secondaryButtonText?: string;
  onSecondaryButtonClick?: () => void;
  className?: string;
}

export function PriorityAction({
  label = "Priority Action",
  title,
  subtitle,
  avatarInitials,
  avatarSrc,
  avatarHref,
  buttonText,
  onButtonClick,
  secondaryButtonText,
  onSecondaryButtonClick,
  className,
}: PriorityActionProps) {
  const avatarElement = (
    <Avatar
      className={cn(
        "h-16 w-16 shrink-0 border-4 border-white sm:h-20 sm:w-20",
        avatarHref && "cursor-pointer transition-opacity hover:opacity-80"
      )}
    >
      {avatarSrc && <AvatarImage src={avatarSrc} />}
      <AvatarFallback className="bg-avatar-fallback text-base text-white sm:text-lg">
        {avatarInitials}
      </AvatarFallback>
    </Avatar>
  );

  return (
    <Card
      className={cn(
        "bg-priority-bg/50 overflow-hidden border-0 shadow-md backdrop-blur-xl transition-all duration-200",
        className
      )}
    >
      <CardContent className="p-6 sm:p-8">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4 sm:gap-5">
            {avatarHref ? (
              <Link href={avatarHref} onClick={(e) => e.stopPropagation()}>
                {avatarElement}
              </Link>
            ) : (
              avatarElement
            )}
            <div className="min-w-0 flex-1">
              <div className="mb-1.5 flex items-center gap-1.5">
                <Text
                  size="xs"
                  muted
                  className="text-xs font-bold tracking-wider uppercase sm:text-sm"
                >
                  {label}
                </Text>
                <div className="bg-primary h-1.5 w-1.5 rounded-full" />
              </div>
              <Heading level={4} className="truncate text-lg sm:text-2xl">
                {title}
              </Heading>
              <Text size="sm" muted className="truncate text-sm sm:text-base">
                {subtitle}
              </Text>
            </div>
          </div>
          <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
            {secondaryButtonText && (
              <Button
                onClick={onSecondaryButtonClick}
                variant="outline"
                size="lg"
                className="w-full sm:w-auto"
              >
                {secondaryButtonText}
              </Button>
            )}
            <Button onClick={onButtonClick} size="lg" className="w-full sm:w-auto">
              {buttonText}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
