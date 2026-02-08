"use client";

/**
 * Sign and Lock Dialog for Clinical Notes
 * Provides e-signature workflow with late entry detection
 * @component
 */

import { useState } from "react";
import { AlertTriangle, Lock, FileSignature, Clock } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { cn } from "@/lib/utils";
import { isLateEntry, getDaysSinceSession } from "@/lib/session";

interface SignAndLockDialogProps {
  /** Whether the dialog is open */
  open: boolean;
  /** Callback to close the dialog */
  onOpenChange: (open: boolean) => void;
  /** Session date for late entry detection */
  sessionDate: string;
  /** Provider name for signature display */
  providerName: string;
  /** Provider credentials (e.g., "LCSW", "PhD") */
  providerCredentials?: string;
  /** Callback when signature is confirmed */
  onSign: (data: {
    signature: string;
    isLateEntry: boolean;
    lateEntryReason?: string;
  }) => Promise<void>;
  /** Whether signing is in progress */
  isLoading?: boolean;
}

export function SignAndLockDialog({
  open,
  onOpenChange,
  sessionDate,
  providerName,
  providerCredentials,
  onSign,
  isLoading = false,
}: SignAndLockDialogProps) {
  const [attestation, setAttestation] = useState(false);
  const [lateEntryReason, setLateEntryReason] = useState("");
  const [error, setError] = useState<string | null>(null);

  const isLate = isLateEntry(sessionDate, new Date().toISOString());
  const daysSince = getDaysSinceSession(sessionDate);

  const signatureText = `${providerName}${
    providerCredentials ? `, ${providerCredentials}` : ""
  }`;
  const signatureDate = new Date().toLocaleString("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  });

  const handleSign = async () => {
    if (!attestation) {
      setError("You must attest to the accuracy of this note");
      return;
    }

    if (isLate && !lateEntryReason.trim()) {
      setError("Late entry reason is required");
      return;
    }

    setError(null);

    try {
      await onSign({
        signature: signatureText,
        isLateEntry: isLate,
        lateEntryReason: isLate ? lateEntryReason.trim() : undefined,
      });
      onOpenChange(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to sign note");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5" />
            Sign and Lock Note
          </DialogTitle>
          <DialogDescription>
            Once signed, this note will be locked and cannot be edited. You can
            add addendums after signing.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Late Entry Warning */}
          {isLate && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <strong>Late Entry:</strong> This note is being signed {daysSince}{" "}
                day{daysSince !== 1 ? "s" : ""} after the session date. A late
                entry reason is required.
              </AlertDescription>
            </Alert>
          )}

          {/* Late Entry Reason */}
          {isLate && (
            <div className="space-y-2">
              <Label htmlFor="late-reason">Late Entry Reason *</Label>
              <Textarea
                id="late-reason"
                placeholder="Explain why this note is being signed late..."
                value={lateEntryReason}
                onChange={(e) => setLateEntryReason(e.target.value)}
                rows={3}
              />
            </div>
          )}

          {/* Signature Preview */}
          <div className="rounded-lg border bg-muted/30 p-4 space-y-2">
            <div className="text-sm font-medium text-muted-foreground">
              Electronic Signature Preview
            </div>
            <div className="border-b-2 border-foreground pb-1">
              <div className="font-signature text-2xl italic">
                {signatureText}
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>{signatureDate}</span>
            </div>
          </div>

          {/* Attestation Checkbox */}
          <div className="flex items-start gap-3 rounded-lg border p-4">
            <Checkbox
              id="attestation"
              checked={attestation}
              onCheckedChange={(checked) => setAttestation(checked === true)}
            />
            <div className="space-y-1">
              <Label htmlFor="attestation" className="cursor-pointer">
                I attest that this clinical documentation is accurate and complete
              </Label>
              <p className="text-sm text-muted-foreground">
                By signing this note, I confirm that the information provided is
                true and accurate to the best of my knowledge. I understand that
                this note will be permanently locked after signing.
              </p>
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSign}
            disabled={isLoading || !attestation}
            className={cn(isLate && "bg-orange-600 hover:bg-orange-700")}
          >
            <FileSignature className="h-4 w-4 mr-2" />
            {isLoading ? "Signing..." : isLate ? "Sign as Late Entry" : "Sign Note"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default SignAndLockDialog;
