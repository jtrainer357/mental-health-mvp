"use client";

import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import {
  ChevronLeft,
  Sparkles,
  TrendingUp,
  TrendingDown,
  Minus,
  AlertTriangle,
  Pill,
  FileText,
  Check,
  X,
  ChevronRight,
  DollarSign,
  Target,
  ClipboardList,
  Calendar,
} from "lucide-react";
import { cn } from "@/design-system/lib/utils";
import { Button } from "@/design-system/components/ui/button";
import { Badge } from "@/design-system/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/design-system/components/ui/avatar";
import { Heading, Text } from "@/design-system/components/ui/typography";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface PatientSummaryViewProps {
  patientId: string;
  onBack: () => void;
  onViewNote: (noteId: string) => void;
  onEnterVisit: () => void;
}

interface Diagnosis {
  code: string;
  name: string;
  isPrimary: boolean;
  diagnosedOn: string;
}

interface OutcomeScore {
  measureType: string;
  currentScore: number;
  previousScore: number | null;
  maxScore: number;
  severity: "minimal" | "mild" | "moderate" | "moderately_severe" | "severe";
  dateAdministered: string;
}

interface MedicationRecord {
  name: string;
  dosage: string;
  frequency: string;
  status: "active" | "discontinued";
}

interface TreatmentPlanItem {
  id: string;
  description: string;
  status: "pending" | "accepted" | "rejected";
}

interface RecentNote {
  id: string;
  date: string;
  type: string;
  preview: string;
}

interface PatientSummary {
  patient: {
    id: string;
    firstName: string;
    lastName: string;
    preferredName: string | null;
    pronouns: string;
    dateOfBirth: string;
    avatarUrl: string | null;
    sessionCount: number;
    appointmentTime: string;
    appointmentType: string;
  };
  currentSituation: string;
  diagnoses: Diagnosis[];
  outcomeScores: OutcomeScore[];
  medications: MedicationRecord[];
  goalsAndProgress: string;
  safetyAlerts: string[];
  treatmentPlanItems: TreatmentPlanItem[];
  recentNotes: RecentNote[];
  outstandingBalance: number;
}

// ---------------------------------------------------------------------------
// Mock data
// ---------------------------------------------------------------------------

