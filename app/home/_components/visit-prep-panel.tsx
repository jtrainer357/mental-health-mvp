"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/design-system/lib/utils";
import { Badge } from "@/design-system/components/ui/badge";
import { Button } from "@/design-system/components/ui/button";
import { Text } from "@/design-system/components/ui/typography";
import { Pill, AlertTriangle } from "lucide-react";
import { TrendIndicator } from "@/design-system/components/ui/trend-indicator";
import type { AppointmentWithPatient } from "@/src/lib/queries/appointments";
import { buildPrepData } from "@/src/lib/data/visit-prep";

// ── Sub-components ──────────────────────────────────────────────────────

function GoalStatus({ status }: { status: "On Track" | "Partial" | "Not Started" }) {
  return (
    <span
      className={cn(
        "shrink-0 text-[10px] font-bold",
        status === "On Track" && "text-success",
        status === "Partial" && "text-warning-muted",
        status === "Not Started" && "text-muted-foreground"
      )}
    >
      {status}
    </span>
  );
}

// ── Main Component ──────────────────────────────────────────────────────

interface VisitPrepPanelProps {
  appointment: AppointmentWithPatient;
  isExpanded: boolean;
  onEnterVisit?: () => void;
  showEnterVisit?: boolean;
  className?: string;
}

export function VisitPrepPanel({
  appointment,
  isExpanded,
  onEnterVisit,
  showEnterVisit = true,
  className,
}: VisitPrepPanelProps) {
  const prep = React.useMemo(() => buildPrepData(appointment), [appointment]);

  const changeAmount = Math.abs(prep.scorePrev - prep.scoreCurrent);
  const changeLabel =
    prep.direction === "improving"
      ? "improvement"
      : prep.direction === "worsening"
        ? "increase"
        : "stable";

  return (
    <AnimatePresence initial={false}>
      {isExpanded && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
          className={cn("overflow-hidden", className)}
        >
          {/* Divider */}
          <div className="border-border/40 mx-5 border-t" />

          {/* 4-column grid */}
          <div className="grid gap-0 p-5 sm:grid-cols-2 lg:grid-cols-4">
            {/* 01 CURRENT SITUATION */}
            <div className="border-border/30 pr-5 pb-4 sm:border-r sm:pb-0">
              <div className="text-foreground-strong mb-2.5 text-[10px] font-bold tracking-widest uppercase">
                01 &nbsp;Current Situation
              </div>
              <Text size="sm" className="text-foreground mb-2 leading-relaxed">
                {prep.visitDescription}
              </Text>
              <Badge
                variant="outline"
                className="border-teal/20 bg-teal/[0.06] text-teal mb-2 rounded-full px-2.5 py-0.5 text-xs font-semibold"
              >
                {prep.scoreMeasure}: {prep.scoreCurrent} ({prep.severity})
              </Badge>
              {prep.recentMedChange && (
                <Text size="xs" muted className="mt-1.5 leading-relaxed">
                  {prep.recentMedChange}
                </Text>
              )}
            </div>

            {/* 02 KEY BACKGROUND */}
            <div className="border-border/30 pt-4 pr-5 pl-0 sm:pt-0 sm:pl-5 lg:border-r">
              <div className="text-foreground-strong mb-2.5 text-[10px] font-bold tracking-widest uppercase">
                02 &nbsp;Key Background
              </div>
              <Text size="sm" className="text-foreground mb-1 leading-relaxed">
                {prep.dxCode} {prep.dxName}. {prep.referralSource}.
              </Text>
              <Text size="sm" muted className="mb-3 leading-relaxed">
                {prep.therapyType} since {prep.therapySince}.
              </Text>
              <div className="flex flex-wrap gap-1.5">
                {prep.techniques.map((tech) => (
                  <span
                    key={tech}
                    className="border-border bg-muted/40 text-muted-foreground rounded-full border px-2.5 py-0.5 text-[11px]"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </div>

            {/* 03 ACTIVE CARE PLAN */}
            <div className="border-border/30 pt-4 pr-5 pl-0 sm:pl-5 lg:border-r lg:pt-0">
              <div className="text-foreground-strong mb-2.5 text-[10px] font-bold tracking-widest uppercase">
                03 &nbsp;Active Care Plan
              </div>
              {/* Medication card */}
              {prep.medications.length > 0 ? (
                <div className="bg-muted/30 mb-3 flex items-center gap-2.5 rounded-lg px-3 py-2">
                  <Pill className="text-teal h-4 w-4 shrink-0" />
                  <div>
                    <div className="text-foreground text-sm font-semibold">
                      {prep.medications[0]!.name} {prep.medications[0]!.dosage}
                    </div>
                    <div className="text-muted-foreground text-[11px]">
                      Once daily · {prep.medications[0]!.prescriber}
                    </div>
                  </div>
                </div>
              ) : (
                <Text size="sm" muted className="mb-3">
                  No current medications
                </Text>
              )}
              {/* Goals */}
              <Text size="xs" muted className="mb-1.5">
                {prep.goalsSummary}
              </Text>
              <div className="space-y-1">
                {prep.goals.map((goal) => (
                  <div key={goal.label} className="flex items-center justify-between gap-2">
                    <Text size="xs" className="truncate">
                      {goal.label}
                    </Text>
                    <GoalStatus status={goal.status} />
                  </div>
                ))}
              </div>
            </div>

            {/* 04 PROGRESS & NEXT STEPS */}
            <div className="pt-4 pl-0 sm:pl-5 lg:pt-0">
              <div className="text-foreground-strong mb-2.5 text-[10px] font-bold tracking-widest uppercase">
                04 &nbsp;Progress & Next Steps
              </div>
              {/* Score trend */}
              <div className="bg-muted/30 mb-3 flex items-center gap-2.5 rounded-lg px-3 py-2.5">
                <TrendIndicator direction={prep.direction} className="h-5 w-5" />
                <div>
                  <div className="text-foreground text-sm font-semibold">
                    {prep.scoreMeasure}: {prep.scorePrev} → {prep.scoreCurrent}
                  </div>
                  <div className="text-muted-foreground text-[11px]">
                    {changeAmount}-pt {changeLabel} / {prep.scoreDays} days
                  </div>
                </div>
              </div>
              {/* Alerts */}
              {prep.alerts.length > 0 && (
                <div>
                  <div className="text-destructive mb-1.5 text-[10px] font-bold tracking-wider uppercase">
                    Requires Attention
                  </div>
                  {prep.alerts.map((alert) => (
                    <div key={alert} className="mb-1 flex items-start gap-1.5">
                      <AlertTriangle className="text-warning mt-0.5 h-3 w-3 shrink-0" />
                      <Text size="xs" className="leading-snug">
                        {alert}
                      </Text>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Enter Visit — bottom right, only shown for arriving patient */}
          {showEnterVisit && (
            <div className="flex justify-end px-5 pb-4">
              <Button
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onEnterVisit?.();
                }}
                className="h-8 rounded-full px-5 text-xs font-bold"
              >
                Enter Session
              </Button>
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
