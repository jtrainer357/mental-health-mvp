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
import { PATIENTS as SYNTHETIC_PATIENTS } from "@/src/lib/data/patients";
import { PRIORITY_ACTIONS as SYNTHETIC_PRIORITY_ACTIONS } from "@/src/lib/data/priority-actions";
import { APPOINTMENTS } from "@/src/lib/data/appointments";
import { getExternalIdFromUUID } from "@/src/lib/data/adapter";

// ── Prep data ───────────────────────────────────────────────────────────

interface PrepData {
  // Section 1: Current Situation
  visitDescription: string;
  dxCode: string;
  dxName: string;
  scoreMeasure: string;
  scoreCurrent: number;
  severity: string;
  recentMedChange: string | null;
  // Section 2: Key Background
  referralSource: string;
  therapyType: string;
  therapySince: string;
  techniques: string[];
  // Section 3: Care Plan
  medications: { name: string; dosage: string; prescriber: string }[];
  goalsSummary: string;
  goals: { label: string; status: "On Track" | "Partial" | "Not Started" }[];
  // Section 4: Progress
  scorePrev: number;
  scoreDays: number;
  direction: "improving" | "worsening" | "stable";
  alerts: string[];
}

const therapyMap: Record<string, { type: string; techniques: string[] }> = {
  "F41.1": { type: "CBT", techniques: ["Cognitive restructuring", "Exposure", "Relaxation"] },
  "F33.1": {
    type: "CBT + BA",
    techniques: ["Activity scheduling", "Thought records", "Mindfulness"],
  },
  "F32.1": {
    type: "CBT + BA",
    techniques: ["Activity scheduling", "Thought records", "Mindfulness"],
  },
  "F43.10": {
    type: "CPT / PE",
    techniques: ["Cognitive processing", "Exposure therapy", "Grounding"],
  },
  "F31.81": {
    type: "DBT-informed",
    techniques: ["Mood tracking", "Distress tolerance", "Interpersonal"],
  },
  "F50.2": {
    type: "CBT-E",
    techniques: ["Food diary", "Body image work", "Behavioral experiments"],
  },
  "F64.0": {
    type: "Affirmative",
    techniques: ["Identity exploration", "Family systems", "Resilience"],
  },
  "F10.20": {
    type: "MI + CBT",
    techniques: ["Motivational interviewing", "Relapse prevention", "Coping"],
  },
  "F40.10": {
    type: "Exposure + CBT",
    techniques: ["Exposure hierarchy", "Restructuring", "Breathing"],
  },
};

const referralSources = [
  "Self-referred",
  "PCP referral",
  "Referred via EAP",
  "Insurance referral",
  "Family referral",
  "Previous provider",
];

const goalsByDx: Record<
  string,
  { label: string; status: "On Track" | "Partial" | "Not Started" }[]
> = {
  "F41.1": [
    { label: "Reduce anxiety symptoms", status: "On Track" },
    { label: "Improve stress coping", status: "Partial" },
    { label: "Decrease avoidance", status: "On Track" },
  ],
  "F33.1": [
    { label: "Improve mood stability", status: "On Track" },
    { label: "Increase social engagement", status: "Partial" },
    { label: "Maintain sleep hygiene", status: "On Track" },
  ],
  "F43.10": [
    { label: "Process traumatic memories", status: "On Track" },
    { label: "Reduce hypervigilance", status: "Partial" },
    { label: "Improve daily functioning", status: "On Track" },
  ],
  "F32.1": [
    { label: "Improve mood stability", status: "On Track" },
    { label: "Increase activity levels", status: "Partial" },
    { label: "Strengthen coping skills", status: "Not Started" },
  ],
};

