"use client";

import * as React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/design-system/components/ui/avatar";
import { Button } from "@/design-system/components/ui/button";
import { Card, CardContent } from "@/design-system/components/ui/card";
import { Heading, Text } from "@/design-system/components/ui/typography";
import { cn } from "@/design-system/lib/utils";
import { LabResultsSection } from "@/src/components/orchestration/LabResultsSection";
import { SuggestedActionsSection } from "@/src/components/orchestration/SuggestedActionsSection";
import { CurrentMedicationsSection } from "@/src/components/orchestration/CurrentMedicationsSection";
import { TaskProgressSection } from "./task-progress-section";
import { useShallow } from "zustand/react/shallow";
import { useOrchestrationStore } from "@/src/components/orchestration/hooks/useActionOrchestration";
import { executeActions } from "@/src/lib/orchestration/executeActions";
import type {
  OrchestrationContext,
  SuggestedAction,
  Medication,
} from "@/src/lib/orchestration/types";

interface PatientCanvasDetailProps {
  context: OrchestrationContext;
  onCancel: () => void;
  onComplete: () => void;
  className?: string;
}

// Extended medications for the demo
const extendedMedications: Medication[] = [
  { name: "Metformin", dosage: "1000mg", frequency: "twice daily" },
  { name: "Lisinopril", dosage: "10mg", frequency: "daily" },
  { name: "Atorvastatin", dosage: "20mg", frequency: "daily" },
];

export function PatientCanvasDetail({
  context,
  onCancel,
  onComplete: _onComplete,
  className,
}: PatientCanvasDetailProps) {
  const {
    showOverlay,
    startExecution,
    updateTaskProgress,
    completeExecution,
    markPatientCompleted,
  } = useOrchestrationStore(
    useShallow((state) => ({
      showOverlay: state.showOverlay,
      startExecution: state.startExecution,
      updateTaskProgress: state.updateTaskProgress,
      completeExecution: state.completeExecution,
      markPatientCompleted: state.markPatientCompleted,
    }))
  );

  const [actions, setActions] = React.useState<SuggestedAction[]>(
    context.suggestedActions.map((a) => ({ ...a }))
  );

  // Create a ref for handleCompleteAll so we can use it in event listener
  const handleCompleteAllRef = React.useRef<(() => void) | null>(null);

  // Listen for voice command to complete all actions
  React.useEffect(() => {
    function handleVoiceCompleteActions() {
      handleCompleteAllRef.current?.();
    }

    window.addEventListener("voice-complete-actions", handleVoiceCompleteActions);
    return () => {
      window.removeEventListener("voice-complete-actions", handleVoiceCompleteActions);
    };
  }, []);

  // Sync actions to store when they change
  React.useEffect(() => {
    useOrchestrationStore.setState({
      actions: actions,
      context: context,
    });
  }, [actions, context]);

  const toggleAction = (actionId: string) => {
    setActions((prev) => prev.map((a) => (a.id === actionId ? { ...a, checked: !a.checked } : a)));
  };

  const handleCompleteAll = React.useCallback(async () => {
    const checkedActions = actions.filter((a) => a.checked);
    if (checkedActions.length === 0) return;

    // Show the overlay
    showOverlay();

    // Start execution (this initializes taskProgress in the store)
    startExecution();

    // Execute actions with progress updates
    await executeActions(actions, updateTaskProgress);

    // Complete execution
    completeExecution();

    // Mark this patient as completed
    markPatientCompleted(context.patient.id);

    // The overlay will auto-close and call onComplete
  }, [
    actions,
    showOverlay,
    startExecution,
    updateTaskProgress,
    completeExecution,
    markPatientCompleted,
    context.patient.id,
  ]);

  // Update ref when handleCompleteAll changes
  React.useEffect(() => {
    handleCompleteAllRef.current = handleCompleteAll;
  }, [handleCompleteAll]);

  const initials = context.patient.name
    .split(" ")
    .map((n) => n[0])
    .join("");

  const labResults = context.clinicalData.labResults || [];

  return (
    <Card className={cn("overflow-hidden bg-white/50", className)}>
      {/* Light Header */}
      <div className="border-border/50 border-b p-4 sm:p-6">
        <div className="flex items-start gap-4">
          <Avatar className="border-border h-12 w-12 shrink-0 border-2 sm:h-14 sm:w-14">
            {context.patient.avatar && (
              <AvatarImage src={context.patient.avatar} alt={context.patient.name} />
            )}
            <AvatarFallback className="bg-avatar-fallback text-white">{initials}</AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <Heading level={4}>
              {context.patient.name}, {context.patient.age}
            </Heading>
            <Text size="sm" muted className="mt-1">
              MRN: {context.patient.mrn} &bull; DOB: {context.patient.dob} ({context.patient.age}{" "}
              years)
            </Text>
            {context.patient.primaryDiagnosis &&
              context.patient.primaryDiagnosis !== "Mental Health" && (
                <Text size="sm" className="text-muted-foreground mt-2 leading-relaxed">
                  {context.patient.primaryDiagnosis}
                </Text>
              )}
          </div>
        </div>
      </div>

      {/* Content Area */}
      <CardContent className="p-4 sm:p-6">
        <div className="grid gap-4 sm:gap-6 lg:grid-cols-2">
          {/* Left Column */}
          <div className="space-y-4 sm:space-y-6">
            <LabResultsSection labResults={labResults} />
            <SuggestedActionsSection actions={actions} onToggle={toggleAction} />
          </div>

          {/* Right Column */}
          <div className="space-y-4 sm:space-y-6">
            <CurrentMedicationsSection medications={extendedMedications} />
            <TaskProgressSection />
          </div>
        </div>
      </CardContent>

      {/* Footer */}
      <div className="border-border/50 flex flex-col-reverse gap-3 border-t px-4 py-3 sm:px-6 sm:py-4 lg:flex-row lg:items-center lg:justify-end">
        <Button
          variant="outline"
          onClick={onCancel}
          className="min-h-[48px] w-full lg:min-h-0 lg:w-auto"
        >
          Cancel
        </Button>
        <Button onClick={handleCompleteAll} className="min-h-[48px] w-full lg:min-h-0 lg:w-auto">
          Complete All Suggested Actions
        </Button>
      </div>
    </Card>
  );
}
