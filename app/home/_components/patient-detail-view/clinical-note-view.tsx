"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Maximize2,
  Minimize2,
  Check,
  Pencil,
  RotateCcw,
  Pill,
  Target,
  TrendingDown,
  TrendingUp,
  Minus,
  FileText,
  Shield,
  Zap,
  Activity,
} from "lucide-react";
import { Card } from "@/design-system/components/ui/card";
import { CardWrapper } from "@/design-system/components/ui/card-wrapper";
import { Badge } from "@/design-system/components/ui/badge";
import { Button } from "@/design-system/components/ui/button";
import { Heading, Text } from "@/design-system/components/ui/typography";
import { cn } from "@/design-system/lib/utils";
import { usePatientViewNavigation, useViewState } from "@/src/lib/stores/patient-view-store";
import type { PatientDetail } from "./types";

// ─── Animation ───────────────────────────────────────────────────────────────

const smoothEase: [number, number, number, number] = [0.25, 0.1, 0.25, 1.0];
const expoOutEase: [number, number, number, number] = [0.16, 1, 0.3, 1];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.06, delayChildren: 0.12 },
  },
};

const sectionVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.35, ease: smoothEase },
  },
};

const headerVariants = {
  hidden: { opacity: 0, y: -10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: smoothEase },
  },
};

const sidebarVariants = {
  hidden: { opacity: 0, x: -30 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.5, ease: expoOutEase, delay: 0.15 },
  },
};

// ─── Types ───────────────────────────────────────────────────────────────────

type SelectedActivity = PatientDetail["recentActivity"][number];
type SectionStatus = "machine-generated" | "human-edited" | "accepted";

interface NoteSection {
  key: string;
  label: string;
  prefix: string;
  content: string;
  status: SectionStatus;
  tags?: string[];
}

interface ExtractedAction {
  id: string;
  title: string;
  description: string;
  checked: boolean;
  requiresApproval?: boolean;
}

interface ClinicalNoteViewProps {
  activity: SelectedActivity;
  patientName: string;
  patient?: PatientDetail;
  className?: string;
}

// ─── Data helpers ────────────────────────────────────────────────────────────

function getSessionNumber(activity: SelectedActivity, patient?: PatientDetail): number {
  if (!patient?.recentActivity) return 1;
  const sorted = [...patient.recentActivity].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );
  const idx = sorted.findIndex((a) => a.id === activity.id);
  return idx >= 0 ? idx + 1 : patient.recentActivity.length;
}

function getDAPContent(activity?: SelectedActivity): NoteSection[] {
  // Use real SOAP data if available, mapping S+O→Data, A→Assessment, P→Plan
  if (activity?.subjective && activity?.objective) {
    return [
      {
        key: "data",
        label: "DATA",
        prefix: "D",
        status: "machine-generated",
        content: activity.subjective + "\n\n" + activity.objective,
      },
      {
        key: "assessment",
        label: "ASSESSMENT",
        prefix: "A",
        status: activity.noteStatus === "signed" ? "accepted" : "human-edited",
        content: activity.assessment || "Assessment pending.",
      },
      {
        key: "plan",
        label: "PLAN",
        prefix: "P",
        status: "machine-generated",
        content: activity.plan || "Plan pending.",
      },
    ];
  }

  // Fallback: generic content
  return [
    {
      key: "data",
      label: "DATA",
      prefix: "D",
      status: "machine-generated",
      content:
        "Patient presented for follow-up individual therapy via telehealth. Reports reduced frequency of anxious episodes since implementing RAIN technique (1\u20132\u00d7/week vs. 4\u20135\u00d7/week at intake). Sleep improved to 6\u20137 hrs/night. Continued workplace trigger management; described ongoing tension with direct supervisor as primary stressor. Denied current SI/HI.",
    },
    {
      key: "assessment",
      label: "ASSESSMENT",
      prefix: "A",
      status: "human-edited",
      content:
        "GAD symptoms improving. PHQ-9 decreased from 12 \u2192 8 (Mild). Medication stable on Fluoxetine 40mg. Patient also reports better sleep quality since starting RAIN practice. Increasing engagement with CBT techniques noted.",
    },
    {
      key: "plan",
      label: "PLAN",
      prefix: "P",
      status: "machine-generated",
      content: [
        "Continue weekly individual therapy",
        "Maintain Fluoxetine 40mg",
        "Practice RAIN technique daily",
        "Reduce panic attacks to <1/week (Target: Mar 28, 2026)",
        "Engage in 2 avoided situations/week",
      ].join("\n"),
    },
  ];
}

