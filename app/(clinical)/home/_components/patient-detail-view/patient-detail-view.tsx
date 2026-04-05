"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CardWrapper } from "@/design-system/components/ui/card-wrapper";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/design-system/components/ui/tabs";
import { Text } from "@/design-system/components/ui/typography";
import { cn } from "@/design-system/lib/utils";
import { smoothEase, expoOut, subtleOvershoot } from "@/design-system/lib/animation-constants";
import {
  useViewState,
  usePatientViewNavigation,
  useSelectedIds,
  usePatientViewReset,
} from "@/src/lib/stores/patient-view-store";
import type { PatientDetailViewProps, SelectedActivity } from "./types";

// Import sub-components
import { AdaptivePatientHeader } from "./adaptive-patient-header";
import { OverviewTab } from "./overview-tab";
import { AppointmentsTab } from "./appointments-tab";
import { MedicalRecordsTab } from "./medical-records-tab";
import { BillingTab } from "./billing-tab";
import { VisitSummaryPanel } from "./visit-summary-panel";
import { ClinicalNoteView } from "./clinical-note-view";

const tabTriggerStyles =
  "rounded-none border-b-2 border-transparent bg-transparent shadow-none px-2.5 py-2 text-sm font-medium text-foreground-strong whitespace-nowrap hover:text-primary data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none sm:px-3 sm:text-base lg:px-4 lg:text-xl lg:font-light";

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

// Reusable animation wrapper for tab content
function AnimatedTabContent({ children, tabKey }: { children: React.ReactNode; tabKey: string }) {
  return (
    <motion.div
      key={tabKey}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: smoothEase }}
    >
      {children}
    </motion.div>
  );
}

