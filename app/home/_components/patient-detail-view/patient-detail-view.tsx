"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CardWrapper } from "@/design-system/components/ui/card-wrapper";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/design-system/components/ui/tabs";
import { Text } from "@/design-system/components/ui/typography";
import { cn } from "@/design-system/lib/utils";
import {
  useViewState,
  usePatientViewNavigation,
  useSelectedIds,
  usePatientViewReset,
} from "@/src/lib/stores/patient-view-store";
import type { PatientDetail, PatientDetailViewProps } from "./types";

// Import sub-components
import { AdaptivePatientHeader } from "./adaptive-patient-header";
import { OverviewTab } from "./overview-tab";
import { AppointmentsTab } from "./appointments-tab";
import { MedicalRecordsTab } from "./medical-records-tab";
import { MessagesTab } from "./messages-tab";
import { BillingTab } from "./billing-tab";
import { ReviewsTab } from "./reviews-tab";
import { VisitSummaryPanel } from "./visit-summary-panel";
import { ClinicalNoteView } from "./clinical-note-view";

const tabTriggerStyles =
  "rounded-none border-b-2 border-transparent bg-transparent shadow-none px-2.5 py-2 text-sm font-medium text-foreground-strong whitespace-nowrap hover:text-primary data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none sm:px-3 sm:text-base lg:px-4 lg:text-xl lg:font-light";

// Smooth easing curve for entrance/exit (typed as tuple for framer-motion)
const smoothEase: [number, number, number, number] = [0.25, 0.1, 0.25, 1.0];

// Animation variants for view transitions
const viewVariants = {
  initial: (direction: number) => ({
    opacity: 0,
    x: direction > 0 ? 40 : -40,
  }),
  animate: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.35,
      ease: smoothEase,
    },
  },
  exit: (direction: number) => ({
    opacity: 0,
    x: direction < 0 ? 40 : -40,
    transition: {
      duration: 0.25,
      ease: smoothEase,
    },
  }),
};

// Full view backdrop animation
const backdropVariants = {
  initial: { opacity: 0 },
  animate: {
    opacity: 1,
    transition: { duration: 0.4, ease: smoothEase },
  },
  exit: {
    opacity: 0,
    transition: { duration: 0.3, ease: smoothEase },
  },
};

// Custom expo-out curve for full view
const expoOut: [number, number, number, number] = [0.16, 1, 0.3, 1];
const subtleOvershoot: [number, number, number, number] = [0.34, 1.56, 0.64, 1];

// Full view container animation - elegant scale and fade
const fullViewVariants = {
  initial: {
    opacity: 0,
    scale: 0.95,
    y: 20,
  },
  animate: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: expoOut,
      scale: { duration: 0.5, ease: subtleOvershoot },
    },
  },
  exit: {
    opacity: 0,
    scale: 0.97,
    y: 10,
    transition: {
      duration: 0.3,
      ease: smoothEase,
    },
  },
};

// Type for selected activity with full details
type SelectedActivity = PatientDetail["recentActivity"][number];