function buildPrepData(apt: AppointmentWithPatient): PrepData {
  const patientId = apt.patient.id;
  const externalId = getExternalIdFromUUID(patientId) || patientId;
  const fullPatient = SYNTHETIC_PATIENTS.find((p) => p.id === externalId || p.id === patientId);
  const priorityActions = SYNTHETIC_PRIORITY_ACTIONS.filter(
    (pa) => pa.patient_id === externalId && pa.status === "pending"
  );

  const dxCode = fullPatient?.primary_diagnosis_code || "F41.1";
  const dxName = fullPatient?.primary_diagnosis_name || "Generalized Anxiety Disorder";
  const riskLevel = apt.patient.risk_level || "low";
  const medications = fullPatient?.medications || [];
  const treatmentStart = fullPatient?.treatment_start_date || "2025-06-01";
  const hash = patientId.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);

  // Score data
  const scoreBase = riskLevel === "high" ? 16 : riskLevel === "medium" ? 11 : 7;
  const scoreCurrent = Math.max(3, scoreBase - (hash % 5));
  const scorePrev = scoreCurrent + 2 + (hash % 4);
  const scoreMeasure = dxCode.startsWith("F43")
    ? "PCL-5"
    : dxCode.startsWith("F41")
      ? "GAD-7"
      : "PHQ-9";
  const maxScore = scoreMeasure === "PCL-5" ? 80 : scoreMeasure === "GAD-7" ? 21 : 27;
  const severity =
    scoreCurrent / maxScore > 0.6
      ? "Severe"
      : scoreCurrent / maxScore > 0.4
        ? "Moderate"
        : scoreCurrent / maxScore > 0.2
          ? "Mild"
          : "Minimal";
  const direction: PrepData["direction"] =
    scoreCurrent < scorePrev ? "improving" : scoreCurrent > scorePrev ? "worsening" : "stable";
  const scoreDays = 30 + (hash % 30);

  // Dates
  const lastAppt =
    APPOINTMENTS.filter((a) => a.patient_id === externalId && a.status === "Completed").sort(
      (a, b) => b.date.localeCompare(a.date)
    )[0]?.date || "2026-01-28";
  const lastSeenStr = new Date(lastAppt).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
  const startDate = new Date(treatmentStart);
  const therapySinceStr = startDate.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  const therapy = therapyMap[dxCode] || therapyMap["F41.1"]!;
  const refSource = referralSources[hash % referralSources.length]!;

  // Recent med change
  const recentMedChange = medications.length > 0 ? `Current: ${medications[0]}` : null;

  // Goals
  const goals = goalsByDx[dxCode] || [
    { label: "Symptom reduction", status: "On Track" as const },
    { label: "Improve coping skills", status: "Partial" as const },
    { label: "Enhance functioning", status: "On Track" as const },
  ];
  const onTrack = goals.filter((g) => g.status === "On Track").length;
  const partial = goals.filter((g) => g.status === "Partial").length;
  const notStarted = goals.filter((g) => g.status === "Not Started").length;
  const parts = [];
  if (onTrack) parts.push(`${onTrack} on track`);
  if (partial) parts.push(`${partial} partial`);
  if (notStarted) parts.push(`${notStarted} not started`);

  // Alerts
  const alerts = priorityActions
    .filter((pa) => pa.urgency === "urgent" || pa.urgency === "high")
    .map((pa) => pa.title)
    .slice(0, 2);

  return {
    visitDescription: `Follow-up ${apt.service_type.toLowerCase()}, last seen ${lastSeenStr}. Active dx: ${dxCode}.`,
    dxCode,
    dxName,
    scoreMeasure,
    scoreCurrent,
    severity,
    recentMedChange,
    referralSource: refSource,
    therapyType: therapy.type,
    therapySince: therapySinceStr,
    techniques: therapy.techniques,
    medications: medications.map((med) => {
      const parts = med.split(" ");
      return {
        name: parts.slice(0, -1).join(" ") || med,
        dosage: parts[parts.length - 1] || "",
        prescriber: "Dr. Demo",
      };
    }),
    goalsSummary: `${goals.length} goals: ${parts.join(", ")}`,
    goals,
    scorePrev,
    scoreDays,
    direction,
    alerts,
  };
}

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