function getExtractedActions(): ExtractedAction[] {
  return [
    {
      id: "act-1",
      title: "Schedule next session",
      description: "Weekly individual therapy \u2014 next available slot based on current cadence",
      checked: false,
    },
    {
      id: "act-2",
      title: "Send post-session summary to patient",
      description:
        "Patient-facing summary drafted from session content \u2014 review before sending via SMS/portal",
      checked: false,
    },
    {
      id: "act-3",
      title: "Update problem list",
      description:
        "Substrate extracted potential chart updates from session content. Provider review required before changes are written to the patient record.",
      checked: false,
      requiresApproval: true,
    },
    {
      id: "act-4",
      title: "Generate patient payment link",
      description:
        "One-click Apple Pay / credit card link for session balance, staged for SMS delivery on note approval",
      checked: false,
    },
  ];
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: SectionStatus }) {
  const config = {
    "machine-generated": {
      label: "Machine-Generated",
      cls: "bg-teal/10 text-teal border-teal/20",
    },
    "human-edited": {
      label: "Human-Edited",
      cls: "bg-primary/10 text-primary border-primary/20",
    },
    accepted: {
      label: "Accepted",
      cls: "bg-success/15 text-success border-success/20",
    },
  };
  const c = config[status];
  return (
    <Badge
      variant="outline"
      className={cn("rounded-lg px-2.5 py-0.5 text-sm font-semibold tracking-wide", c.cls)}
    >
      {c.label}
    </Badge>
  );
}

