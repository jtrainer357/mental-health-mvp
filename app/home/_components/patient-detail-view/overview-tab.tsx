"use client";

import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { Button } from "@/design-system/components/ui/button";
import { ActivityRow } from "@/design-system/components/ui/activity-row";
import { Heading, Text } from "@/design-system/components/ui/typography";
import { PriorityActionCard } from "@/design-system/components/ui/priority-action-card";
import { useSelectedIds } from "@/src/lib/stores/patient-view-store";
import { smoothEase } from "@/design-system/lib/animation-constants";
import type { PatientDetail } from "./types";

// Container variants for staggered children
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.05,
    },
  },
};

// Item variants for activity rows
const itemVariants = {
  hidden: {
    opacity: 0,
    y: 15,
    scale: 0.98,
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.35,
      ease: smoothEase,
    },
  },
};

// Section variants
const sectionVariants = {
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
    },
  },
};

interface OverviewTabProps {
  patient: PatientDetail;
  onActivitySelect: (activity: PatientDetail["recentActivity"][number]) => void;
}

export function OverviewTab({ patient, onActivitySelect }: OverviewTabProps) {
  const { selectedVisitId } = useSelectedIds();

  // Use prioritized actions from parent (already fetched and mapped by PatientsPage)
  const prioritizedActions = patient.prioritizedActions || [];

  return (
    <motion.div
      className="flex flex-col gap-8"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      {/* Prioritized Actions - AI Surfaced */}
      <motion.section variants={sectionVariants}>
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Heading level={5} className="text-base font-semibold sm:text-lg">
              Prioritized Actions
            </Heading>
            <motion.span
              className="bg-primary/10 text-primary inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-semibold sm:text-xs"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.3 }}
            >
              <Sparkles className="h-3 w-3" />
              AI Surfaced
            </motion.span>
          </div>
          <Button
            variant="link"
            className="text-primary hover:text-primary/80 h-auto p-0 text-xs font-medium sm:text-sm"
          >
            View All
          </Button>
        </div>
        <motion.div className="flex flex-col gap-3" variants={containerVariants}>
          {prioritizedActions.slice(0, 4).map((action, index) => (
            <motion.div key={action.id} variants={itemVariants} custom={index}>
              <PriorityActionCard
                type={action.type}
                title={action.title}
                description={action.description}
                priority={action.priority}
                dueDate={action.dueDate}
                aiConfidence={action.aiConfidence}
              />
            </motion.div>
          ))}
          {prioritizedActions.length === 0 && (
            <motion.div
              variants={itemVariants}
              className="border-border/60 bg-muted/20 rounded-xl border border-dashed py-10"
            >
              <Text size="sm" muted className="text-center">
                No prioritized actions at this time
              </Text>
            </motion.div>
          )}
        </motion.div>
      </motion.section>

      {/* Recent Activity */}
      <motion.section variants={sectionVariants}>
        <Heading level={5} className="mb-4 text-base font-semibold sm:text-lg">
          Recent Activity
        </Heading>
        <motion.div variants={containerVariants}>
          {patient.recentActivity.map((activity, index) => (
            <motion.div key={activity.id} variants={itemVariants} custom={index}>
              <ActivityRow
                title={activity.title}
                description={activity.description}
                date={activity.date}
                isRecent={index === 0}
                isLast={index === patient.recentActivity.length - 1}
                selected={selectedVisitId === activity.id}
                onClick={() => onActivitySelect(activity)}
              />
            </motion.div>
          ))}
          {patient.recentActivity.length === 0 && (
            <motion.div variants={itemVariants} className="py-10">
              <Text size="sm" muted className="text-center">
                No recent activity
              </Text>
            </motion.div>
          )}
        </motion.div>
      </motion.section>
    </motion.div>
  );
}
