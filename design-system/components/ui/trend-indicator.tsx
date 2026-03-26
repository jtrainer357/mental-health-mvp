import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { cn } from "@/design-system/lib/utils";

type TrendDirection = "up" | "down" | "flat" | "improving" | "worsening" | "stable";

interface TrendIndicatorProps {
  direction: TrendDirection;
  className?: string;
}

const normalizeDirection = (d: TrendDirection): "up" | "down" | "flat" => {
  if (d === "improving") return "up";
  if (d === "worsening") return "down";
  if (d === "stable") return "flat";
  return d;
};

export function TrendIndicator({ direction, className }: TrendIndicatorProps) {
  const normalized = normalizeDirection(direction);
  const Icon = normalized === "up" ? TrendingUp : normalized === "down" ? TrendingDown : Minus;
  const color =
    normalized === "up"
      ? "text-success"
      : normalized === "down"
        ? "text-destructive"
        : "text-muted-foreground";
  return <Icon className={cn("h-4 w-4", color, className)} />;
}