function getMockPatientSummary(): PatientSummary {
  return {
    patient: {
      id: "patient-1",
      firstName: "Michael",
      lastName: "Harris",
      preferredName: "Mike",
      pronouns: "he/him",
      dateOfBirth: "1985-06-15",
      avatarUrl: null,
      sessionCount: 24,
      appointmentTime: "10:30 AM",
      appointmentType: "Individual Therapy",
    },
    currentSituation:
      "Client is making meaningful progress on anxiety management strategies discussed over the past 3 sessions. Reported using breathing techniques during a stressful work presentation last week with positive results. Sleep has improved from 4-5 hours to 6-7 hours nightly. Continues to express concern about upcoming family gathering and potential triggers.",
    diagnoses: [
      { code: "F41.1", name: "Generalized Anxiety Disorder", isPrimary: true, diagnosedOn: "2024-08-15" },
      { code: "F32.1", name: "Major Depressive Disorder, moderate", isPrimary: false, diagnosedOn: "2024-08-15" },
    ],
    outcomeScores: [
      {
        measureType: "PHQ-9",
        currentScore: 12,
        previousScore: 16,
        maxScore: 27,
        severity: "moderate",
        dateAdministered: "2026-03-12",
      },
      {
        measureType: "GAD-7",
        currentScore: 10,
        previousScore: 14,
        maxScore: 21,
        severity: "moderate",
        dateAdministered: "2026-03-12",
      },
    ],
    medications: [
      { name: "Sertraline", dosage: "100mg", frequency: "Daily", status: "active" },
      { name: "Hydroxyzine", dosage: "25mg", frequency: "As needed", status: "active" },
    ],
    goalsAndProgress:
      "Michael is actively working on reducing avoidance behaviors related to social situations. He has successfully attended two work networking events this month, which represents significant progress from baseline. Current focus areas include developing assertiveness skills for family interactions and maintaining sleep hygiene improvements.",
    safetyAlerts: [],
    treatmentPlanItems: [
      {
        id: "tp-1",
        description: "Continue cognitive restructuring exercises for catastrophic thinking patterns",
        status: "pending" as const,
      },
      {
        id: "tp-2",
        description: "Introduce exposure hierarchy for social anxiety situations",
        status: "pending" as const,
      },
      {
        id: "tp-3",
        description: "Review and update safety plan before family gathering",
        status: "pending" as const,
      },
    ],
    recentNotes: [
      {
        id: "note-1",
        date: "2026-03-12",
        type: "DAP",
        preview:
          "Client reported improved sleep patterns and successful use of breathing techniques during work presentation. Discussed upcoming family gathering...",
      },
      {
        id: "note-2",
        date: "2026-03-05",
        type: "DAP",
        preview:
          "Continued work on cognitive restructuring. Client identified 3 automatic thoughts and practiced reframing. Homework: thought record for work situations...",
      },
      {
        id: "note-3",
        date: "2026-02-26",
        type: "DAP",
        preview:
          "Introduced exposure hierarchy concept. Client initially resistant but agreed to start with lower-anxiety social situations. Reviewed breathing technique...",
      },
    ],
    outstandingBalance: 75.0,
  };
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getTrend(current: number, previous: number | null) {
  if (previous === null) {
    return { icon: Minus, color: "text-muted-foreground", label: "No prior" };
  }
  const diff = current - previous;
  if (diff > 0) return { icon: TrendingUp, color: "text-destructive", label: `+${diff}` };
  if (diff < 0) return { icon: TrendingDown, color: "text-green-600", label: `${diff}` };
  return { icon: Minus, color: "text-muted-foreground", label: "No change" };
}

function getSeverityColor(severity: OutcomeScore["severity"]): string {
  const colors: Record<string, string> = {
    minimal: "bg-green-100 text-green-800",
    mild: "bg-yellow-100 text-yellow-800",
    moderate: "bg-orange-100 text-orange-800",
    moderately_severe: "bg-red-100 text-red-800",
    severe: "bg-red-200 text-red-900",
  };
  return colors[severity] || "bg-gray-100 text-gray-800";
}

function calculateAge(dateOfBirth: string): number {
  const today = new Date();
  const birth = new Date(dateOfBirth);
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age;
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

// ---------------------------------------------------------------------------
// Animation variants
// ---------------------------------------------------------------------------

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.06, delayChildren: 0.1 },
  },
};

const smoothEase: [number, number, number, number] = [0.25, 0.1, 0.25, 1.0];

const sectionVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.35, ease: smoothEase },
  },
};

// ---------------------------------------------------------------------------
// Section label
// ---------------------------------------------------------------------------

function SectionLabel({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <span className={cn("text-xs font-bold uppercase tracking-wider text-muted-foreground", className)}>
      {children}
    </span>
  );
}

// ---------------------------------------------------------------------------
// Card shell (consistent card styling)
// ---------------------------------------------------------------------------

