"use client";

import * as React from "react";
import { AlertTriangle, Archive, Loader2, UserX } from "lucide-react";
import { Button } from "@/design-system/components/ui/button";
import { Text } from "@/design-system/components/ui/typography";
import { Label } from "@/design-system/components/ui/label";
import { Textarea } from "@/design-system/components/ui/textarea";
import { Checkbox } from "@/design-system/components/ui/checkbox";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/design-system/components/ui/alert-dialog";
import { cn } from "@/design-system/lib/utils";
import { toast } from "sonner";

export interface ArchivePatientDialogProps {
  patientId: string;
  patientName: string;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onArchive: (data: ArchivePatientData) => Promise<void>;
  hasUpcomingAppointments?: boolean;
  hasOutstandingBalance?: boolean;
  hasPendingAuthorizations?: boolean;
}

export interface ArchivePatientData {
  patientId: string;
  reason: string;
  confirmations: {
    noUpcomingAppointments: boolean;
    noOutstandingBalance: boolean;
    recordsRetained: boolean;
    notifyPatient?: boolean;
  };
}

export function ArchivePatientDialog({
  patientId,
  patientName,
  isOpen,
  onOpenChange,
  onArchive,
  hasUpcomingAppointments = false,
  hasOutstandingBalance = false,
  hasPendingAuthorizations = false,
}: ArchivePatientDialogProps) {
  const [reason, setReason] = React.useState("");
  const [confirmations, setConfirmations] = React.useState({
    noUpcomingAppointments: false,
    noOutstandingBalance: false,
    recordsRetained: false,
    notifyPatient: false,
  });
  const [isArchiving, setIsArchiving] = React.useState(false);

  const hasWarnings = hasUpcomingAppointments || hasOutstandingBalance || hasPendingAuthorizations;

  const canArchive =
    reason.trim().length >= 10 &&
    confirmations.noUpcomingAppointments &&
    confirmations.noOutstandingBalance &&
    confirmations.recordsRetained;

  const handleConfirmationChange = (key: keyof typeof confirmations, checked: boolean) => {
    setConfirmations((prev) => ({ ...prev, [key]: checked }));
  };

  const handleArchive = async () => {
    if (!canArchive) return;

    setIsArchiving(true);
    try {
      await onArchive({
        patientId,
        reason: reason.trim(),
        confirmations,
      });
      toast.success("Patient archived successfully", {
        description: `${patientName} has been moved to archived records.`,
      });
      onOpenChange(false);
      // Reset form
      setReason("");
      setConfirmations({
        noUpcomingAppointments: false,
        noOutstandingBalance: false,
        recordsRetained: false,
        notifyPatient: false,
      });
    } catch (error) {
      toast.error("Failed to archive patient", {
        description: error instanceof Error ? error.message : "Please try again.",
      });
    } finally {
      setIsArchiving(false);
    }
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-lg">
        <AlertDialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-destructive/10">
              <Archive className="h-5 w-5 text-destructive" />
            </div>
            <div>
              <AlertDialogTitle>Archive Patient Record</AlertDialogTitle>
              <AlertDialogDescription className="mt-0.5">
                You are about to archive {patientName}
              </AlertDialogDescription>
            </div>
          </div>
        </AlertDialogHeader>

        <div className="space-y-4 py-4">
          {/* Warnings */}
          {hasWarnings && (
            <div className="rounded-lg border border-warning bg-warning/10 p-3 space-y-2">
              <div className="flex items-center gap-2 text-warning">
                <AlertTriangle className="h-4 w-4" />
                <Text size="sm" weight="medium">
                  Please review before archiving
                </Text>
              </div>
              <ul className="text-sm text-muted-foreground space-y-1 ml-6">
                {hasUpcomingAppointments && (
                  <li className="list-disc">Patient has upcoming appointments scheduled</li>
                )}
                {hasOutstandingBalance && (
                  <li className="list-disc">Patient has an outstanding balance</li>
                )}
                {hasPendingAuthorizations && (
                  <li className="list-disc">Patient has pending insurance authorizations</li>
                )}
              </ul>
            </div>
          )}

          {/* Reason */}
          <div className="space-y-2">
            <Label htmlFor="archive-reason">
              Reason for Archiving <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="archive-reason"
              placeholder="Enter the reason for archiving this patient (minimum 10 characters)..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="min-h-[80px] resize-none"
            />
            <Text size="xs" muted>
              {reason.length}/10 characters minimum
            </Text>
          </div>

          {/* Confirmations */}
          <div className="space-y-3">
            <Text size="sm" weight="medium">
              Please confirm the following:
            </Text>

            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <Checkbox
                  id="confirm-appointments"
                  checked={confirmations.noUpcomingAppointments}
                  onCheckedChange={(checked) =>
                    handleConfirmationChange("noUpcomingAppointments", checked === true)
                  }
                  className="mt-0.5"
                />
                <Label htmlFor="confirm-appointments" className="text-sm font-normal cursor-pointer">
                  {hasUpcomingAppointments
                    ? "I have cancelled or rescheduled all upcoming appointments"
                    : "There are no upcoming appointments to cancel"}
                </Label>
              </div>

              <div className="flex items-start gap-3">
                <Checkbox
                  id="confirm-balance"
                  checked={confirmations.noOutstandingBalance}
                  onCheckedChange={(checked) =>
                    handleConfirmationChange("noOutstandingBalance", checked === true)
                  }
                  className="mt-0.5"
                />
                <Label htmlFor="confirm-balance" className="text-sm font-normal cursor-pointer">
                  {hasOutstandingBalance
                    ? "I have addressed the outstanding balance"
                    : "There is no outstanding balance"}
                </Label>
              </div>

              <div className="flex items-start gap-3">
                <Checkbox
                  id="confirm-records"
                  checked={confirmations.recordsRetained}
                  onCheckedChange={(checked) =>
                    handleConfirmationChange("recordsRetained", checked === true)
                  }
                  className="mt-0.5"
                />
                <Label htmlFor="confirm-records" className="text-sm font-normal cursor-pointer">
                  I understand that patient records will be retained per HIPAA requirements and can be
                  restored if needed
                </Label>
              </div>

              <div className="flex items-start gap-3 pt-2 border-t">
                <Checkbox
                  id="notify-patient"
                  checked={confirmations.notifyPatient}
                  onCheckedChange={(checked) =>
                    handleConfirmationChange("notifyPatient", checked === true)
                  }
                  className="mt-0.5"
                />
                <Label htmlFor="notify-patient" className="text-sm font-normal cursor-pointer">
                  Send notification to patient about record status change (optional)
                </Label>
              </div>
            </div>
          </div>

          {/* HIPAA Notice */}
          <div className="rounded-lg bg-muted/50 p-3">
            <Text size="xs" muted>
              <strong>HIPAA Compliance:</strong> Archived patient records are retained for the legally
              required retention period (typically 6-10 years depending on state regulations). Records
              can be restored by an administrator if the patient returns to care.
            </Text>
          </div>
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel asChild>
            <Button variant="outline" className="min-h-[44px]" disabled={isArchiving}>
              Cancel
            </Button>
          </AlertDialogCancel>
          <Button
            variant="destructive"
            onClick={handleArchive}
            disabled={!canArchive || isArchiving}
            className="min-h-[44px]"
          >
            {isArchiving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Archiving...
              </>
            ) : (
              <>
                <Archive className="mr-2 h-4 w-4" />
                Archive Patient
              </>
            )}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

// Trigger button component for convenience
export function ArchivePatientButton({
  patientId,
  patientName,
  onArchive,
  hasUpcomingAppointments,
  hasOutstandingBalance,
  hasPendingAuthorizations,
  className,
}: Omit<ArchivePatientDialogProps, "isOpen" | "onOpenChange"> & { className?: string }) {
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsOpen(true)}
        className={cn("text-muted-foreground hover:text-destructive min-h-[44px]", className)}
      >
        <UserX className="mr-2 h-4 w-4" />
        Archive Patient
      </Button>

      <ArchivePatientDialog
        patientId={patientId}
        patientName={patientName}
        isOpen={isOpen}
        onOpenChange={setIsOpen}
        onArchive={onArchive}
        hasUpcomingAppointments={hasUpcomingAppointments}
        hasOutstandingBalance={hasOutstandingBalance}
        hasPendingAuthorizations={hasPendingAuthorizations}
      />
    </>
  );
}

