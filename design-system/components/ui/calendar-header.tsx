"use client";

import * as React from "react";
import { ChevronLeft, ChevronRight, Search, ChevronDown } from "lucide-react";
import { cn } from "@/design-system/lib/utils";
import { Button } from "./button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./dropdown-menu";
import { format } from "date-fns";

export type CalendarViewType = "day" | "week" | "month";

interface CalendarHeaderProps {
  currentDate: Date;
  dateRange?: string;
  viewType: CalendarViewType;
  onViewTypeChange?: (view: CalendarViewType) => void;
  onPrevious?: () => void;
  onNext?: () => void;
  onToday?: () => void;
  onSearch?: () => void;
  className?: string;
}

export function CalendarHeader({
  currentDate,
  dateRange,
  viewType,
  onViewTypeChange,
  onPrevious,
  onNext,
  onToday,
  onSearch,
  className,
}: CalendarHeaderProps) {
  const viewLabels: Record<CalendarViewType, string> = {
    day: "Day view",
    week: "Week view",
    month: "Month view",
  };

  return (
    <div
      className={cn(
        "flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between",
        className
      )}
    >
      {/* Left side - Date info */}
      <div className="flex items-center gap-3">
        <div className="border-border bg-card flex h-14 w-14 flex-col items-center justify-center rounded-lg border">
          <span className="text-muted-foreground text-[10px] font-medium uppercase">
            {format(currentDate, "MMM")}
          </span>
          <span className="text-xl font-semibold">{format(currentDate, "d")}</span>
        </div>
        <div>
          <h2 className="text-lg font-semibold">{format(currentDate, "MMMM yyyy")}</h2>
          {dateRange && <p className="text-muted-foreground text-sm">{dateRange}</p>}
        </div>
      </div>

      {/* Right side - Controls */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Search */}
        <Button variant="ghost" size="icon" onClick={onSearch} className="h-11 w-11">
          <Search className="h-4 w-4" />
          <span className="sr-only">Search events</span>
        </Button>

        {/* Navigation */}
        <div className="border-border flex items-center rounded-lg border">
          <Button
            variant="ghost"
            size="icon"
            onClick={onPrevious}
            className="h-11 w-11 rounded-r-none"
          >
            <ChevronLeft className="h-4 w-4" />
            <span className="sr-only">Previous</span>
          </Button>
          <Button
            variant="ghost"
            onClick={onToday}
            className="border-border h-11 rounded-none border-x px-4"
          >
            Today
          </Button>
          <Button variant="ghost" size="icon" onClick={onNext} className="h-11 w-11 rounded-l-none">
            <ChevronRight className="h-4 w-4" />
            <span className="sr-only">Next</span>
          </Button>
        </div>

        {/* View selector — only shown when onViewTypeChange is provided */}
        {onViewTypeChange && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="h-11 gap-2 px-3">
                {viewLabels[viewType]}
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onViewTypeChange("day")}>Day view</DropdownMenuItem>
              <DropdownMenuItem onClick={() => onViewTypeChange("week")}>
                Week view
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onViewTypeChange("month")}>
                Month view
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </div>
  );
}
