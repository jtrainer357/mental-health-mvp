"use client";

import * as React from "react";
import { motion } from "framer-motion";
import {
  Pill,
  Target,
  TrendingDown,
  TrendingUp,
  Minus,
  FileText,
  Shield,
  Activity,
} from "lucide-react";
import { Card } from "@/design-system/components/ui/card";
import { CardWrapper } from "@/design-system/components/ui/card-wrapper";
import { Badge } from "@/design-system/components/ui/badge";
import { Text } from "@/design-system/components/ui/typography";
import { cn } from "@/design-system/lib/utils";
import { expoOut as expoOutEase } from "@/design-system/lib/animation-constants";
import type { PatientDetail } from "./types";
import type { SelectedActivity } from "./types";

// ─── Animation ─────────────────────────────────────────────────────────────

const sidebarVariants = {
  hidden: { opacity: 0, x: -30 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.5, ease: expoOutEase, delay: 0.15 },
  },
};

// ─── Sub-components ─────────────────────────────────────────────────────────

function SidebarSectionHeader({
  number,
  title,
  icon: Icon,
}: {
  number: string;
  title: string;
  icon: React.ElementType;
}) {
  return (
    <div className="mb-3 flex items-center gap-2">
      <div className="bg-primary/10 flex h-6 w-6 items-center justify-center rounded-lg">
        <Icon className="text-primary h-3.5 w-3.5" />
      </div>
      <Text size="xs" className="font-bold tracking-wide uppercase">
        <span className="text-primary mr-1">{number}</span>
        {title}
      </Text>
    </div>
  );
}

function OutcomeTrendRow({
  label,
  score,
  change,
}: {
  label: string;
  score: number;
  change: number;
}) {
  return (
    <div className="flex items-center justify-between py-1.5">
      <div className="flex items-center gap-2.5">
        <Text size="xs" className="font-semibold">
          {label}
        </Text>
        <div className="flex items-end gap-[2px]">
          {[0.3, 0.5, 0.45, 0.65, 0.85].map((h, i) => (
            <div
              key={i}
              className={cn(
                "w-[3px] rounded-sm",
                i === 4 ? "bg-foreground/40" : "bg-foreground/15"
              )}
              style={{ height: `${h * 14}px` }}
            />
          ))}
        </div>
      </div>
      <div className="flex items-center gap-2.5">
        <Text size="sm" className="font-bold">
          {score}
        </Text>
        <div
          className={cn(
            "flex items-center gap-0.5 rounded-md px-1.5 py-0.5 text-sm font-bold",
            change < 0
              ? "bg-success/10 text-success"
              : change > 0
                ? "bg-warning/10 text-warning"
                : "bg-muted text-muted-foreground"
          )}
        >
          {change < 0 ? (
            <TrendingDown className="h-3 w-3" />
          ) : change > 0 ? (
            <TrendingUp className="h-3 w-3" />
          ) : (
            <Minus className="h-3 w-3" />
          )}
          {Math.abs(change)}
        </div>
      </div>
    </div>
  );
}

// ─── Props ──────────────────────────────────────────────────────────────────

interface ClinicalNoteSidebarProps {
  patient: PatientDetail;
  activity: SelectedActivity;
  sessionNum: number;
  otherVisits: SelectedActivity[];
}

// ─── Component ──────────────────────────────────────────────────────────────