// Restore functionality for archived patients
export interface RestorePatientDialogProps {
  patientId: string;
  patientName: string;
  archivedDate: string;
  archivedReason: string;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onRestore: (patientId: string) => Promise<void>;
}

export function RestorePatientDialog({
  patientId,
  patientName,
  archivedDate,
  archivedReason,
  isOpen,
  onOpenChange,
  onRestore,
}: RestorePatientDialogProps) {
  const [isRestoring, setIsRestoring] = React.useState(false);

  const handleRestore = async () => {
    setIsRestoring(true);
    try {
      await onRestore(patientId);
      toast.success("Patient restored successfully", {
        description: `${patientName} has been restored to active patients.`,
      });
      onOpenChange(false);
    } catch (error) {
      toast.error("Failed to restore patient", {
        description: error instanceof Error ? error.message : "Please try again.",
      });
    } finally {
      setIsRestoring(false);
    }
  };

  const formattedDate = new Date(archivedDate).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  return (
    <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Restore Patient Record</AlertDialogTitle>
          <AlertDialogDescription>
            You are about to restore {patientName} from the archive.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="py-4 space-y-3">
          <div className="rounded-lg bg-muted/50 p-3 space-y-2">
            <div>
              <Text size="xs" muted className="uppercase tracking-wide">
                Archived On
              </Text>
              <Text size="sm">{formattedDate}</Text>
            </div>
            <div>
              <Text size="xs" muted className="uppercase tracking-wide">
                Reason
              </Text>
              <Text size="sm">{archivedReason}</Text>
            </div>
          </div>

          <Text size="sm" muted>
            Restoring this patient will make their record active again. They will appear in your
            active patient roster and can be scheduled for appointments.
          </Text>
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel asChild>
            <Button variant="outline" className="min-h-[44px]" disabled={isRestoring}>
              Cancel
            </Button>
          </AlertDialogCancel>
          <Button onClick={handleRestore} disabled={isRestoring} className="min-h-[44px]">
            {isRestoring ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Restoring...
              </>
            ) : (
              "Restore Patient"
            )}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
