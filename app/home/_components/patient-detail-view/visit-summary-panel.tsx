"use client";

import * as React from "react";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  FileText,
  Stethoscope,
  ClipboardList,
  Sparkles,
  DollarSign,
} from "lucide-react";
import { Card } from "@/design-system/components/ui/card";
import { Badge } from "@/design-system/components/ui/badge";
import { Button } from "@/design-system/components/ui/button";
import { Heading, Text } from "@/design-system/components/ui/typography";
import { cn } from "@/design-system/lib/utils";
import { usePatientViewNavigation } from "@/src/lib/stores/patient-view-store";
import type { PatientDetail } from "./types";

// Type for selected activity with full details
type SelectedActivity = PatientDetail["recentActivity"][number];

// Elegant easing curves (typed as tuple for framer-motion)
const smoothEase: [number, number, number, number] = [0.25, 0.1, 0.25, 1.0];

// Container variants for staggered children
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
  exit: {
    opacity: 0,
    transition: {
      staggerChildren: 0.04,
      staggerDirection: -1,
    },
  },
};

// Item variants for individual sections
const itemVariants = {
  hidden: {
    opacity: 0,
    y: 20,
    scale: 0.98,
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.4,
      ease: smoothEase,
    },
  },
  exit: {
    opacity: 0,
    y: -10,
    scale: 0.98,
    transition: {
      duration: 0.2,
      ease: smoothEase,
    },
  },
};

// Header animation with slide-in effect
const headerVariants = {
  hidden: {
    opacity: 0,
    x: -20,
  },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.35,
      ease: smoothEase,
    },
  },
  exit: {
    opacity: 0,
    x: -10,
    transition: {
      duration: 0.2,
      ease: smoothEase,
    },
  },
};

// Footer slide-up animation
const footerVariants = {
  hidden: {
    opacity: 0,
    y: 20,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: smoothEase,
      delay: 0.3,
    },
  },
  exit: {
    opacity: 0,
    y: 10,
    transition: {
      duration: 0.2,
      ease: smoothEase,
    },
  },
};

interface VisitSummaryPanelProps {
  activity: SelectedActivity;
  patientName: string;
  /** Optional callback for backward compatibility */
  onBack?: () => void;
  className?: string;
}

