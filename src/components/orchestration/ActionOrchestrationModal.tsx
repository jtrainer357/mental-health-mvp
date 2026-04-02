"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
} from "@/design-system/components/ui/dialog";
import { Button } from "@/design-system/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/design-system/components/ui/avatar";
import { X, AlertTriangle, CheckCircle2, Zap } from "lucide-react";
import { cn } from "@/design-system/lib/utils";

import { LabResultsSection } from "./LabResultsSection";
import { SuggestedActionsSection } from "./SuggestedActionsSection";
import { CurrentMedicationsSection } from "./CurrentMedicationsSection";
import { TaskProgressTracker } from "./TaskProgressTracker";
import { useOrchestrationStore, useCheckedActionsCount } from "./hooks/useActionOrchestration";
import { executeActions, allActionsSuccessful } from "@/src/lib/orchestration/executeActions";
import type { UrgencyLevel } from "@/src/lib/orchestration/types";

const urgencyConfig: Record<
  UrgencyLevel,
  {
    label: string;
    color: string;
    bgColor: string;
    icon: React.ComponentType<{ className?: string }>;
  }
> = {
  urgent: {
    label: "URGENT",
    color: "text-red-700",
    bgColor: "bg-red-100 border-red-200",
    icon: AlertTriangle,
  },
  high: {
    label: "HIGH PRIORITY",
    color: "text-amber-700",
    bgColor: "bg-amber-100 border-amber-200",
    icon: AlertTriangle,
  },
  medium: {
    label: "PRIORITY",
    color: "text-teal-700",
    bgColor: "bg-teal-100 border-teal-200",
    icon: Zap,
  },
};