export function PatientDetailView({
  patient,
  className,
  initialTab = "overview",
  startSession = false,
  onBackToRoster,
}: PatientDetailViewProps) {
  // Get view state from store
  const viewState = useViewState();
  const { transitionTo, goBack } = usePatientViewNavigation();
  const { selectedVisitId } = useSelectedIds();
  const reset = usePatientViewReset();

  // Track patient ID to detect changes
  const previousPatientId = React.useRef<string | null>(null);

  // Full view focus management
  const fullViewRef = React.useRef<HTMLDivElement>(null);
  const isFullView = viewState === "fullView";
  React.useEffect(() => {
    if (isFullView && fullViewRef.current) {
      fullViewRef.current.focus();
    }
  }, [isFullView]);

  // State for controlled tab
  const [activeTab, setActiveTab] = React.useState(initialTab);

  // Reset view state when patient changes or on initial mount
  React.useEffect(() => {
    if (patient?.id) {
      if (previousPatientId.current !== patient.id) {
        // Patient changed (or first load), reset to default view
        reset();
      }
      previousPatientId.current = patient.id;
    }
  }, [patient?.id, reset]);

  // Update activeTab when initialTab changes (e.g., from voice command)
  React.useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  // Blank session activity for startSession mode
  const blankSessionActivity = React.useMemo<SelectedActivity | null>(() => {
    if (!startSession || !patient) return null;
    const today = new Date().toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
    return {
      id: "new-session",
      title: "Psychotherapy Session",
      description: "",
      date: today,
      duration: "50 minutes",
      provider: "Dr. Sarah Chen",
      appointmentType: "Individual Therapy",
      cptCode: "90837",
      noteStatus: "draft" as const,
      noteType: "progress_note" as const,
    };
  }, [startSession, patient]);

  // Auto-open note view when startSession is true
  const hasStartedSession = React.useRef(false);
  React.useEffect(() => {
    if (startSession && patient && blankSessionActivity && !hasStartedSession.current) {
      hasStartedSession.current = true;
      // Add blank activity to patient data immutably and navigate to note
      if (!patient.recentActivity.find((a) => a.id === "new-session")) {
        const activityWithBlank = [blankSessionActivity, ...patient.recentActivity];
        patient.recentActivity = activityWithBlank;
      }
      transitionTo("fullView", "new-session");
    }
  }, [startSession, patient, blankSessionActivity, transitionTo]);

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
      transitionTo("note", activity.id);
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
    <div className={cn("flex flex-col gap-2", className)}>
      {/* Adaptive Patient Header - hidden in note/fullView since clinical note has its own header */}
      {viewState !== "note" && viewState !== "fullView" && (
        <div className="shrink-0">
          <AdaptivePatientHeader patient={patient} onBackToRoster={onBackToRoster} />
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col">
        <AnimatePresence mode="wait" initial={false}>
          {viewState === "default" && (
            <motion.div
              key={`default-${patient.id}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25, ease: [0.25, 0.1, 0.25, 1.0] }}
              className="flex flex-1 flex-col"
            >
              <CardWrapper className="flex flex-1 flex-col pb-20 md:pb-0">
                <Tabs
                  value={activeTab}
                  onValueChange={setActiveTab}
                  className="flex w-full flex-col"
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
                    <TabsTrigger value="billing" className={tabTriggerStyles}>
                      Billing
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent
                    value="overview"
                    className="mt-0 flex-1"
                    forceMount={activeTab === "overview" ? true : undefined}
                  >
                    <AnimatedTabContent tabKey={`tab-overview-${patient.id}`}>
                      <OverviewTab
                        key={patient.id}
                        patient={patient}
                        onActivitySelect={handleActivitySelect}
                      />
                    </AnimatedTabContent>
                  </TabsContent>

                  <TabsContent
                    value="appointments"
                    className="mt-0 flex-1 pr-1"
                    forceMount={activeTab === "appointments" ? true : undefined}
                  >
                    <AnimatedTabContent tabKey={`tab-appointments-${patient.id}`}>
                      <AppointmentsTab patient={patient} />
                    </AnimatedTabContent>
                  </TabsContent>

                  <TabsContent
                    value="medical-records"
                    className="mt-0 flex-1 pr-1"
                    forceMount={activeTab === "medical-records" ? true : undefined}
                  >
                    <AnimatedTabContent tabKey={`tab-medical-${patient.id}`}>
                      <MedicalRecordsTab patient={patient} />
                    </AnimatedTabContent>
                  </TabsContent>

                  <TabsContent
                    value="billing"
                    className="mt-0 flex-1 pr-1"
                    forceMount={activeTab === "billing" ? true : undefined}
                  >
                    <AnimatedTabContent tabKey={`tab-billing-${patient.id}`}>
                      <BillingTab patient={patient} />
                    </AnimatedTabContent>
                  </TabsContent>
                </Tabs>
              </CardWrapper>
            </motion.div>
          )}

          {viewState === "summary" && selectedActivity && (
            <motion.div
              key="summary-view"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25, ease: [0.25, 0.1, 0.25, 1.0] }}
              className="flex flex-1 flex-col"
            >
              <CardWrapper className="">
                <VisitSummaryPanel
                  activity={selectedActivity}
                  patientName={patient.name}
                  onBack={handleBackFromSummary}
                />
              </CardWrapper>
            </motion.div>
          )}

          {viewState === "note" && selectedActivity && (
            <motion.div
              key="note-view"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25, ease: [0.25, 0.1, 0.25, 1.0] }}
              className="flex flex-1 flex-col"
            >
              <CardWrapper className="">
                <ClinicalNoteView
                  activity={selectedActivity}
                  patientName={patient.name}
                  patient={patient}
                />
              </CardWrapper>
            </motion.div>
          )}

          {(viewState === "summary" || viewState === "note") && !selectedActivity && (
            <motion.div
              key="no-activity"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
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
                ref={fullViewRef}
                tabIndex={-1}
                onKeyDown={(e) => {
                  if (e.key === "Escape") {
                    e.preventDefault();
                    goBack();
                  }
                }}
                variants={fullViewVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                className="fixed inset-0 z-50 outline-none"
              >
                <CardWrapper className="bg-background/95 h-full overflow-y-auto rounded-none border-0 shadow-none">
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