function SectionActionBar() {
  return (
    <div className="border-border/30 mt-4 flex items-center gap-1 border-t pt-3">
      <Button
        variant="ghost"
        size="sm"
        className="text-foreground/50 hover:text-foreground hover:bg-muted/60 h-8 gap-1.5 rounded-lg px-3 text-sm font-medium"
      >
        <Check className="h-3.5 w-3.5" />
        Accept
      </Button>
      <Button
        variant="ghost"
        size="sm"
        className="text-foreground/50 hover:text-foreground hover:bg-muted/60 h-8 gap-1.5 rounded-lg px-3 text-sm font-medium"
      >
        <Pencil className="h-3.5 w-3.5" />
        Edit
      </Button>
      <Button
        variant="ghost"
        size="sm"
        className="text-foreground/50 hover:text-foreground hover:bg-muted/60 h-8 gap-1.5 rounded-lg px-3 text-sm font-medium"
      >
        <RotateCcw className="h-3.5 w-3.5" />
        Rewrite
      </Button>
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

// ─── Main Component ──────────────────────────────────────────────────────────

export function ClinicalNoteView({
  activity,
  patientName,
  patient,
  className,
}: ClinicalNoteViewProps) {
  const viewState = useViewState();
  const { goBack, toggleFullView } = usePatientViewNavigation();
  const isFullView = viewState === "fullView";

  const sessionNum = getSessionNumber(activity, patient);
  const sections = getDAPContent(activity);
  const [actions, setActions] = React.useState(getExtractedActions);
  const [cptApproved, setCptApproved] = React.useState(false);

  const otherVisits =
    patient?.recentActivity?.filter((a) => a.id !== activity.id).slice(0, 3) || [];

  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && isFullView) {
        event.preventDefault();
        toggleFullView();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isFullView, toggleFullView]);

  const toggleAction = (id: string) => {
    setActions((prev) => prev.map((a) => (a.id === id ? { ...a, checked: !a.checked } : a)));
  };

  // ─── Patient Context Sidebar ────────────────────────────────────────

  const patientContextSidebar = patient && (
    <motion.aside
      variants={sidebarVariants}
      initial="hidden"
      animate="visible"
      className="w-full shrink-0 lg:w-[440px]"
    >
      <CardWrapper className="space-y-2 lg:overflow-y-auto">
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

  // ─── Render ────────────────────────────────────────────────────────────

  return (
    <motion.div
      className={cn("flex flex-col lg:h-full", className)}
      initial="hidden"
      animate="visible"
    >
      {/* Header — sticky with blur */}
      <motion.div variants={headerVariants} className="mb-4 flex items-center justify-between py-3">
        <div className="flex items-center gap-4">
          <motion.button
            onClick={goBack}
            aria-label="Go back"
            className="bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground flex h-10 w-10 items-center justify-center rounded-xl transition-all"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <ArrowLeft className="h-5 w-5" />
          </motion.button>
          {patient?.avatarSrc ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={patient.avatarSrc}
              alt={patientName}
              className="h-10 w-10 rounded-full object-cover"
            />
          ) : (
            <div className="bg-primary/10 border-primary/20 flex h-10 w-10 items-center justify-center rounded-full border">
              <Text size="sm" className="text-primary font-bold">
                {patientName
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </Text>
            </div>
          )}
          <div>
            <Heading level={4} className="text-lg font-semibold sm:text-xl">
              {patientName} &middot; Session #{sessionNum}
            </Heading>
            <Text size="sm" muted className="mt-0.5">
              {activity.date} &middot; {activity.appointmentType || "Individual Therapy"} &middot;{" "}
              {activity.duration || "50 min"} &middot; {activity.cptCode || "90837"} &middot;{" "}
              {activity.signedBy || patient?.provider || "Dr. Sarah Chen"}
            </Text>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="hidden lg:block"
          >
            <Button
              variant="outline"
              size="sm"
              onClick={toggleFullView}
              className="gap-2 transition-all"
            >
              {isFullView ? (
                <>
                  <Minimize2 className="h-4 w-4" />
                  <span>Exit Full View</span>
                </>
              ) : (
                <>
                  <Maximize2 className="h-4 w-4" />
                  <span>Full View</span>
                </>
              )}
            </Button>
          </motion.div>
        </div>
      </motion.div>

      {/* Mobile full view button */}
      <div className="mb-4 lg:hidden">
        <Button
          variant="outline"
          onClick={toggleFullView}
          className="border-border/50 hover:border-primary/30 hover:bg-primary/5 h-12 w-full gap-2 transition-all"
        >
          {isFullView ? (
            <>
              <Minimize2 className="h-4 w-4" />
              Exit Full View
            </>
          ) : (
            <>
              <Maximize2 className="h-4 w-4" />
              View Full Note
            </>
          )}
        </Button>
      </div>

      {/* Two-column layout */}
      <div
        className={cn(
          "flex-1 pb-20 lg:overflow-y-auto lg:pb-0",
          isFullView && "flex flex-col gap-2 px-4 lg:flex-row"
        )}
      >
        {/* Left: Patient Context Sidebar */}
        {isFullView && patientContextSidebar}

        {/* Center: Session Note */}
        <div className="min-w-0 flex-1">
          <CardWrapper
            className={cn(
              "space-y-5",
              !isFullView && "border-0 bg-transparent px-0 shadow-none backdrop-blur-none"
            )}
          >
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="space-y-5"
            >
              {/* ── DAP Sections ─────────────────────────────────── */}
              {sections.map((section) => (
                <motion.section key={section.key} variants={sectionVariants}>
                  {/* Section header row */}
                  <div className="mb-2.5 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="bg-foreground flex h-7 w-7 items-center justify-center rounded-lg">
                        <Text size="xs" className="text-card font-bold">
                          {section.prefix}
                        </Text>
                      </div>
                      <Text
                        size="xs"
                        className="text-foreground font-bold tracking-wider uppercase"
                      >
                        {section.label}
                      </Text>
                      {section.key === "plan" &&
                        section.tags?.map((tag) => (
                          <Badge
                            key={tag}
                            variant="outline"
                            className="border-primary/20 bg-primary/5 text-primary rounded-md px-2 py-0 text-sm font-medium"
                          >
                            {tag}
                          </Badge>
                        ))}
                    </div>
                  </div>

                  {/* Section content card */}
                  <Card className="border-border/70 bg-card p-5 shadow-sm">
                    {section.key === "plan" ? (
                      <ol className="space-y-2.5">
                        {section.content.split("\n").map((item, i) => (
                          <motion.li
                            key={i}
                            className="flex items-start gap-3"
                            initial={{ opacity: 0, x: -12 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{
                              delay: 0.06 * i,
                              duration: 0.3,
                              ease: smoothEase,
                            }}
                          >
                            <span className="bg-primary/10 text-primary mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-sm font-bold">
                              {i + 1}
                            </span>
                            <Text size="sm" className="text-foreground/80 pt-0.5 leading-relaxed">
                              {item}
                            </Text>
                          </motion.li>
                        ))}
                      </ol>
                    ) : (
                      <Text size="sm" className="text-foreground/80 leading-relaxed">
                        {section.content}
                      </Text>
                    )}

                    {/* Tag pills for assessment section */}
                    {section.key === "assessment" && section.tags && (
                      <div className="mt-4 flex flex-wrap gap-1.5">
                        {section.tags.map((tag) => (
                          <motion.span
                            key={tag}
                            className="bg-muted/50 border-border/40 rounded-full border px-3 py-1 text-sm font-medium"
                            whileHover={{ scale: 1.03 }}
                          >
                            {tag}
                          </motion.span>
                        ))}
                      </div>
                    )}

                    <SectionActionBar />
                  </Card>
                </motion.section>
              ))}

              {/* ── CPT + Extracted Actions side by side ── */}

              <motion.div
                variants={sectionVariants}
                className="grid grid-cols-1 gap-2 lg:grid-cols-2"
              >
                {/* CPT Approval */}
                <Card className="border-border/70 bg-teal/5 flex flex-col overflow-hidden p-0 shadow-sm">
                  <div className="border-border/30 border-b px-5 py-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="bg-warning/10 flex h-6 w-6 items-center justify-center rounded-lg">
                          <Shield className="text-warning h-3.5 w-3.5" />
                        </div>
                        <Text size="xs" className="font-bold tracking-wide uppercase">
                          CPT Code
                        </Text>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-1 flex-col p-5">
                    <div className="flex items-start justify-between">
                      <div>
                        <Text className="text-3xl font-bold tracking-tight">
                          {activity.cptCode || "90837"}
                        </Text>
                        <Text size="xs" className="text-muted-foreground mt-1">
                          {activity.appointmentType || "Individual Therapy"},{" "}
                          {activity.duration || "50 min"}
                        </Text>
                      </div>
                      <div className="bg-muted/50 rounded-lg px-3 py-2 text-right">
                        <Text
                          size="xs"
                          className="text-muted-foreground text-sm font-bold tracking-wider uppercase"
                        >
                          Duration
                        </Text>
                        <Text size="sm" className="font-bold">
                          {activity.duration || "50 min"}
                        </Text>
                      </div>
                    </div>

                    <Card className="bg-card/60 border-border/30 mt-4 flex-1 p-3.5">
                      <Text
                        size="xs"
                        className="text-muted-foreground mb-2 text-sm font-bold tracking-wider uppercase"
                      >
                        Compliance Evidence
                      </Text>
                      <ul className="space-y-1.5">
                        {[
                          `Transcript confirms ${activity.duration || "50 min"} of psychotherapy content`,
                          'Payer requires "counseling vs. medical management" documentation \u2014 auto-inserted',
                          "No up-coding risk detected",
                        ].map((item, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <div className="bg-success mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full" />
                            <Text size="xs" className="text-foreground/65 leading-relaxed">
                              {item}
                            </Text>
                          </li>
                        ))}
                      </ul>
                    </Card>

                    <div className="mt-4">
                      <Button
                        variant="outline"
                        size="lg"
                        onClick={() => setCptApproved(true)}
                        disabled={cptApproved}
                        className={cn(
                          "w-full",
                          cptApproved &&
                            "border-success/30 bg-success/10 text-success hover:bg-success/10"
                        )}
                      >
                        {cptApproved
                          ? `CPT ${activity.cptCode || "90837"} Approved \u2713`
                          : `Approve CPT ${activity.cptCode || "90837"}`}
                      </Button>
                    </div>
                  </div>
                </Card>

                {/* Extracted Actions */}
                <Card className="border-border/70 bg-teal/5 flex flex-col overflow-hidden p-0 shadow-sm">
                  <div className="border-border/30 border-b px-5 py-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="bg-primary/10 flex h-6 w-6 items-center justify-center rounded-lg">
                          <Zap className="text-primary h-3.5 w-3.5" />
                        </div>
                        <Text size="xs" className="font-bold tracking-wide uppercase">
                          Post-Session Actions
                        </Text>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-1 flex-col px-5 pb-5">
                    <div className="divide-border/30 flex-1 divide-y">
                      {actions.map((action, i) => (
                        <motion.div
                          key={action.id}
                          className="flex items-start gap-3 py-3"
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.08 * i, duration: 0.3 }}
                        >
                          <motion.button
                            onClick={() => toggleAction(action.id)}
                            className={cn(
                              "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border-2 transition-all",
                              action.checked
                                ? "border-success bg-success/15 text-success"
                                : "border-border hover:border-primary/40 hover:bg-primary/5"
                            )}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                          >
                            {action.checked && <Check className="h-3 w-3" />}
                          </motion.button>
                          <div className="min-w-0 flex-1">
                            <Text size="xs" className="font-bold">
                              {action.title}
                            </Text>
                            <Text
                              size="xs"
                              className="text-muted-foreground mt-0.5 leading-relaxed"
                            >
                              {action.description}
                            </Text>
                            {action.requiresApproval && (
                              <div className="mt-1 flex items-center gap-1.5">
                                <Shield className="text-warning h-3 w-3" />
                                <Text size="xs" className="text-warning font-medium italic">
                                  Requires provider approval (HITL)
                                </Text>
                              </div>
                            )}
                          </div>
                        </motion.div>
                      ))}
                    </div>

                    <div className="mt-3">
                      <Button variant="outline" size="lg" className="w-full">
                        Approve & Execute All
                      </Button>
                    </div>
                  </div>
                </Card>
              </motion.div>
            </motion.div>
          </CardWrapper>
        </div>
      </div>

      {/* ── Footer — outside scroll container, always visible at bottom ── */}
      <div
        className={cn(
          "flex shrink-0 items-center justify-between px-6 py-4",
          isFullView && "lg:pl-[calc(440px+2.5rem)]"
        )}
      >
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm">
            Save Draft
          </Button>
          <Button variant="outline" size="sm">
            Discard AI Note
          </Button>
        </div>
        <Button variant="default" size="lg" className="text-base font-bold">
          Sign & Approve Note
        </Button>
      </div>
    </motion.div>
  );
}
