"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Maximize2,
  Minimize2,
  FileText,
  MessageSquare,
  DollarSign,
  TrendingUp,
} from "lucide-react";
import { Card } from "@/design-system/components/ui/card";
import { CardWrapper } from "@/design-system/components/ui/card-wrapper";
import { Badge } from "@/design-system/components/ui/badge";
import { Button } from "@/design-system/components/ui/button";
import { Heading, Text } from "@/design-system/components/ui/typography";
import { cn } from "@/design-system/lib/utils";
import { usePatientViewNavigation, useViewState } from "@/src/lib/stores/patient-view-store";
import type { PatientDetail } from "./types";

// Elegant easing curves (typed as tuple for framer-motion)
const smoothEase: [number, number, number, number] = [0.25, 0.1, 0.25, 1.0];

// Container animation with staggered children
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.06,
      delayChildren: 0.15,
    },
  },
};

// Section animation variants
const sectionVariants = {
  hidden: {
    opacity: 0,
    y: 15,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.35,
      ease: smoothEase,
    },
  },
};

// Header animation
const headerVariants = {
  hidden: {
    opacity: 0,
    y: -10,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: smoothEase,
    },
  },
};

// Expo-out easing for side panel
const expoOutEase: [number, number, number, number] = [0.16, 1, 0.3, 1];

// Side panel animation for full view
const sidePanelVariants = {
  hidden: {
    opacity: 0,
    x: 40,
  },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.5,
      ease: expoOutEase,
      delay: 0.2,
    },
  },
};

// Wrapper component that renders CardWrapper in full view, plain div otherwise
function NoteContentWrapper({
  isFullView,
  children,
}: {
  isFullView: boolean;
  children: React.ReactNode;
}) {
  if (isFullView) {
    return (
      <CardWrapper className="flex-1 space-y-5 lg:overflow-y-auto">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-5"
        >
          {children}
        </motion.div>
      </CardWrapper>
    );
  }
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-5"
    >
      {children}
    </motion.div>
  );
}

// Type for selected activity with full details
type SelectedActivity = PatientDetail["recentActivity"][number];

interface ClinicalNoteViewProps {
  activity: SelectedActivity;
  patientName: string;
  patient?: PatientDetail;
  className?: string;
}

// Generate realistic SOAP note content based on session type
function getNoteContent(activity: SelectedActivity, patientName: string) {
  const isSubstanceUse =
    activity.title?.toLowerCase().includes("substance") ||
    activity.diagnosisCodes?.some((c) => c.toLowerCase().includes("substance"));

  if (isSubstanceUse || activity.appointmentType === "Individual Therapy") {
    return {
      chiefComplaint:
        "Follow-up for ongoing individual therapy, mood management, and coping skills development.",
      subjective: `Patient reports: "I've been doing better this week. The techniques we discussed last session really helped when I felt triggered." Patient describes improved sleep quality (6-7 hours/night vs 4-5 previously). Denies any return to substance use. Reports attending 2 support group meetings this week. Mood described as "mostly stable with some anxiety around work deadlines." No suicidal or homicidal ideation. Appetite normal. Energy levels improving.`,
      objective: `Patient arrived on time, appropriately dressed with good hygiene. Alert and oriented x4. Speech normal rate/rhythm/volume. Mood: "better." Affect: congruent, full range, appropriate. Thought process: linear, goal-directed. No evidence of psychosis, delusions, or hallucinations. Insight: good. Judgment: intact. Eye contact appropriate throughout session.`,
      assessment: `${patientName} continues to make progress in treatment. Demonstrates improved coping skills and increased insight into triggers. Sustained recovery maintained. GAD symptoms showing improvement with current interventions. Patient remains engaged and motivated in treatment.`,
      plan: [
        "Continue individual therapy weekly x 4 sessions",
        "Maintain current coping strategies (mindfulness, journaling, sponsor contact)",
        "Continue support group attendance (minimum 2x/week)",
        "Practice grounding techniques discussed today",
        "Review sleep hygiene handout provided",
        "Next appointment scheduled in 1 week",
      ],
      diagnoses: [
        "F10.20 - Alcohol Use Disorder, Moderate, In Sustained Remission",
        "F41.1 - Generalized Anxiety Disorder",
      ],
      vitals: {
        bp: "122/78",
        hr: "72",
        phq9: "8 (mild)",
        gad7: "10 (moderate)",
      },
    };
  }

  // Default therapy note
  return {
    chiefComplaint: "Scheduled follow-up for ongoing psychotherapy and symptom management.",
    subjective: `Patient reports overall improvement since last session. Describes practicing coping techniques discussed previously with moderate success. Sleep and appetite within normal limits. Denies suicidal or homicidal ideation. Reports some ongoing stressors related to work/family but feels better equipped to manage them.`,
    objective: `Patient arrived on time, casually dressed, good hygiene. Alert and oriented x4. Cooperative and engaged throughout session. Mood: "okay." Affect: appropriate, full range. Thought process: linear and goal-directed. No evidence of psychosis. Insight and judgment intact.`,
    assessment: `Patient demonstrates continued engagement in treatment and progress toward therapeutic goals. Current symptoms are well-managed with existing treatment approach.`,
    plan: [
      "Continue current treatment approach",
      "Practice techniques discussed in session",
      "Schedule follow-up appointment",
    ],
    diagnoses: ["F41.1 - Generalized Anxiety Disorder"],
    vitals: {
      phq9: "6 (mild)",
      gad7: "8 (mild)",
    },
  };
}

