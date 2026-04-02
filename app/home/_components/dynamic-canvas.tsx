"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { TodaysActionsHeader } from "./priority-actions-section";
import { UnifiedSchedule } from "./unified-schedule";
import { PatientCanvasDetail } from "./patient-canvas-detail";
import { getTodayAppointments } from "@/src/lib/queries/appointments";
import { useShallow } from "zustand/react/shallow";
import { ExecutionOverlay, useOrchestrationStore } from "@/src/components/orchestration";
import type { OrchestrationContext } from "@/src/lib/orchestration/types";
import { createLogger } from "@/src/lib/logger";

const log = createLogger("DynamicCanvas");

type CanvasView = "actions" | "patient-detail";

interface DynamicCanvasProps {
  className?: string;
}

// Slide distance for the animation
const SLIDE_DISTANCE = 30;

// Smooth easing curve
const smoothEasing = [0.4, 0, 0.2, 1] as const;

// Transition settings
const transition = {
  duration: 0.3,
  ease: smoothEasing,
};

export function DynamicCanvas({ className }: DynamicCanvasProps) {
  const [view, setView] = React.useState<CanvasView>("actions");
  const [selectedContext, setSelectedContext] = React.useState<OrchestrationContext | null>(null);
  const [appointmentCount, setAppointmentCount] = React.useState(0);
  const [isLoading, setIsLoading] = React.useState(true);

  // Get overlay state from the store
  const { showExecutionOverlay, hideOverlay, taskProgress, actions, context } =
    useOrchestrationStore(
      useShallow((state) => ({
        showExecutionOverlay: state.showExecutionOverlay,
        hideOverlay: state.hideOverlay,
        taskProgress: state.taskProgress,
        actions: state.actions,
        context: state.context,
      }))
    );

  React.useEffect(() => {
    async function loadAppointmentCount() {
      try {
        const appointments = await getTodayAppointments();
        setAppointmentCount(appointments.length);
      } catch (err) {
        log.error("Failed to load appointment count", err);
      } finally {
        setIsLoading(false);
      }
    }
    loadAppointmentCount();
  }, []);

  const handleSelectPatient = (context: OrchestrationContext) => {
    setSelectedContext(context);
    setView("patient-detail");
  };

  const handleCancel = () => {
    setView("actions");
  };

  const handleComplete = () => {
    setView("actions");
  };

  // Handle overlay completion - go back to actions view
  const handleOverlayComplete = () => {
    hideOverlay();
    setView("actions");
  };

  const isActions = view === "actions";

  return (
    <div className={className + " -m-4 flex flex-col p-2 lg:-m-5 lg:p-2"}>
      {/* Fixed Header */}
      <div className="mb-5 shrink-0 sm:mb-6 lg:mb-8">
        <TodaysActionsHeader appointmentCount={appointmentCount} isLoading={isLoading} />
      </div>

      {/* Scrollable Content - px-3 allows shadows to show */}
      <div className="min-h-0 flex-1 overflow-y-auto px-3">
        {/* Container for views - relative positioning */}
        <div className="relative">
          {/* Actions View — now a single chronological schedule */}
          <motion.div
            initial={false}
            animate={{
              opacity: isActions ? 1 : 0,
              x: isActions ? 0 : -SLIDE_DISTANCE,
              pointerEvents: isActions ? "auto" : "none",
            }}
            transition={transition}
            style={{
              position: isActions ? "relative" : "absolute",
              top: 0,
              left: 0,
              right: 0,
              visibility: isActions ? "visible" : "hidden",
              zIndex: isActions ? 1 : 0,
            }}
          >
            <UnifiedSchedule onSelectPatient={handleSelectPatient} />
          </motion.div>

          {/* Detail View - in normal flow when visible */}
          <motion.div
            initial={false}
            animate={{
              opacity: isActions ? 0 : 1,
              x: isActions ? SLIDE_DISTANCE : 0,
              pointerEvents: isActions ? "none" : "auto",
            }}
            transition={transition}
            style={{
              position: isActions ? "absolute" : "relative",
              top: 0,
              left: 0,
              right: 0,
              visibility: isActions ? "hidden" : "visible",
              zIndex: isActions ? 0 : 1,
            }}
          >
            {selectedContext && (
              <PatientCanvasDetail
                context={selectedContext}
                onCancel={handleCancel}
                onComplete={handleComplete}
              />
            )}
          </motion.div>
        </div>
      </div>

      {/* Full-page Execution Overlay */}
      <ExecutionOverlay
        isVisible={showExecutionOverlay}
        taskProgress={taskProgress}
        actions={actions}
        patientName={context?.patient.name}
        onComplete={handleOverlayComplete}
      />
    </div>
  );
}
