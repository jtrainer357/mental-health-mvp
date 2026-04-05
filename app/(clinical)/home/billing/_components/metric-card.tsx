/**
 * MetricCard — Billing metric display card with status indicator
 */

import * as React from "react";
import { TrendingUp } from "lucide-react";
import { CardWrapper } from "@/design-system/components/ui/card-wrapper";
import { Heading, Text } from "@/design-system/components/ui/typography";

export interface MetricCardProps {
  title: string;
  value: string;
  subtitle: string;
  icon: React.ElementType;
  status: "good" | "needs-improvement" | "critical";
  trend?: string;
  trendUp?: boolean;
}

export function MetricCard({
  title,
  value,
  subtitle,
  icon: Icon,
  status,
  trend,
  trendUp,
}: MetricCardProps) {
  const valueColor =
    status === "good"
      ? "text-teal-dark"
      : status === "needs-improvement"
        ? "text-primary"
        : "text-destructive";

  const borderColor =
    status === "good"
      ? "border-teal-dark/40"
      : status === "needs-improvement"
        ? "border-primary/40"
        : "border-destructive/40";

  const leftBorderColor =
    status === "good"
      ? "border-l-teal-dark/60"
      : status === "needs-improvement"
        ? "border-l-primary/60"
        : "border-l-destructive/60";

  return (
    <CardWrapper className={`border border-l-4 bg-white/90 p-6 ${borderColor} ${leftBorderColor}`}>
      <div className="flex items-start gap-3">
        <div className="text-teal-dark mt-0.5">
          <Icon className="h-5 w-5" />
        </div>
        <div className="flex-1">
          <Text size="sm" className="text-foreground font-medium">
            {title}
          </Text>
          <div className="mt-1 flex items-baseline gap-2">
            <Heading level={2} className={`text-4xl ${valueColor}`}>
              {value}
            </Heading>
          </div>
          <Text size="sm" muted className="mt-2">
            {subtitle}
          </Text>
          {trend && (
            <div className="mt-2 flex items-center gap-1">
              <TrendingUp
                className={`h-4 w-4 ${trendUp ? "text-success" : "text-destructive rotate-180"}`}
              />
              <Text size="xs" className={trendUp ? "text-success" : "text-destructive"}>
                {trend}
              </Text>
            </div>
          )}
        </div>
      </div>
    </CardWrapper>
  );
}