function SectionCard({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("rounded-lg border border-border/40 bg-white/60 p-4 shadow-sm backdrop-blur-sm", className)}>
      {children}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function PatientSummaryView({ onBack, onViewNote, onEnterVisit }: PatientSummaryViewProps) {
  const summary = getMockPatientSummary();
  const { patient } = summary;
  const age = calculateAge(patient.dateOfBirth);
  const initials = `${patient.firstName[0]}${patient.lastName[0]}`;
  const displayName = patient.preferredName
    ? `${patient.preferredName} ${patient.lastName}`
    : `${patient.firstName} ${patient.lastName}`;

  // Treatment plan item state
  const [treatmentItems, setTreatmentItems] = useState<TreatmentPlanItem[]>(summary.treatmentPlanItems);

  const handleAcceptItem = useCallback((itemId: string) => {
    setTreatmentItems((prev) =>
      prev.map((item) => (item.id === itemId ? { ...item, status: "accepted" as const } : item))
    );
  }, []);

  const handleRejectItem = useCallback((itemId: string) => {
    setTreatmentItems((prev) =>
      prev.map((item) => (item.id === itemId ? { ...item, status: "rejected" as const } : item))
    );
  }, []);

  return (
    <div className="relative min-h-screen bg-background pb-40 lg:pb-6">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="mx-auto max-w-2xl space-y-4 px-4 pt-4"
      >
        {/* ----------------------------------------------------------------- */}
        {/* Header                                                            */}
        {/* ----------------------------------------------------------------- */}
        <motion.div variants={sectionVariants}>
          <div className="flex items-center gap-2 mb-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={onBack}
              className="h-11 w-11 shrink-0"
              aria-label="Go back"
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <Heading level={4} className="truncate">
              Patient Summary
            </Heading>
          </div>

          <SectionCard>
            <div className="flex items-center gap-3">
              <Avatar className="h-14 w-14">
                {patient.avatarUrl ? (
                  <AvatarImage src={patient.avatarUrl} alt={displayName} />
                ) : null}
                <AvatarFallback className="bg-primary/10 text-primary text-lg font-semibold">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <Heading level={5} className="truncate">
                    {displayName}
                  </Heading>
                  <Text size="sm" muted className="shrink-0">
                    {patient.pronouns}
                  </Text>
                </div>
                <Text size="sm" muted>
                  {age} years old
                </Text>
                <div className="mt-1.5 flex items-center gap-2 flex-wrap">
                  <Badge variant="secondary" className="text-xs">
                    {patient.sessionCount} sessions
                  </Badge>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Calendar className="h-3.5 w-3.5" />
                    <span>
                      {patient.appointmentTime} &middot; {patient.appointmentType}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </SectionCard>
        </motion.div>

        {/* ----------------------------------------------------------------- */}
        {/* Section 1: AI Summary                                              */}
        {/* ----------------------------------------------------------------- */}
        <motion.div variants={sectionVariants}>
          <SectionCard>
            <div className="mb-2 flex items-center gap-1.5">
              <Sparkles className="h-4 w-4 text-teal-dark" />
              <SectionLabel>AI Summary</SectionLabel>
            </div>
            <Text size="sm" className="leading-relaxed">
              {summary.currentSituation}
            </Text>
            <Text size="xs" muted className="mt-2 italic">
              Generated from last 3 sessions
            </Text>
          </SectionCard>
        </motion.div>

        {/* ----------------------------------------------------------------- */}
        {/* Section 2: Treatment Plan Items                                    */}
        {/* ----------------------------------------------------------------- */}
        <motion.div variants={sectionVariants}>
          <SectionCard>
            <div className="mb-3 flex items-center gap-1.5">
              <Sparkles className="h-4 w-4 text-teal-dark" />
              <SectionLabel>Suggested from your notes</SectionLabel>
            </div>
            <div className="space-y-2">
              {treatmentItems.map((item) => (
                <div
                  key={item.id}
                  className={cn(
                    "flex items-start gap-3 rounded-md border p-3 transition-colors",
                    item.status === "accepted" && "border-green-200 bg-green-50/60",
                    item.status === "rejected" && "border-border/20 bg-muted/30 opacity-50",
                    item.status === "pending" && "border-border/40 bg-white/40"
                  )}
                >
                  <ClipboardList className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                  <Text size="sm" className="flex-1 leading-snug">
                    {item.description}
                  </Text>
                  <div className="flex items-center gap-1 shrink-0">
                    {item.status === "pending" ? (
                      <>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-green-600 hover:bg-green-100 hover:text-green-700"
                          onClick={() => handleAcceptItem(item.id)}
                          aria-label={`Accept: ${item.description}`}
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:bg-destructive/10"
                          onClick={() => handleRejectItem(item.id)}
                          aria-label={`Reject: ${item.description}`}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </>
                    ) : item.status === "accepted" ? (
                      <Badge variant="success" className="text-xs">
                        Accepted
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="text-xs">
                        Dismissed
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </SectionCard>
        </motion.div>

        {/* ----------------------------------------------------------------- */}
        {/* Section 3: Active Diagnoses                                        */}
        {/* ----------------------------------------------------------------- */}
        <motion.div variants={sectionVariants}>
          <SectionCard>
            <div className="mb-3 flex items-center gap-1.5">
              <Target className="h-4 w-4 text-muted-foreground" />
              <SectionLabel>Active Diagnoses</SectionLabel>
            </div>
            <div className="space-y-2">
              {summary.diagnoses.map((dx) => (
                <div key={dx.code} className="flex items-start justify-between gap-2">
                  <div className="flex items-start gap-2 min-w-0">
                    <Badge variant={dx.isPrimary ? "default" : "outline"} className="shrink-0 text-xs">
                      {dx.code}
                    </Badge>
                    <div className="min-w-0">
                      <Text size="sm" className="leading-snug">
                        {dx.name}
                      </Text>
                      <Text size="xs" muted>
                        Since {formatDate(dx.diagnosedOn)}
                      </Text>
                    </div>
                  </div>
                  {dx.isPrimary && (
                    <Badge variant="active" className="shrink-0 text-xs">
                      Primary
                    </Badge>
                  )}
                </div>
              ))}
            </div>
          </SectionCard>
        </motion.div>

        {/* ----------------------------------------------------------------- */}
        {/* Section 4: Outcome Measures                                        */}
        {/* ----------------------------------------------------------------- */}
        <motion.div variants={sectionVariants}>
          <SectionCard>
            <div className="mb-3 flex items-center gap-1.5">
              <TrendingDown className="h-4 w-4 text-muted-foreground" />
              <SectionLabel>Outcome Measures</SectionLabel>
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {summary.outcomeScores.map((score) => {
                const trend = getTrend(score.currentScore, score.previousScore);
                const TrendIcon = trend.icon;
                return (
                  <div
                    key={score.measureType}
                    className="rounded-md border border-border/30 bg-white/40 p-3"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <Text size="sm" weight="semibold">
                        {score.measureType}
                      </Text>
                      <Badge className={cn("text-xs", getSeverityColor(score.severity))}>
                        {score.severity.replace("_", " ")}
                      </Badge>
                    </div>
                    <div className="flex items-baseline gap-1">
                      <span className="text-2xl font-bold text-foreground">
                        {score.currentScore}
                      </span>
                      <span className="text-sm text-muted-foreground">/ {score.maxScore}</span>
                    </div>
                    <div className="mt-1 flex items-center gap-1">
                      <TrendIcon className={cn("h-3.5 w-3.5", trend.color)} />
                      <Text size="xs" className={trend.color}>
                        {trend.label}
                      </Text>
                      <Text size="xs" muted className="ml-auto">
                        {formatDate(score.dateAdministered)}
                      </Text>
                    </div>
                  </div>
                );
              })}
            </div>
          </SectionCard>
        </motion.div>

        {/* ----------------------------------------------------------------- */}
        {/* Section 5: Medications                                             */}
        {/* ----------------------------------------------------------------- */}
        <motion.div variants={sectionVariants}>
          <SectionCard>
            <div className="mb-3 flex items-center gap-1.5">
              <Pill className="h-4 w-4 text-muted-foreground" />
              <SectionLabel>Medications</SectionLabel>
            </div>
            {summary.medications.length > 0 ? (
              <div className="space-y-2">
                {summary.medications.map((med) => (
                  <div
                    key={med.name}
                    className="flex items-center justify-between rounded-md border border-border/30 bg-white/40 px-3 py-2"
                  >
                    <div>
                      <Text size="sm" weight="medium">
                        {med.name}
                      </Text>
                      <Text size="xs" muted>
                        {med.dosage} &middot; {med.frequency}
                      </Text>
                    </div>
                    <Badge variant="active" className="text-xs">
                      {med.status}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <Text size="sm" muted>
                No medications on record
              </Text>
            )}
          </SectionCard>
        </motion.div>

        {/* ----------------------------------------------------------------- */}
        {/* Section 6: Goals & Progress                                        */}
        {/* ----------------------------------------------------------------- */}
        <motion.div variants={sectionVariants}>
          <SectionCard>
            <div className="mb-2 flex items-center gap-1.5">
              <Sparkles className="h-4 w-4 text-teal-dark" />
              <SectionLabel>Goals &amp; Progress</SectionLabel>
            </div>
            <Text size="sm" className="leading-relaxed">
              {summary.goalsAndProgress}
            </Text>
          </SectionCard>
        </motion.div>

        {/* ----------------------------------------------------------------- */}
        {/* Section 7: Alerts & Flags                                          */}
        {/* ----------------------------------------------------------------- */}
        {(summary.safetyAlerts.length > 0 || summary.outstandingBalance > 0) && (
          <motion.div variants={sectionVariants} className="space-y-3">
            {summary.safetyAlerts.map((alert, idx) => (
              <div
                key={idx}
                className="flex items-start gap-3 rounded-lg border border-destructive/20 bg-destructive/5 p-4 text-destructive"
              >
                <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />
                <Text size="sm" className="text-destructive">
                  {alert}
                </Text>
              </div>
            ))}

            {summary.outstandingBalance > 0 && (
              <SectionCard className="border-amber-200/60 bg-amber-50/40">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-amber-100">
                    <DollarSign className="h-4 w-4 text-amber-700" />
                  </div>
                  <div>
                    <Text size="sm" weight="medium">
                      Outstanding Balance
                    </Text>
                    <Text size="sm" className="text-amber-700">
                      ${summary.outstandingBalance.toFixed(2)} due
                    </Text>
                  </div>
                </div>
              </SectionCard>
            )}
          </motion.div>
        )}

        {/* ----------------------------------------------------------------- */}
        {/* Section 8: Recent Notes (horizontal scroll)                        */}
        {/* ----------------------------------------------------------------- */}
        <motion.div variants={sectionVariants}>
          <div className="mb-2 flex items-center gap-1.5 px-1">
            <FileText className="h-4 w-4 text-muted-foreground" />
            <SectionLabel>Recent Notes</SectionLabel>
          </div>
          <div className="-mx-4 px-4 overflow-x-auto scrollbar-hide">
            <div className="flex gap-3 pb-2">
              {summary.recentNotes.map((note) => (
                <button
                  key={note.id}
                  onClick={() => onViewNote(note.id)}
                  className="min-w-[200px] max-w-[240px] shrink-0 rounded-lg border border-border/40 bg-white/60 p-3 shadow-sm backdrop-blur-sm text-left transition-colors hover:border-primary/30 hover:bg-white/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  aria-label={`View ${note.type} note from ${formatDate(note.date)}`}
                >
                  <div className="mb-1.5 flex items-center justify-between">
                    <Badge variant="outline" className="text-xs">
                      {note.type}
                    </Badge>
                    <Text size="xs" muted>
                      {formatDate(note.date)}
                    </Text>
                  </div>
                  <Text size="xs" className="line-clamp-3 leading-relaxed text-muted-foreground">
                    {note.preview}
                  </Text>
                </button>
              ))}

              <button
                onClick={() => onViewNote("all")}
                className="flex min-w-[120px] shrink-0 items-center justify-center gap-1 rounded-lg border border-dashed border-border/40 bg-white/30 px-4 text-sm font-medium text-muted-foreground transition-colors hover:border-primary/30 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                aria-label="View all notes"
              >
                View all
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* ------------------------------------------------------------------- */}
      {/* Footer (sticky mobile, static desktop)                               */}
      {/* ------------------------------------------------------------------- */}
      <div className="fixed bottom-0 left-0 right-0 z-30 border-t bg-white/95 p-4 backdrop-blur-sm lg:static lg:mx-auto lg:mt-6 lg:max-w-2xl lg:border-0 lg:bg-transparent lg:px-4 lg:backdrop-blur-none">
        <div className="mx-auto max-w-2xl space-y-2">
          <Button
            className="h-12 w-full text-base font-semibold"
            onClick={onEnterVisit}
          >
            Enter Visit
            <ChevronRight className="ml-1 h-5 w-5" />
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" className="h-11 flex-1" onClick={() => onViewNote("all")}>
              View Full Chart
            </Button>
            <Button variant="ghost" className="h-11 flex-1" onClick={onBack}>
              Back to Schedule
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