export function ActionOrchestrationModal() {
  const {
    isOpen,
    context,
    actions,
    isExecuting,
    taskProgress,
    closeModal,
    toggleAction,
    startExecution,
    updateTaskProgress,
    completeExecution,
  } = useOrchestrationStore();

  const checkedCount = useCheckedActionsCount();
  const [executionComplete, setExecutionComplete] = React.useState(false);

  // Handle execution of all checked actions
  const handleExecuteAll = async () => {
    if (checkedCount === 0) return;

    startExecution();
    setExecutionComplete(false);

    const results = await executeActions(actions, updateTaskProgress);

    completeExecution();
    setExecutionComplete(true);

    // Auto-close modal after successful completion
    if (allActionsSuccessful(results)) {
      setTimeout(() => {
        closeModal();
        setExecutionComplete(false);
      }, 1500);
    }
  };

  // Reset execution state when modal closes
  React.useEffect(() => {
    if (!isOpen) {
      setExecutionComplete(false);
    }
  }, [isOpen]);

  if (!context) return null;

  const { patient, trigger, clinicalData } = context;
  const urgency = urgencyConfig[trigger.urgency];
  const UrgencyIcon = urgency.icon;

  const initials = patient.name
    .split(" ")
    .map((n) => n[0])
    .join("");

  const allCompleted = executionComplete && taskProgress.every((t) => t.status === "completed");

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && !isExecuting && closeModal()}>
      <DialogContent
        className="max-h-[90vh] max-w-full gap-0 overflow-hidden overflow-y-auto p-0 sm:max-w-4xl sm:rounded-xl"
        onPointerDownOutside={(e) => {
          if (isExecuting) e.preventDefault();
        }}
        onEscapeKeyDown={(e) => {
          if (isExecuting) e.preventDefault();
        }}
      >
        {/* Teal Gradient Header */}
        <div className="bg-gradient-to-r from-teal-600 to-teal-500 px-4 py-3 sm:px-6 sm:py-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <Avatar className="h-14 w-14 border-2 border-white/30 shadow-lg">
                {patient.avatar && <AvatarImage src={patient.avatar} alt={patient.name} />}
                <AvatarFallback className="bg-teal-700 text-lg font-semibold text-white">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div>
                <DialogHeader className="space-y-0 p-0 text-left">
                  <DialogTitle className="text-xl font-semibold text-white">
                    {patient.name}
                  </DialogTitle>
                  <DialogDescription className="text-teal-100">
                    MRN: {patient.mrn} | DOB: {patient.dob} | Age: {patient.age}
                  </DialogDescription>
                </DialogHeader>
                <p className="mt-1 text-sm text-teal-50">{patient.primaryDiagnosis}</p>
              </div>
            </div>

            {/* Close button (only when not executing) */}
            {!isExecuting && (
              <button
                onClick={closeModal}
                aria-label="Close modal"
                className="rounded-full p-1.5 text-white/80 transition-colors hover:bg-white/10 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            )}
          </div>

          {/* Trigger Alert */}
          <div className="mt-4">
            <div
              className={cn(
                "inline-flex items-center gap-2 rounded-full border px-3 py-1.5",
                urgency.bgColor
              )}
            >
              <UrgencyIcon className={cn("h-4 w-4", urgency.color)} />
              <span className={cn("text-xs font-bold tracking-wide uppercase", urgency.color)}>
                {urgency.label}
              </span>
            </div>
            <h3 className="mt-2 text-lg font-medium text-white">{trigger.title}</h3>
          </div>
        </div>

        {/* Modal Body - Two Column Layout */}
        <div className="grid grid-cols-1 gap-4 p-4 sm:gap-6 sm:p-6 md:grid-cols-2">
          {/* Left Column: Lab Results + Suggested Actions */}
          <div className="space-y-6">
            {clinicalData.labResults && clinicalData.labResults.length > 0 && (
              <LabResultsSection labResults={clinicalData.labResults} />
            )}
            <SuggestedActionsSection
              actions={actions}
              onToggle={toggleAction}
              disabled={isExecuting}
            />
          </div>

          {/* Right Column: Medications + Progress */}
          <div className="space-y-6">
            {clinicalData.medications && clinicalData.medications.length > 0 && (
              <CurrentMedicationsSection medications={clinicalData.medications} />
            )}
            <AnimatePresence>
              {taskProgress.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                >
                  <TaskProgressTracker taskProgress={taskProgress} actions={actions} />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Footer */}
        <DialogFooter className="border-t border-stone-200 bg-stone-50 px-4 py-3 sm:px-6 sm:py-4">
          <div className="flex w-full flex-col items-stretch justify-between gap-3 lg:flex-row lg:items-center lg:gap-0">
            <div className="text-sm text-stone-500">
              {isExecuting ? (
                <span className="flex items-center gap-2">
                  <span className="h-2 w-2 animate-pulse rounded-full bg-teal-500" />
                  Executing actions...
                </span>
              ) : allCompleted ? (
                <span className="flex items-center gap-2 text-emerald-600">
                  <CheckCircle2 className="h-4 w-4" />
                  All actions completed successfully
                </span>
              ) : (
                <span>
                  {checkedCount} of {actions.length} actions selected
                </span>
              )}
            </div>
            <div className="flex flex-col-reverse items-stretch gap-3 lg:flex-row lg:items-center lg:gap-3">
              {!isExecuting && !allCompleted && (
                <Button
                  variant="outline"
                  onClick={closeModal}
                  className="min-h-[48px] w-full border-stone-300 lg:min-h-0 lg:w-auto"
                >
                  Cancel
                </Button>
              )}
              <Button
                onClick={handleExecuteAll}
                disabled={isExecuting || checkedCount === 0 || allCompleted}
                className={cn(
                  "min-h-[48px] w-full bg-orange-500 text-white hover:bg-orange-600 lg:min-h-0 lg:w-auto",
                  "disabled:bg-orange-300 disabled:opacity-100"
                )}
              >
                {isExecuting ? (
                  <>
                    <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Executing...
                  </>
                ) : allCompleted ? (
                  <>
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                    Completed
                  </>
                ) : (
                  <>
                    <span className="hidden sm:inline">
                      Let AI Handle These ({checkedCount})
                    </span>
                    <span className="sm:hidden">Let AI Handle ({checkedCount})</span>
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
