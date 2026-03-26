"use client";

import * as React from "react";
import { ClipboardList, LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/design-system/components/ui/card";
import { Button } from "@/design-system/components/ui/button";
import { Heading, Text } from "@/design-system/components/ui/typography";
import { cn } from "@/design-system/lib/utils";

interface OutstandingCardProps {
  title?: string;
  count: number;
  suffix?: string;
  subtitle: string;
  buttonText?: string;
  onButtonClick?: () => void;
  icon?: LucideIcon;
  className?: string;
}

export function OutstandingCard({
  title = "Outstanding Items",
  count,
  suffix,
  subtitle,
  buttonText = "Get Started",
  onButtonClick,
  icon: Icon = ClipboardList,
  className,
}: OutstandingCardProps) {
  return (
    <Card className={cn("bg-popover overflow-hidden rounded-xl", className)}>
      <CardContent className="p-4 sm:p-6">
        <div className="mb-4 flex flex-row items-center justify-between gap-2">
          <Heading level={4} className="text-base sm:text-lg">
            {title}
          </Heading>
          <Button
            variant="outline"
            size="sm"
            className="h-9 shrink-0 rounded-full px-4 text-xs font-bold"
            onClick={onButtonClick}
          >
            {buttonText}
          </Button>
        </div>
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="border-card-border-subtle flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border-[0.5px] sm:h-12 sm:w-12">
            <Icon className="text-muted-foreground h-5 w-5 sm:h-6 sm:w-6" />
          </div>
          <div>
            <span className="text-foreground-strong text-4xl font-light tracking-tight">
              {count}
              {suffix}
            </span>
            <Text size="xs" muted className="mt-0.5 font-bold tracking-widest uppercase">
              {subtitle}
            </Text>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