export function ClinicalNoteView({
  activity,
  patientName,
  patient,
  className,
}: ClinicalNoteViewProps) {
  const note = getNoteContent(activity, patientName);
  const viewState = useViewState();
  const { goBack, toggleFullView } = usePatientViewNavigation();
  const isFullView = viewState === "fullView";

  // Get other visits (excluding current activity)
  const otherVisits = patient?.recentActivity?.filter((a) => a.id !== activity.id) || [];
  const recentMessages = patient?.messages?.slice(0, 3) || [];
  const outcomeMeasures = patient?.outcomeMeasures?.slice(0, 4) || [];
  // Find invoice for this visit date
  const visitInvoice = patient?.invoices?.find((inv) => inv.dateOfService === activity.date);

  // Handle ESC key to exit full view
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

  return (
    <motion.div
      className={cn("flex h-full flex-col", className)}
      initial="hidden"
      animate="visible"
    >
      {/* Header */}
      <motion.div
        variants={headerVariants}
        className="border-border/30 mb-6 flex items-center justify-between border-b pb-4"
      >
        <div className="flex items-center gap-4">
          <motion.button
            onClick={goBack}
            aria-label="Go back to visit summary"
            className="bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground flex h-10 w-10 items-center justify-center rounded-xl transition-all"
            whileHover={{ scale: 1.05, backgroundColor: "rgba(var(--primary), 0.1)" }}
            whileTap={{ scale: 0.95 }}
          >
            <ArrowLeft className="h-5 w-5" />
          </motion.button>
          <div>
            <Heading level={4} className="text-lg font-semibold sm:text-xl">
              Clinical Note
            </Heading>
            <Text size="sm" muted className="mt-0.5">
              {activity.title} · {activity.date}
            </Text>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.3 }}
          >
            <Badge
              variant="secondary"
              className="bg-success/15 text-success rounded-lg px-3 py-1 text-xs font-semibold"
            >
              Signed & Locked
            </Badge>
          </motion.div>
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button
              variant="outline"
              size="sm"
              onClick={toggleFullView}
              className="border-border/50 hover:border-primary/30 hover:bg-primary/5 gap-2 transition-all"
              aria-label={isFullView ? "Exit full view" : "Enter full view"}
            >
              {isFullView ? (
                <>
                  <Minimize2 className="h-4 w-4" />
                  <span className="hidden sm:inline">Exit Full View</span>
                </>
              ) : (
                <>
                  <Maximize2 className="h-4 w-4" />
                  <span className="hidden sm:inline">Full View</span>
                </>
              )}
            </Button>
          </motion.div>
        </div>
      </motion.div>

      {/* Note Content - Two column on desktop full view, single column on mobile */}
      <div
        className={cn(
          "flex-1 pb-20 lg:overflow-y-auto lg:pb-0",
          isFullView && "flex flex-col gap-6 px-4 lg:flex-row"
        )}
      >
        {/* Left Column: Note Content - use CardWrapper only in full view */}
        <NoteContentWrapper isFullView={isFullView}>
          {/* Patient & Session Info */}
          <motion.div variants={sectionVariants}>
            <Card className="border-border/40 from-muted/40 to-muted/20 overflow-hidden bg-gradient-to-br p-0 shadow-sm">
              <div className="divide-border/30 grid grid-cols-1 divide-y sm:grid-cols-2 sm:divide-x sm:divide-y-0 lg:grid-cols-4">
                <div className="p-4">
                  <Text
                    size="xs"
                    muted
                    className="mb-1 text-[10px] font-semibold tracking-wider uppercase"
                  >
                    Patient
                  </Text>
                  <Text size="sm" className="font-semibold">
                    {patientName}
                  </Text>
                </div>
                <div className="p-4">
                  <Text
                    size="xs"
                    muted
                    className="mb-1 text-[10px] font-semibold tracking-wider uppercase"
                  >
                    Date of Service
                  </Text>
                  <Text size="sm" className="font-semibold">
                    {activity.date}
                  </Text>
                </div>
                <div className="p-4">
                  <Text
                    size="xs"
                    muted
                    className="mb-1 text-[10px] font-semibold tracking-wider uppercase"
                  >
                    Provider
                  </Text>
                  <Text size="sm" className="font-semibold">
                    {activity.provider || "Dr. Demo"}
                  </Text>
                </div>
                <div className="p-4">
                  <Text
                    size="xs"
                    muted
                    className="mb-1 text-[10px] font-semibold tracking-wider uppercase"
                  >
                    Duration
                  </Text>
                  <Text size="sm" className="font-semibold">
                    {activity.duration || "60 min"}
                  </Text>
                </div>
              </div>
            </Card>
          </motion.div>

          {/* Vitals / Assessments */}
          {note.vitals && (
            <motion.section variants={sectionVariants}>
              <Text
                size="xs"
                className="text-muted-foreground mb-3 font-bold tracking-wider uppercase"
              >
                Clinical Measures
              </Text>
              <Card className="border-border/40 bg-card/60 p-4 shadow-sm">
                <div className="flex flex-wrap gap-4">
                  {note.vitals.bp && (
                    <motion.div
                      className="bg-muted/50 flex items-center gap-2.5 rounded-lg px-3 py-2"
                      whileHover={{ scale: 1.02 }}
                      transition={{ duration: 0.2 }}
                    >
                      <div className="bg-destructive/15 flex h-8 w-8 items-center justify-center rounded-lg">
                        <Text size="xs" className="text-destructive font-bold">
                          BP
                        </Text>
                      </div>
                      <Text size="sm" className="font-medium">
                        {note.vitals.bp} mmHg
                      </Text>
                    </motion.div>
                  )}
                  {note.vitals.hr && (
                    <motion.div
                      className="bg-muted/50 flex items-center gap-2.5 rounded-lg px-3 py-2"
                      whileHover={{ scale: 1.02 }}
                      transition={{ duration: 0.2 }}
                    >
                      <div className="bg-destructive/15 flex h-8 w-8 items-center justify-center rounded-lg">
                        <Text size="xs" className="text-destructive font-bold">
                          HR
                        </Text>
                      </div>
                      <Text size="sm" className="font-medium">
                        {note.vitals.hr} bpm
                      </Text>
                    </motion.div>
                  )}
                  {note.vitals.phq9 && (
                    <motion.div
                      className="bg-muted/50 flex items-center gap-2.5 rounded-lg px-3 py-2"
                      whileHover={{ scale: 1.02 }}
                      transition={{ duration: 0.2 }}
                    >
                      <div className="bg-primary/15 flex h-8 items-center justify-center rounded-lg px-2.5">
                        <Text size="xs" className="text-primary font-bold">
                          PHQ-9
                        </Text>
                      </div>
                      <Text size="sm" className="font-medium">
                        {note.vitals.phq9}
                      </Text>
                    </motion.div>
                  )}
                  {note.vitals.gad7 && (
                    <motion.div
                      className="bg-muted/50 flex items-center gap-2.5 rounded-lg px-3 py-2"
                      whileHover={{ scale: 1.02 }}
                      transition={{ duration: 0.2 }}
                    >
                      <div className="bg-teal/15 flex h-8 items-center justify-center rounded-lg px-2.5">
                        <Text size="xs" className="text-teal font-bold">
                          GAD-7
                        </Text>
                      </div>
                      <Text size="sm" className="font-medium">
                        {note.vitals.gad7}
                      </Text>
                    </motion.div>
                  )}
                </div>
              </Card>
            </motion.section>
          )}

          {/* Chief Complaint */}
          <motion.section variants={sectionVariants}>
            <Text
              size="xs"
              className="text-muted-foreground mb-3 font-bold tracking-wider uppercase"
            >
              Chief Complaint
            </Text>
            <Text size="sm" className="text-foreground/80 leading-relaxed">
              {note.chiefComplaint}
            </Text>
          </motion.section>

          {/* Subjective */}
          <motion.section variants={sectionVariants}>
            <Text
              size="xs"
              className="text-muted-foreground mb-3 font-bold tracking-wider uppercase"
            >
              Subjective
            </Text>
            <Card className="border-border/40 bg-card/60 p-5 shadow-sm">
              <Text size="sm" className="text-foreground/80 leading-relaxed whitespace-pre-wrap">
                {note.subjective}
              </Text>
            </Card>
          </motion.section>

          {/* Objective */}
          <motion.section variants={sectionVariants}>
            <Text
              size="xs"
              className="text-muted-foreground mb-3 font-bold tracking-wider uppercase"
            >
              Objective
            </Text>
            <Card className="border-border/40 bg-card/60 p-5 shadow-sm">
              <Text size="sm" className="text-foreground/80 leading-relaxed">
                {note.objective}
              </Text>
            </Card>
          </motion.section>

          {/* Assessment */}
          <motion.section variants={sectionVariants}>
            <Text
              size="xs"
              className="text-muted-foreground mb-3 font-bold tracking-wider uppercase"
            >
              Assessment
            </Text>
            <Card className="border-border/40 bg-card/60 p-5 shadow-sm">
              <Text size="sm" className="text-foreground/80 mb-4 leading-relaxed">
                {note.assessment}
              </Text>
              <div className="border-border/30 border-t pt-4">
                <Text
                  size="xs"
                  className="text-muted-foreground mb-2 font-semibold tracking-wider uppercase"
                >
                  Diagnoses
                </Text>
                <div className="space-y-1.5">
                  {note.diagnoses.map((dx, i) => (
                    <motion.div
                      key={i}
                      className="bg-muted/40 rounded-lg px-3 py-2"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 * i, duration: 0.3 }}
                    >
                      <Text size="sm" className="text-foreground/70 font-mono text-xs">
                        {dx}
                      </Text>
                    </motion.div>
                  ))}
                </div>
              </div>
            </Card>
          </motion.section>

          {/* Plan */}
          <motion.section variants={sectionVariants}>
            <Text
              size="xs"
              className="text-muted-foreground mb-3 font-bold tracking-wider uppercase"
            >
              Plan
            </Text>
            <Card className="border-border/40 bg-card/60 p-5 shadow-sm">
              <ul className="space-y-3">
                {note.plan.map((item, i) => (
                  <motion.li
                    key={i}
                    className="flex items-start gap-3"
                    initial={{ opacity: 0, x: -15 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.08 * i, duration: 0.35, ease: smoothEase }}
                  >
                    <span className="bg-primary/10 text-primary mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-semibold">
                      {i + 1}
                    </span>
                    <Text size="sm" className="text-foreground/80 pt-0.5">
                      {item}
                    </Text>
                  </motion.li>
                ))}
              </ul>
            </Card>
          </motion.section>

          {/* Signature */}
          <motion.div variants={sectionVariants}>
            <Card className="border-border/40 from-success/10 to-success/5 overflow-hidden bg-gradient-to-br p-0 shadow-sm">
              <div className="flex items-center justify-between p-4">
                <div>
                  <Text size="sm" className="font-semibold">
                    Electronically signed by {activity.provider || "Dr. Demo"}
                  </Text>
                  <Text size="xs" muted className="mt-0.5">
                    {activity.date} at 4:32 PM
                  </Text>
                </div>
                <Badge className="bg-success/15 text-success rounded-lg px-3 py-1 text-xs font-semibold">
                  Verified
                </Badge>
              </div>
            </Card>
          </motion.div>
        </NoteContentWrapper>

        {/* Right Column: Patient Context (only in full view) */}
        {isFullView && patient && (
          <motion.div
            variants={sidePanelVariants}
            initial="hidden"
            animate="visible"
            className="w-full shrink-0 lg:w-80"
          >
            <CardWrapper className="h-full space-y-4 lg:overflow-y-auto">
              {/* Clinical History */}
              <Card className="border-border/40 p-4">
                <div className="mb-3 flex items-center gap-2">
                  <FileText className="text-primary h-4 w-4" />
                  <Text size="sm" className="font-semibold">
                    Clinical History
                  </Text>
                </div>

                {/* Outcome Measures */}
                {outcomeMeasures.length > 0 && (
                  <div className="mb-4">
                    <Text size="xs" muted className="mb-2 font-medium">
                      Recent Scores
                    </Text>
                    <div className="space-y-2">
                      {outcomeMeasures.map((measure) => (
                        <div
                          key={measure.id}
                          className="bg-muted/40 flex items-center justify-between rounded-lg px-3 py-2"
                        >
                          <div className="flex items-center gap-2">
                            <TrendingUp className="text-primary h-3 w-3" />
                            <Text size="xs" className="font-medium">
                              {measure.measureType}
                            </Text>
                          </div>
                          <Text size="xs" className="font-semibold">
                            {measure.score}
                          </Text>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Past Visits */}
                {otherVisits.length > 0 && (
                  <div>
                    <Text size="xs" muted className="mb-2 font-medium">
                      Past Visits
                    </Text>
                    <div className="space-y-2">
                      {otherVisits.slice(0, 3).map((visit) => (
                        <div key={visit.id} className="bg-muted/40 rounded-lg px-3 py-2">
                          <Text size="xs" className="font-medium">
                            {visit.title}
                          </Text>
                          <Text size="xs" muted>
                            {visit.date}
                          </Text>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </Card>

              {/* Messages */}
              <Card className="border-border/40 p-4">
                <div className="mb-3 flex items-center gap-2">
                  <MessageSquare className="text-primary h-4 w-4" />
                  <Text size="sm" className="font-semibold">
                    Recent Messages
                  </Text>
                </div>
                {recentMessages.length > 0 ? (
                  <div className="space-y-2">
                    {recentMessages.map((msg) => (
                      <div key={msg.id} className="bg-muted/40 rounded-lg px-3 py-2">
                        <div className="mb-1 flex items-center justify-between">
                          <Text size="xs" className="font-medium capitalize">
                            {msg.channel}
                          </Text>
                          {!msg.isRead && (
                            <Badge className="bg-primary/15 text-primary px-1.5 py-0 text-[10px]">
                              New
                            </Badge>
                          )}
                        </div>
                        <Text size="xs" muted className="line-clamp-2">
                          {msg.messageBody}
                        </Text>
                      </div>
                    ))}
                  </div>
                ) : (
                  <Text size="xs" muted>
                    No recent messages
                  </Text>
                )}
              </Card>

              {/* Billing */}
              <Card className="border-border/40 p-4">
                <div className="mb-3 flex items-center gap-2">
                  <DollarSign className="text-primary h-4 w-4" />
                  <Text size="sm" className="font-semibold">
                    Visit Billing
                  </Text>
                </div>
                {visitInvoice ? (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Text size="xs" muted>
                        Charge Amount
                      </Text>
                      <Text size="sm" className="font-medium">
                        ${visitInvoice.chargeAmount.toFixed(2)}
                      </Text>
                    </div>
                    <div className="flex items-center justify-between">
                      <Text size="xs" muted>
                        Insurance Paid
                      </Text>
                      <Text size="sm" className="text-success font-medium">
                        ${visitInvoice.insurancePaid.toFixed(2)}
                      </Text>
                    </div>
                    <div className="flex items-center justify-between">
                      <Text size="xs" muted>
                        Patient Paid
                      </Text>
                      <Text size="sm" className="text-success font-medium">
                        ${visitInvoice.patientPaid.toFixed(2)}
                      </Text>
                    </div>
                    <div className="border-border/30 flex items-center justify-between border-t pt-2">
                      <Text size="xs" className="font-medium">
                        Balance
                      </Text>
                      <Text
                        size="sm"
                        className={cn(
                          "font-semibold",
                          visitInvoice.balance > 0 ? "text-warning" : "text-success"
                        )}
                      >
                        ${visitInvoice.balance.toFixed(2)}
                      </Text>
                    </div>
                    <Badge
                      className={cn(
                        "w-full justify-center rounded-lg py-1",
                        visitInvoice.status === "Paid"
                          ? "bg-success/15 text-success"
                          : visitInvoice.status === "Pending"
                            ? "bg-warning/15 text-warning"
                            : "bg-muted text-muted-foreground"
                      )}
                    >
                      {visitInvoice.status}
                    </Badge>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Text size="xs" muted>
                      No billing record for this visit
                    </Text>
                    <div className="bg-muted/40 rounded-lg px-3 py-2">
                      <Text size="xs" className="font-medium">
                        Patient Balance
                      </Text>
                      <Text size="sm" className="font-semibold">
                        {patient.balance.amount}
                      </Text>
                    </div>
                  </div>
                )}
              </Card>
            </CardWrapper>
          </motion.div>
        )}

        {/* ESC key hint when in full view */}
        <AnimatePresence>
          {isFullView && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="fixed bottom-4 left-1/2 -translate-x-1/2"
            >
              <div className="bg-foreground/90 text-card flex items-center gap-2 rounded-full px-4 py-2 shadow-lg">
                <kbd className="bg-foreground/70 text-card rounded px-2 py-0.5 font-mono text-xs">
                  ESC
                </kbd>
                <Text size="sm" className="text-card/80">
                  to exit full view
                </Text>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
