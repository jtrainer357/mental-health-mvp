"use client";

/**
 * Addendum Section for Signed Notes
 * Displays existing addendums and allows adding new ones
 * @component
 */

import { useState } from "react";
import { Plus, FileText, Clock, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import type { SessionAddendum } from "@/lib/session";

interface AddendumSectionProps {
  /** List of existing addendums */
  addendums: SessionAddendum[];
  /** Callback to create a new addendum */
  onAddAddendum: (data: { content: string; reason: string }) => Promise<void>;
  /** Whether the note is signed (addendums only allowed for signed notes) */
  isNoteSigned: boolean;
  /** Whether adding is in progress */
  isLoading?: boolean;
}

export function AddendumSection({
  addendums,
  onAddAddendum,
  isNoteSigned,
  isLoading = false,
}: AddendumSectionProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [content, setContent] = useState("");
  const [reason, setReason] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!content.trim()) {
      setError("Addendum content is required");
      return;
    }
    if (!reason.trim()) {
      setError("Reason for addendum is required");
      return;
    }

    setError(null);

    try {
      await onAddAddendum({
        content: content.trim(),
        reason: reason.trim(),
      });
      setContent("");
      setReason("");
      setIsDialogOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add addendum");
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("en-US", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  };

  if (!isNoteSigned) {
    return null;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Addendums</h3>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm">
              <Plus className="h-4 w-4 mr-1" />
              Add Addendum
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Addendum</DialogTitle>
              <DialogDescription>
                Addendums are appended to the signed note and cannot be removed.
                Include a reason for the addendum.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="reason">Reason for Addendum *</Label>
                <Input
                  id="reason"
                  placeholder="e.g., Additional information received, Correction, Clarification"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="content">Addendum Content *</Label>
                <Textarea
                  id="content"
                  placeholder="Enter the addendum content..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  rows={5}
                />
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button onClick={handleSubmit} disabled={isLoading}>
                {isLoading ? "Adding..." : "Add Addendum"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Existing Addendums */}
      {addendums.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          No addendums have been added to this note.
        </p>
      ) : (
        <div className="space-y-3">
          {addendums.map((addendum, index) => (
            <Card key={addendum.id}>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium">
                    Addendum #{index + 1}
                  </CardTitle>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    {formatDate(addendum.signedAt)}
                  </div>
                </div>
                <CardDescription className="flex items-center gap-1">
                  <FileText className="h-3 w-3" />
                  Reason: {addendum.reason}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm whitespace-pre-wrap">{addendum.content}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

export default AddendumSection;
