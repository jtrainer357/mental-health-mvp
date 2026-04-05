"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { Button } from "@/design-system/components/ui/button";
import { ActivityRow } from "@/design-system/components/ui/activity-row";
import { Heading, Text } from "@/design-system/components/ui/typography";
import { useSelectedIds } from "@/src/lib/stores/patient-view-store";
import { cn } from "@/design-system/lib/utils";
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

// ── Suggested Actions Checklist (matches homepage format) ─────────────────

function SuggestedActionsChecklist({
  title,
  priority,
  items,
}: {
  title: string;
  priority: string;
  items: string[];
}) {
  const [checked, setChecked] = React.useState<Set<number>>(new Set());

  const toggleItem = (idx: number) => {
    setChecked((prev) => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx);
      else next.add(idx);
      return next;
    });
  };

  if (items.length === 0) return null;

  return (
    <div className="bg-priority-bg/30 rounded-xl px-5 py-4">
      <div className="mb-3 flex items-center gap-2">
        <Text size="sm" className="font-semibold">{title}</Text>
        <span
          className={cn(
            "rounded-full px-2 py-0.5 text-[10px] font-bold uppercase",
            priority === "urgent" && "bg-destructive/10 text-destructive",
            priority === "high" && "bg-warning-bg text-warning-muted",
            priority === "medium" && "bg-teal/10 text-teal",
          )}
        >
          {priority}
        </span>
      </div>
      <div className="space-y-2">
        {items.map((item, idx) => (
          <label
            key={idx}
            className="flex cursor-pointer items-start gap-3 rounded-lg px-2 py-1.5 transition-colors hover:bg-backbone-1/30"
          >
            <input
              type="checkbox"
              checked={checked.has(idx)}
              onChange={() => toggleItem(idx)}
              className="accent-teal mt-0.5 h-4 w-4 shrink-0 rounded"
            />
            <span
              className={cn(
                "text-sm leading-snug transition-all",
                checked.has(idx) && "text-muted-foreground line-through"
              )}
            >
              {item}
            </span>
          </label>
        ))}
      </div>
    </div>
  );
}

// ── Main Component ───────────────────────────────────────────────────────

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
            size="sm"
            className="h-8 rounded-full px-5 text-xs font-bold"
            onClick={() => {
              const name = patient.name;
              window.location.href = `/home/patients?patientName=${encodeURIComponent(name)}&startSession=true`;
            }}
          >
            Start Visit
          </Button>
        </div>
        {prioritizedActions.length > 0 ? (
          <motion.div className="flex flex-col gap-4" variants={containerVariants}>
            {prioritizedActions.slice(0, 4).map((action) => (
              <SuggestedActionsChecklist
                key={action.id}
                title={action.title}
                priority={action.priority}
                items={action.suggestedActions || []}
              />
            ))}
          </motion.div>
        ) : (
          <motion.div
            variants={itemVariants}
            className="border-border/60 bg-muted/20 rounded-xl border border-dashed py-10"
          >
            <Text size="sm" muted className="text-center">
              No prioritized actions at this time
            </Text>
          </motion.div>
        )}
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
