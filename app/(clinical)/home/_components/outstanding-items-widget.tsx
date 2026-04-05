"use client";

import * as React from "react";
import { ClipboardList } from "lucide-react";
import { OutstandingCard } from "@/design-system/components/ui/outstanding-card";
import { cn } from "@/design-system/lib/utils";

interface OutstandingItemsWidgetProps {
  className?: string;
}

export function OutstandingItemsWidget({ className }: OutstandingItemsWidgetProps) {
  return (
    <OutstandingCard
      title="Outstanding Items"
      count={14}
      subtitle="Needs attention by 5 PM"
      buttonText="Get Started"
      icon={ClipboardList}
      className={cn(className)}
    />
  );
}