export function PatientDetailView({
  patient,
  className,
  initialTab = "overview",
  onBackToRoster,
}: PatientDetailViewProps) {
  // Get view state from store
  const viewState = useViewState();
  const { transitionTo, goBack } = usePatientViewNavigation();
  const { selectedVisitId } = useSelectedIds();
  const reset = usePatientViewReset();

  // Track patient ID to detect changes
  const previousPatientId = React.useRef<string | null>(null);

  // State for controlled tab
  const [activeTab, setActiveTab] = React.useState(initialTab);

  // Track direction for animations
  const [direction, setDirection] = React.useState(0);
  const previousViewState = React.useRef(viewState);
  const isFirstRender = React.useRef(true);

  // Update direction based on view state changes
  React.useEffect(() => {
    // Skip direction update on first render
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    const states = ["default", "summary", "note", "fullView"];
    const prevIndex = states.indexOf(previousViewState.current);
    const currentIndex = states.indexOf(viewState);
    setDirection(currentIndex > prevIndex ? 1 : -1);
    previousViewState.current = viewState;
  }, [viewState]);

  // Reset view state when patient changes
  React.useEffect(() => {
    if (
      patient?.id &&
      previousPatientId.current !== null &&
      previousPatientId.current !== patient.id
    ) {
      // Patient changed, reset to default view
      reset();
    }
    previousPatientId.current = patient?.id ?? null;
  }, [patient?.id, reset]);

  // Update activeTab when initialTab changes (e.g., from voice command)
  React.useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  // Find selected activity based on selectedVisitId
  const selectedActivity = React.useMemo<SelectedActivity | null>(() => {
    if (!patient || !selectedVisitId) return null;
    return patient.recentActivity.find((a) => a.id === selectedVisitId) || null;
  }, [patient, selectedVisitId]);

  // Auto-recover: if in summary/note state but activity not found, reset to default
  React.useEffect(() => {
    if (
      (viewState === "summary" || viewState === "note") &&
      selectedVisitId &&
      !selectedActivity &&
      patient
    ) {
      console.warn("Selected activity not found, resetting to default view");
      reset();
    }
  }, [viewState, selectedVisitId, selectedActivity, patient, reset]);

  // Handle activity selection from overview tab
  const handleActivitySelect = React.useCallback(
    (activity: SelectedActivity) => {
      transitionTo("summary", activity.id);
    },
    [transitionTo]
  );

  // Handle back from summary - go back to default
  const handleBackFromSummary = React.useCallback(() => {
    goBack();
  }, [goBack]);

  if (!patient) {
    return (
      <CardWrapper className={cn("flex h-full items-center justify-center", className)}>
        <Text muted className="text-center">
          Select a patient to view their details
        </Text>
      </CardWrapper>
    );
  }

  return (
    <div className={cn("flex flex-col gap-2", className)} style={{ height: "100%" }}>
      {/* Adaptive Patient Header - shrinks based on view state */}
      <div className="shrink-0">
        <AdaptivePatientHeader patient={patient} onBackToRoster={onBackToRoster} />
      </div>

      {/* Main Content Area */}
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        {/* Simplified: Always show default view when viewState is "default" */}
        {viewState === "default" && (
          <CardWrapper className="flex min-h-0 flex-1 flex-col overflow-hidden">
            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className="flex h-full w-full flex-col"
            >
              <TabsList className="border-border/50 scrollbar-none mb-3 h-auto w-full justify-start gap-0 overflow-x-auto border-b-2 bg-transparent p-0 sm:mb-6">
                <TabsTrigger value="overview" className={tabTriggerStyles}>
                  Overview
                </TabsTrigger>
                <TabsTrigger value="appointments" className={tabTriggerStyles}>
                  Appointments
                </TabsTrigger>
                <TabsTrigger value="medical-records" className={tabTriggerStyles}>
                  Medical Records
                </TabsTrigger>
                <TabsTrigger value="messages" className={tabTriggerStyles}>
                  Messages
                </TabsTrigger>
                <TabsTrigger value="billing" className={tabTriggerStyles}>
                  Billing
                </TabsTrigger>
                <TabsTrigger value="reviews" className={tabTriggerStyles}>
                  Reviews
                </TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="mt-0 flex-1 overflow-y-auto">
                <OverviewTab patient={patient} onActivitySelect={handleActivitySelect} />
              </TabsContent>

              <TabsContent value="appointments" className="mt-0 flex-1 overflow-y-auto pr-1">
                <AppointmentsTab patient={patient} />
              </TabsContent>

              <TabsContent value="medical-records" className="mt-0 flex-1 overflow-y-auto pr-1">
                <MedicalRecordsTab patient={patient} />
              </TabsContent>

              <TabsContent
                value="messages"
                className="-mx-4 mt-0 -mb-4 flex-1 overflow-hidden sm:-mx-6 sm:-mb-6"
              >
                <MessagesTab patient={patient} />
              </TabsContent>

              <TabsContent value="billing" className="mt-0 flex-1 overflow-y-auto pr-1">
                <BillingTab patient={patient} />
              </TabsContent>

              <TabsContent value="reviews" className="mt-0 flex-1 overflow-y-auto pr-1">
                <ReviewsTab patient={patient} />
              </TabsContent>
            </Tabs>
          </CardWrapper>
        )}

        {/* AnimatePresence for other views */}
        <AnimatePresence mode="wait" custom={direction} initial={false}>
          {/* Summary View: Visit Summary Panel */}
          {viewState === "summary" && selectedActivity && (
            <motion.div
              key="summary-view"
              custom={direction}
              variants={viewVariants}
              initial={false}
              animate="animate"
              exit="exit"
              className="flex min-h-0 flex-1 flex-col overflow-hidden"
            >
              <CardWrapper className="h-full overflow-hidden">
                <VisitSummaryPanel
                  activity={selectedActivity}
                  patientName={patient.name}
                  onBack={handleBackFromSummary}
                />
              </CardWrapper>
            </motion.div>
          )}

          {/* Note View: Clinical Note (not full view) */}
          {viewState === "note" && selectedActivity && (
            <motion.div
              key="note-view"
              custom={direction}
              variants={viewVariants}
              initial={false}
              animate="animate"
              exit="exit"
              className="flex min-h-0 flex-1 flex-col overflow-hidden"
            >
              <CardWrapper className="h-full overflow-hidden">
                <ClinicalNoteView
                  activity={selectedActivity}
                  patientName={patient.name}
                  patient={patient}
                />
              </CardWrapper>
            </motion.div>
          )}

          {/* Fallback when no activity is selected but we're in summary/note state */}
          {(viewState === "summary" || viewState === "note") && !selectedActivity && (
            <motion.div
              key="fallback-view"
              custom={direction}
              variants={viewVariants}
              initial={false}
              animate="animate"
              exit="exit"
              className="flex min-h-0 flex-1 flex-col overflow-hidden"
            >
              <CardWrapper className="flex h-full items-center justify-center">
                <Text muted>Select an activity to view details</Text>
              </CardWrapper>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Full View: Clinical Note - Rendered outside AnimatePresence for overlay effect */}
        <AnimatePresence>
          {viewState === "fullView" && selectedActivity && (
            <>
              {/* Blurred backdrop with elegant fade */}
              <motion.div
                key="fullview-backdrop"
                variants={backdropVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                className="bg-background/80 fixed inset-0 z-40 backdrop-blur-xl"
              />
              {/* Full view container with elegant scale animation */}
              <motion.div
                key="fullview-content"
                variants={fullViewVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                className="fixed inset-0 z-50"
              >
                <CardWrapper className="bg-background/95 h-full overflow-hidden rounded-none border-0 shadow-none">
                  <ClinicalNoteView
                    activity={selectedActivity}
                    patientName={patient.name}
                    patient={patient}
                  />
                </CardWrapper>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
