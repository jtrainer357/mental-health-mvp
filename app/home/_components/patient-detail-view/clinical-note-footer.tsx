"use client";

import { Button } from "@/design-system/components/ui/button";
import { cn } from "@/design-system/lib/utils";

// ─── Props ──────────────────────────────────────────────────────────────────

interface ClinicalNoteFooterProps {
  isFullView: boolean;
  sidebarWidth?: string;
}

// ─── Component ──────────────────────────────────────────────────────────────

export function ClinicalNoteFooter({
  isFullView,
  sidebarWidth = "440px",
}: ClinicalNoteFooterProps) {
  return (
    <div
      className={cn(
        "flex shrink-0 flex-col items-stretch gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6",
        isFullView && `lg:pl-[calc(${sidebarWidth}+2.5rem)]`
      )}
    >
      <div className="flex items-center gap-3">
        <Button variant="outline" size="sm" className="w-full sm:w-auto">
          Save Draft
        </Button>
        <Button variant="outline" size="sm" className="w-full sm:w-auto">
          Discard AI Note
        </Button>
      </div>
      <Button variant="default" size="lg" className="w-full text-base font-bold sm:w-auto">
        Sign & Approve Note
      </Button>
    </div>
  );
}