export function ClinicalNoteSidebar({
  patient,
  activity,
  sessionNum,
  otherVisits,
}: ClinicalNoteSidebarProps) {
  return (
    <motion.aside
      variants={sidebarVariants}
      initial="hidden"
      animate="visible"
      className="w-full shrink-0 lg:w-[440px]"
    >
      <CardWrapper className="space-y-2">
        {/* 01 Current Situation */}
        <Card className="border-border/40 p-4 shadow-sm">
          <SidebarSectionHeader number="01" title="Current Situation" icon={Activity} />
          <Text size="xs" className="text-foreground/70 leading-relaxed">
            {activity.appointmentType || "Individual Therapy"}, last seen{" "}
            {otherVisits[0]?.date || "recently"}.{" "}
            {patient.primaryDiagnosisCode && (
              <>
                Active dx: {patient.primaryDiagnosisName} {patient.primaryDiagnosisCode}.{" "}
              </>
            )}
            {patient.riskLevel === "high" && "Elevated risk level. "}
            {patient.medications && patient.medications.length > 0 && (
              <>Current meds: {patient.medications.join(", ")}.</>
            )}
          </Text>
          <div className="bg-muted/40 mt-3 rounded-lg px-3 py-2">
            <Text
              size="xs"
              className="text-muted-foreground mb-1 text-sm font-bold tracking-wider uppercase"
            >
              Problem List
            </Text>
            <Text size="xs" className="text-foreground/60 font-medium">
              {[
                patient.primaryDiagnosisCode &&
                  `${patient.primaryDiagnosisName} ${patient.primaryDiagnosisCode}`,
                patient.secondaryDiagnosisCode &&
                  `${patient.secondaryDiagnosisName} ${patient.secondaryDiagnosisCode}`,
              ]
                .filter(Boolean)
                .join(" · ") || "No active diagnoses"}
            </Text>
          </div>
        </Card>

        {/* 02 Key Background */}
        <Card className="border-border/40 p-4 shadow-sm">
          <SidebarSectionHeader number="02" title="Key Background" icon={FileText} />
          <Text size="xs" className="text-foreground/70 leading-relaxed">
            {patient.primaryDiagnosisCode && <>{patient.primaryDiagnosisCode}. </>}
            {patient.provider || "Dr. Sarah Chen"} since{" "}
            {patient.treatmentStartDate
              ? new Date(patient.treatmentStartDate).toLocaleDateString("en-US", {
                  month: "short",
                  year: "numeric",
                })
              : "recently"}
            .
          </Text>
          {patient.medications && patient.medications.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {patient.medications.map((med) => (
                <motion.span
                  key={med}
                  className="bg-muted/50 border-border/40 rounded-full border px-3 py-1 text-sm font-medium"
                  whileHover={{ scale: 1.03 }}
                >
                  {med}
                </motion.span>
              ))}
            </div>
          )}
          <div className="mt-3">
            <Text
              size="xs"
              className="text-muted-foreground mb-1.5 text-sm font-bold tracking-wider uppercase"
            >
              Risk Level
            </Text>
            <Badge
              variant="outline"
              className={cn(
                "rounded-md px-2 py-0.5 text-sm font-semibold",
                patient.riskLevel === "high"
                  ? "border-destructive/30 bg-destructive/10 text-destructive"
                  : patient.riskLevel === "medium"
                    ? "border-warning/30 bg-warning/10 text-warning"
                    : "border-success/30 bg-success/10 text-success"
              )}
            >
              {patient.riskLevel === "high"
                ? "High"
                : patient.riskLevel === "medium"
                  ? "Medium"
                  : "Low"}
            </Badge>
          </div>
        </Card>

        {/* Recent Notes */}
        <Card className="border-border/40 p-4 shadow-sm">
          <div className="mb-3 flex items-center gap-2">
            <div className="bg-primary/10 flex h-6 w-6 items-center justify-center rounded-lg">
              <FileText className="text-primary h-3.5 w-3.5" />
            </div>
            <Text size="xs" className="font-bold tracking-wide uppercase">
              Recent Notes
            </Text>
          </div>
          <div className="space-y-2.5">
            {otherVisits.map((visit, i) => (
              <motion.div
                key={visit.id}
                className="bg-muted/30 border-l-primary/40 rounded-r-lg border-l-2 py-2 pr-2 pl-3"
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 * i, duration: 0.3 }}
              >
                <div className="flex items-baseline gap-2">
                  <Text size="xs" className="text-primary font-bold">
                    {visit.date}
                  </Text>
                  <Text size="xs" className="text-muted-foreground font-medium">
                    Session #{sessionNum - (i + 1)}
                  </Text>
                </div>
                <Text size="xs" className="text-foreground/55 mt-0.5 line-clamp-2 leading-relaxed">
                  {visit.description || visit.title}
                </Text>
              </motion.div>
            ))}
          </div>
        </Card>

        {/* 03 Active Care Plan */}
        <Card className="border-border/40 p-4 shadow-sm">
          <SidebarSectionHeader number="03" title="Active Care Plan" icon={Shield} />
          <div className="space-y-2.5">
            {patient.medications && patient.medications.length > 0 ? (
              patient.medications.map((med) => (
                <div key={med} className="bg-muted/30 flex items-start gap-2.5 rounded-lg p-2.5">
                  <div className="bg-primary/10 mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg">
                    <Pill className="text-primary h-3.5 w-3.5" />
                  </div>
                  <div>
                    <Text size="xs" className="font-bold">
                      {med}
                    </Text>
                    <Text size="xs" className="text-muted-foreground">
                      {patient.provider || "Dr. Sarah Chen"}
                    </Text>
                  </div>
                </div>
              ))
            ) : (
              <Text size="xs" className="text-muted-foreground italic">
                No current medications
              </Text>
            )}
          </div>

          {patient.primaryDiagnosisName && (
            <div className="border-border/30 mt-3 border-t pt-3">
              <Text size="xs" className="text-muted-foreground mb-2">
                Treatment focus: {patient.primaryDiagnosisName}
              </Text>
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Target className="text-muted-foreground h-3.5 w-3.5" />
                    <Text size="xs" className="font-medium">
                      Symptom reduction
                    </Text>
                  </div>
                  <Badge
                    variant="outline"
                    className="border-border/50 text-muted-foreground rounded-md px-2 py-0 text-sm font-medium"
                  >
                    In Progress
                  </Badge>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Target className="text-muted-foreground h-3.5 w-3.5" />
                    <Text size="xs" className="font-medium">
                      Functional improvement
                    </Text>
                  </div>
                  <Badge
                    variant="outline"
                    className="border-border/50 text-muted-foreground rounded-md px-2 py-0 text-sm font-medium"
                  >
                    In Progress
                  </Badge>
                </div>
              </div>
            </div>
          )}
        </Card>

        {/* 04 Outcome Trends */}
        <Card className="border-border/40 p-4 shadow-sm">
          <SidebarSectionHeader number="04" title="Outcome Trends" icon={TrendingDown} />
          <div className="bg-muted/30 rounded-lg px-3 py-2">
            {(() => {
              const measures = patient.outcomeMeasures || [];
              const byType = new Map<string, PatientDetail["outcomeMeasures"]>();
              measures.forEach((m) => {
                if (!m) return;
                const existing = byType.get(m.measureType) || [];
                existing.push(m);
                byType.set(m.measureType, existing);
              });
              const rows: { label: string; score: number; change: number }[] = [];
              byType.forEach((ms, type) => {
                if (!ms || ms.length === 0) return;
                const sorted = [...ms].sort((a, b) =>
                  b.measurementDate.localeCompare(a.measurementDate)
                );
                const latest = sorted[0]!;
                const previous = sorted[1];
                const change =
                  previous && latest.score !== null && previous.score !== null
                    ? latest.score - previous.score
                    : 0;
                rows.push({ label: type, score: latest.score ?? 0, change });
              });
              if (rows.length === 0) {
                return (
                  <Text size="xs" className="text-muted-foreground py-1 italic">
                    No outcome measures recorded
                  </Text>
                );
              }
              return rows.map((row, i) => (
                <React.Fragment key={row.label}>
                  {i > 0 && <div className="border-border/20 my-1 border-t" />}
                  <OutcomeTrendRow label={row.label} score={row.score} change={row.change} />
                </React.Fragment>
              ));
            })()}
          </div>
        </Card>
      </CardWrapper>
    </motion.aside>
  );
}