export function VisitSummaryPanel({
  activity,
  patientName: _patientName,
  onBack,
  className,
}: VisitSummaryPanelProps) {
  const { goBack, transitionTo } = usePatientViewNavigation();

  // Handle back navigation - use store or fallback to prop
  const handleBack = React.useCallback(() => {
    if (onBack) {
      onBack();
    } else {
      goBack();
    }
  }, [onBack, goBack]);

  // Handle view full note - transition to note view
  const handleViewFullNote = React.useCallback(() => {
    transitionTo("note", activity.id);
  }, [transitionTo, activity.id]);

  return (
    <motion.div
      className={cn("flex flex-col pb-24 md:pb-0 lg:h-full", className)}
      initial="hidden"
      animate="visible"
      exit="exit"
    >
      {/* Header with back button */}
      <motion.div variants={headerVariants} className="mb-6 flex items-center gap-4">
        <motion.button
          onClick={handleBack}
          aria-label="Go back to overview"
          className="bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground flex h-10 w-10 items-center justify-center rounded-xl transition-all"
          whileHover={{ scale: 1.05, backgroundColor: "rgba(var(--primary), 0.1)" }}
          whileTap={{ scale: 0.95 }}
        >
          <ArrowLeft className="h-5 w-5" />
        </motion.button>
        <div>
          <Heading level={4} className="text-lg font-semibold sm:text-xl">
            {activity.title}
          </Heading>
          <Text size="sm" muted className="mt-0.5">
            {activity.date}
          </Text>
        </div>
      </motion.div>

      {/* Visit details - staggered sections */}
      <motion.div variants={containerVariants} className="flex-1 space-y-6 pr-2 lg:overflow-y-auto">
        {/* Session Info Card */}
        <motion.div variants={itemVariants}>
          <Card className="border-border/40 from-muted/30 to-muted/10 overflow-hidden bg-gradient-to-br p-0 shadow-sm">
            <div className="divide-border/30 grid grid-cols-2 divide-x sm:grid-cols-4">
              <div className="p-4">
                <Text
                  size="xs"
                  muted
                  className="mb-1 text-[10px] font-semibold tracking-wider uppercase"
                >
                  Duration
                </Text>
                <Text size="sm" className="font-semibold">
                  {activity.duration || "30 minutes"}
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
                  Type
                </Text>
                <Text size="sm" className="font-semibold">
                  {activity.appointmentType || activity.title}
                </Text>
              </div>
              <div className="p-4">
                <Text
                  size="xs"
                  muted
                  className="mb-1 text-[10px] font-semibold tracking-wider uppercase"
                >
                  Location
                </Text>
                <Text size="sm" className="font-semibold">
                  In-office
                </Text>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Visit Summary */}
        <motion.section variants={itemVariants}>
          <div className="mb-3 flex items-center gap-2.5">
            <div className="bg-primary/10 flex h-7 w-7 items-center justify-center rounded-lg">
              <FileText className="text-primary h-3.5 w-3.5" />
            </div>
            <Text size="sm" className="font-semibold">
              Session Summary
            </Text>
          </div>
          <Card className="border-border/40 bg-card/60 p-4 shadow-sm">
            <Text size="sm" className="text-foreground/80 leading-relaxed">
              {activity.visitSummary || activity.description}
            </Text>
          </Card>
        </motion.section>

        {/* Diagnosis/Focus Areas */}
        {activity.diagnosisCodes && activity.diagnosisCodes.length > 0 && (
          <motion.section variants={itemVariants}>
            <div className="mb-3 flex items-center gap-2.5">
              <div className="bg-primary/10 flex h-7 w-7 items-center justify-center rounded-lg">
                <Stethoscope className="text-primary h-3.5 w-3.5" />
              </div>
              <Text size="sm" className="font-semibold">
                Focus Areas
              </Text>
            </div>
            <div className="flex flex-wrap gap-2">
              {activity.diagnosisCodes.map((code, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.1 * i, duration: 0.3 }}
                >
                  <Badge
                    variant="secondary"
                    className="bg-primary/10 text-primary hover:bg-primary/15 rounded-lg px-3 py-1.5 text-xs font-medium transition-all hover:scale-105"
                  >
                    {code}
                  </Badge>
                </motion.div>
              ))}
            </div>
          </motion.section>
        )}

        {/* Treatment Notes */}
        {activity.treatmentNotes && (
          <motion.section variants={itemVariants}>
            <div className="mb-3 flex items-center gap-2.5">
              <div className="bg-primary/10 flex h-7 w-7 items-center justify-center rounded-lg">
                <ClipboardList className="text-primary h-3.5 w-3.5" />
              </div>
              <Text size="sm" className="font-semibold">
                Treatment Notes
              </Text>
            </div>
            <Card className="border-border/40 bg-card/60 p-4 shadow-sm">
              <Text size="sm" className="text-foreground/80 leading-relaxed">
                {activity.treatmentNotes}
              </Text>
            </Card>
          </motion.section>
        )}

        {/* Next Steps */}
        {activity.nextSteps && (
          <motion.section variants={itemVariants}>
            <div className="mb-3 flex items-center gap-2.5">
              <div className="bg-warning/10 flex h-7 w-7 items-center justify-center rounded-lg">
                <Sparkles className="text-warning h-3.5 w-3.5" />
              </div>
              <Text size="sm" className="font-semibold">
                Next Steps
              </Text>
            </div>
            <Card className="border-warning/20 from-warning-bg to-warning-bg/40 bg-gradient-to-br p-4 shadow-sm">
              <Text size="sm" className="text-foreground/80 leading-relaxed">
                {activity.nextSteps}
              </Text>
            </Card>
          </motion.section>
        )}

        {/* Billing Summary */}
        <motion.section variants={itemVariants}>
          <div className="mb-3 flex items-center gap-2.5">
            <div className="bg-success/10 flex h-7 w-7 items-center justify-center rounded-lg">
              <DollarSign className="text-success h-3.5 w-3.5" />
            </div>
            <Text size="sm" className="font-semibold">
              Billing Summary
            </Text>
          </div>
          <Card className="border-border/40 bg-card/60 overflow-hidden p-0 shadow-sm">
            <div className="divide-border/30 grid grid-cols-1 divide-y sm:grid-cols-3 sm:divide-x sm:divide-y-0">
              <div className="p-4">
                <Text
                  size="xs"
                  muted
                  className="mb-1 text-[10px] font-semibold tracking-wider uppercase"
                >
                  Copay Collected
                </Text>
                <Text size="sm" className="text-success font-semibold">
                  $25.00
                </Text>
              </div>
              <div className="p-4">
                <Text
                  size="xs"
                  muted
                  className="mb-1 text-[10px] font-semibold tracking-wider uppercase"
                >
                  Insurance Claim
                </Text>
                <Text size="sm" className="font-semibold">
                  Submitted
                </Text>
              </div>
              <div className="p-4">
                <Text
                  size="xs"
                  muted
                  className="mb-1 text-[10px] font-semibold tracking-wider uppercase"
                >
                  Balance
                </Text>
                <Text size="sm" className="font-semibold">
                  $0.00
                </Text>
              </div>
            </div>
          </Card>
        </motion.section>
      </motion.div>

      {/* Footer with View Note button - full width on mobile, right-aligned on desktop */}
      <motion.div
        variants={footerVariants}
        className="border-border/30 mt-6 flex justify-center border-t pt-4 lg:justify-end"
      >
        <motion.div
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="w-full lg:w-auto"
        >
          <Button
            className="h-12 w-full gap-2 shadow-sm transition-all hover:shadow-md lg:h-auto lg:w-auto"
            onClick={handleViewFullNote}
          >
            <FileText className="h-4 w-4" />
            View Full Note
          </Button>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
