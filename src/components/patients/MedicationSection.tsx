"use client";

/**
 * Medication Section Component
 * Active and discontinued medication tracking
 * @component
 */

import { useState } from "react";
import {
  Plus,
  Pill,
  Calendar,
  AlertTriangle,
  MoreVertical,
  Archive,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import type { PatientMedication } from "@/lib/session";

interface MedicationSectionProps {
  /** Patient's medications */
  medications: PatientMedication[];
  /** Callback to add a new medication */
  onAdd: (data: Partial<PatientMedication>) => Promise<void>;
  /** Callback to update a medication */
  onUpdate: (id: string, data: Partial<PatientMedication>) => Promise<void>;
  /** Callback to remove a medication */
  onRemove: (id: string) => Promise<void>;
  /** Whether actions are loading */
  isLoading?: boolean;
  /** Whether the section is read-only */
  readOnly?: boolean;
}

export function MedicationSection({
  medications,
  onAdd,
  onUpdate,
  onRemove,
  isLoading = false,
  readOnly = false,
}: MedicationSectionProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [showDiscontinued, setShowDiscontinued] = useState(false);
  const [formData, setFormData] = useState({
    medicationName: "",
    dosage: "",
    frequency: "",
    prescriber: "",
    pharmacy: "",
    startDate: "",
    refillsRemaining: "",
    nextRefillDate: "",
    notes: "",
  });

  const activeMedications = medications.filter((m) => m.isActive);
  const discontinuedMedications = medications.filter((m) => !m.isActive);

  const handleSubmit = async () => {
    await onAdd({
      medicationName: formData.medicationName,
      dosage: formData.dosage || undefined,
      frequency: formData.frequency || undefined,
      prescriber: formData.prescriber || undefined,
      pharmacy: formData.pharmacy || undefined,
      startDate: formData.startDate || undefined,
      refillsRemaining: formData.refillsRemaining
        ? parseInt(formData.refillsRemaining)
        : undefined,
      nextRefillDate: formData.nextRefillDate || undefined,
      notes: formData.notes || undefined,
      isActive: true,
    });

    setFormData({
      medicationName: "",
      dosage: "",
      frequency: "",
      prescriber: "",
      pharmacy: "",
      startDate: "",
      refillsRemaining: "",
      nextRefillDate: "",
      notes: "",
    });
    setIsDialogOpen(false);
  };

  const isRefillDueSoon = (nextRefillDate?: string) => {
    if (!nextRefillDate) return false;
    const refillDate = new Date(nextRefillDate);
    const today = new Date();
    const daysUntilRefill = Math.ceil(
      (refillDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
    );
    return daysUntilRefill <= 7 && daysUntilRefill >= 0;
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return null;
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg">Medications</CardTitle>
            <CardDescription>
              {activeMedications.length} active medication
              {activeMedications.length !== 1 ? "s" : ""}
            </CardDescription>
          </div>
          {!readOnly && (
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <Plus className="h-4 w-4 mr-1" />
                  Add Medication
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Add Medication</DialogTitle>
                  <DialogDescription>
                    Add a new medication to the patient's list.
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="medicationName">Medication Name *</Label>
                    <Input
                      id="medicationName"
                      placeholder="e.g., Sertraline"
                      value={formData.medicationName}
                      onChange={(e) =>
                        setFormData({ ...formData, medicationName: e.target.value })
                      }
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="dosage">Dosage</Label>
                      <Input
                        id="dosage"
                        placeholder="e.g., 50mg"
                        value={formData.dosage}
                        onChange={(e) =>
                          setFormData({ ...formData, dosage: e.target.value })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="frequency">Frequency</Label>
                      <Input
                        id="frequency"
                        placeholder="e.g., Once daily"
                        value={formData.frequency}
                        onChange={(e) =>
                          setFormData({ ...formData, frequency: e.target.value })
                        }
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="prescriber">Prescriber</Label>
                    <Input
                      id="prescriber"
                      placeholder="e.g., Dr. Smith"
                      value={formData.prescriber}
                      onChange={(e) =>
                        setFormData({ ...formData, prescriber: e.target.value })
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="pharmacy">Pharmacy</Label>
                    <Input
                      id="pharmacy"
                      placeholder="e.g., CVS Pharmacy"
                      value={formData.pharmacy}
                      onChange={(e) =>
                        setFormData({ ...formData, pharmacy: e.target.value })
                      }
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="startDate">Start Date</Label>
                      <Input
                        id="startDate"
                        type="date"
                        value={formData.startDate}
                        onChange={(e) =>
                          setFormData({ ...formData, startDate: e.target.value })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="refillsRemaining">Refills Remaining</Label>
                      <Input
                        id="refillsRemaining"
                        type="number"
                        min="0"
                        placeholder="e.g., 3"
                        value={formData.refillsRemaining}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            refillsRemaining: e.target.value,
                          })
                        }
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="nextRefillDate">Next Refill Date</Label>
                    <Input
                      id="nextRefillDate"
                      type="date"
                      value={formData.nextRefillDate}
                      onChange={(e) =>
                        setFormData({ ...formData, nextRefillDate: e.target.value })
                      }
                    />
                  </div>
                </div>

                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setIsDialogOpen(false)}
                    disabled={isLoading}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSubmit}
                    disabled={isLoading || !formData.medicationName.trim()}
                  >
                    {isLoading ? "Adding..." : "Add Medication"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {medications.length === 0 ? (
          <div className="text-sm text-muted-foreground text-center py-4">
            No medications on file
          </div>
        ) : (
          <div className="space-y-4">
            {/* Active Medications */}
            <div className="space-y-2">
              {activeMedications.map((medication) => (
                <div
                  key={medication.id}
                  className={cn(
                    "rounded-lg border p-3 hover:bg-muted/50 transition-colors",
                    isRefillDueSoon(medication.nextRefillDate) &&
                      "border-orange-200 bg-orange-50/50"
                  )}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5">
                        <Pill className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">
                            {medication.medicationName}
                          </span>
                          {medication.dosage && (
                            <Badge variant="outline" className="text-xs">
                              {medication.dosage}
                            </Badge>
                          )}
                        </div>
                        {medication.frequency && (
                          <p className="text-sm text-muted-foreground">
                            {medication.frequency}
                          </p>
                        )}
                        {medication.prescriber && (
                          <p className="text-xs text-muted-foreground mt-1">
                            Prescribed by: {medication.prescriber}
                          </p>
                        )}
                        {isRefillDueSoon(medication.nextRefillDate) && (
                          <div className="flex items-center gap-1 mt-2 text-orange-600">
                            <AlertTriangle className="h-3 w-3" />
                            <span className="text-xs">
                              Refill due {formatDate(medication.nextRefillDate)}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                    {!readOnly && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                          >
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() =>
                              onUpdate(medication.id, { isActive: false })
                            }
                          >
                            <Archive className="h-4 w-4 mr-2" />
                            Discontinue
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => onRemove(medication.id)}
                            className="text-destructive"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Remove
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Discontinued Medications Toggle */}
            {discontinuedMedications.length > 0 && (
              <div className="space-y-2">
                <button
                  onClick={() => setShowDiscontinued(!showDiscontinued)}
                  className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  <Archive className="h-4 w-4" />
                  <span>
                    {showDiscontinued ? "Hide" : "Show"}{" "}
                    {discontinuedMedications.length} discontinued medication
                    {discontinuedMedications.length !== 1 ? "s" : ""}
                  </span>
                </button>

                {showDiscontinued && (
                  <div className="space-y-2 pl-6 border-l-2 border-muted">
                    {discontinuedMedications.map((medication) => (
                      <div
                        key={medication.id}
                        className="rounded-lg border border-dashed p-3 opacity-60"
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-medium line-through">
                                {medication.medicationName}
                              </span>
                              {medication.dosage && (
                                <Badge variant="outline" className="text-xs">
                                  {medication.dosage}
                                </Badge>
                              )}
                              <Badge variant="secondary" className="text-xs">
                                Discontinued
                              </Badge>
                            </div>
                            {medication.endDate && (
                              <p className="text-xs text-muted-foreground mt-1">
                                Ended: {formatDate(medication.endDate)}
                              </p>
                            )}
                          </div>
                          {!readOnly && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                onUpdate(medication.id, { isActive: true })
                              }
                            >
                              Reactivate
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default MedicationSection;
