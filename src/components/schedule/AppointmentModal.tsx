"use client";

/**
 * AppointmentModal - Create/Edit appointment modal
 * Agent: GAMMA | Feature: Scheduling Production
 */

import * as React from "react";
import { useState, useCallback, useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { format, parse } from "date-fns";
import { Calendar, Clock, User, MapPin, Video, Repeat, AlertCircle, Search } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/design-system/components/ui/dialog";
import { Button } from "@/design-system/components/ui/button";
import { Input } from "@/design-system/components/ui/input";
import { Label } from "@/design-system/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/design-system/components/ui/select";
import { Textarea } from "@/design-system/components/ui/textarea";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/design-system/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/design-system/components/ui/popover";
import { cn } from "@/design-system/lib/utils";
import { APPOINTMENT_TYPES, type AppointmentTypeCode } from "@/src/lib/supabase/types";
import { DEMO_PRACTICE_ID } from "@/src/lib/utils/demo-date";
import { patientKeys, appointmentKeys } from "@/src/lib/queries/keys";
import { createClient } from "@/src/lib/supabase/client";

interface ConflictingAppointment {
  id: string;
  patientName: string;
  date: string;
  startTime: string;
  endTime: string;
}

interface AppointmentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultDate?: string;
  defaultTime?: string;
  onSuccess?: () => void;
}

interface PatientOption {
  id: string;
  firstName: string;
  lastName: string;
  avatarUrl?: string | null;
}

// Generate time slots from 8:00 AM to 6:00 PM in 15-minute intervals
const TIME_SLOTS = Array.from({ length: 41 }, (_, i) => {
  const hours = Math.floor(i / 4) + 8;
  const minutes = (i % 4) * 15;
  const time24 = `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`;
  const time12 =
    hours > 12
      ? `${hours - 12}:${minutes.toString().padStart(2, "0")} PM`
      : hours === 12
        ? `12:${minutes.toString().padStart(2, "0")} PM`
        : `${hours}:${minutes.toString().padStart(2, "0")} AM`;
  return { value: time24, label: time12 };
});

export function AppointmentModal({
  open,
  onOpenChange,
  defaultDate,
  defaultTime,
  onSuccess,
}: AppointmentModalProps) {
  const queryClient = useQueryClient();

  // Form state
  const [patientId, setPatientId] = useState<string>("");
  const [patientSearchOpen, setPatientSearchOpen] = useState(false);
  const [patientSearchQuery, setPatientSearchQuery] = useState("");
  const [selectedPatient, setSelectedPatient] = useState<PatientOption | null>(null);
  const [date, setDate] = useState(defaultDate || format(new Date(), "yyyy-MM-dd"));
  const [time, setTime] = useState(defaultTime || "09:00");
  const [appointmentType, setAppointmentType] = useState<AppointmentTypeCode>("individual_therapy_45");
  const [duration, setDuration] = useState(45);
  const [appointmentFormat, setAppointmentFormat] = useState<"in_person" | "telehealth">("in_person");
  const [room, setRoom] = useState("");
  const [notes, setNotes] = useState("");
  const [recurringPattern, setRecurringPattern] = useState<"none" | "weekly" | "biweekly" | "monthly">("none");
  const [recurringOccurrences, setRecurringOccurrences] = useState(4);

  // Conflict state
  const [conflicts, setConflicts] = useState<ConflictingAppointment[]>([]);
  const [showConflictWarning, setShowConflictWarning] = useState(false);

  // Reset form when modal opens
  React.useEffect(() => {
    if (open) {
      setPatientId("");
      setSelectedPatient(null);
      setDate(defaultDate || format(new Date(), "yyyy-MM-dd"));
      setTime(defaultTime || "09:00");
      setAppointmentType("individual_therapy_45");
      setDuration(45);
      setAppointmentFormat("in_person");
      setRoom("");
      setNotes("");
      setRecurringPattern("none");
      setRecurringOccurrences(4);
      setConflicts([]);
      setShowConflictWarning(false);
    }
  }, [open, defaultDate, defaultTime]);

  // Update duration when appointment type changes
  React.useEffect(() => {
    const typeConfig = APPOINTMENT_TYPES.find((t) => t.code === appointmentType);
    if (typeConfig) {
      setDuration(typeConfig.defaultDuration);
    }
  }, [appointmentType]);

  // Patient search query
  const { data: patients, isLoading: patientsLoading } = useQuery({
    queryKey: patientKeys.search(patientSearchQuery, DEMO_PRACTICE_ID),
    queryFn: async () => {
      const supabase = createClient();
      let query = supabase
        .from("patients")
        .select("id, first_name, last_name, avatar_url")
        .eq("practice_id", DEMO_PRACTICE_ID)
        .eq("status", "Active")
        .limit(20);

      if (patientSearchQuery) {
        query = query.or(
          `first_name.ilike.%${patientSearchQuery}%,last_name.ilike.%${patientSearchQuery}%`
        );
      }

      const { data } = await query.order("last_name");
      return (data || []).map((p) => ({
        id: p.id,
        firstName: p.first_name,
        lastName: p.last_name,
        avatarUrl: p.avatar_url,
      }));
    },
    enabled: open,
  });

  // Create appointment mutation
  const createMutation = useMutation({
    mutationFn: async (skipConflict: boolean) => {
      const typeConfig = APPOINTMENT_TYPES.find((t) => t.code === appointmentType);

      const response = await fetch("/api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patientId,
          date,
          startTime: time,
          duration,
          appointmentType,
          cptCode: typeConfig?.cptCode || null,
          format: appointmentFormat,
          room: room || null,
          notes: notes || null,
          recurring:
            recurringPattern !== "none"
              ? {
                  pattern: recurringPattern,
                  occurrences: recurringOccurrences,
                }
              : undefined,
          skipConflictCheck: skipConflict,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 409 && data.conflicts) {
          return { conflicts: data.conflicts };
        }
        throw new Error(data.error || "Failed to create appointment");
      }

      return data;
    },
    onSuccess: (data) => {
      if (data.conflicts) {
        setConflicts(data.conflicts);
        setShowConflictWarning(true);
        return;
      }

      // Success - invalidate queries and close
      queryClient.invalidateQueries({ queryKey: appointmentKeys.all });
      onOpenChange(false);
      onSuccess?.();
    },
  });

  const handleSubmit = useCallback(
    (e: React.FormEvent, skipConflict = false) => {
      e.preventDefault();

      if (!patientId) {
        return;
      }

      createMutation.mutate(skipConflict);
    },
    [patientId, createMutation]
  );

  const handlePatientSelect = useCallback((patient: PatientOption) => {
    setPatientId(patient.id);
    setSelectedPatient(patient);
    setPatientSearchOpen(false);
  }, []);

  const formatTimeDisplay = useCallback((time: string) => {
    const slot = TIME_SLOTS.find((s) => s.value === time);
    return slot?.label || time;
  }, []);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-lg overflow-y-auto">
        <DialogHeader>
          <DialogTitle>New Appointment</DialogTitle>
          <DialogDescription>
            Schedule a new appointment for a patient
          </DialogDescription>
        </DialogHeader>

        {showConflictWarning ? (
          <div className="space-y-4 py-4">
            <div className="bg-destructive/10 border-destructive/20 flex items-start gap-3 rounded-lg border p-4">
              <AlertCircle className="text-destructive h-5 w-5 shrink-0" />
              <div className="space-y-2">
                <p className="text-foreground text-sm font-medium">
                  Scheduling Conflict Detected
                </p>
                <p className="text-muted-foreground text-sm">
                  The following appointments overlap with the selected time:
                </p>
                <ul className="space-y-1">
                  {conflicts.map((conflict) => (
                    <li key={conflict.id} className="text-muted-foreground text-sm">
                      <strong>{conflict.patientName}</strong> at{" "}
                      {formatTimeDisplay(conflict.startTime.slice(0, 5))}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <DialogFooter className="gap-2 sm:gap-0">
              <Button
                variant="outline"
                onClick={() => {
                  setShowConflictWarning(false);
                  setConflicts([]);
                }}
              >
                Go Back
              </Button>
              <Button
                variant="default"
                onClick={(e) => handleSubmit(e, true)}
                disabled={createMutation.isPending}
              >
                {createMutation.isPending ? "Creating..." : "Create Anyway"}
              </Button>
            </DialogFooter>
          </div>
        ) : (
          <form onSubmit={(e) => handleSubmit(e, false)} className="space-y-4">
            {/* Patient Search */}
            <div className="space-y-2">
              <Label htmlFor="patient">Patient</Label>
              <Popover open={patientSearchOpen} onOpenChange={setPatientSearchOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline-white"
                    role="combobox"
                    aria-expanded={patientSearchOpen}
                    className="h-11 w-full justify-between"
                  >
                    {selectedPatient ? (
                      <span className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        {selectedPatient.firstName} {selectedPatient.lastName}
                      </span>
                    ) : (
                      <span className="text-muted-foreground flex items-center gap-2">
                        <Search className="h-4 w-4" />
                        Search patients...
                      </span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[400px] p-0" align="start">
                  <Command>
                    <CommandInput
                      placeholder="Search by name..."
                      value={patientSearchQuery}
                      onValueChange={setPatientSearchQuery}
                    />
                    <CommandList>
                      <CommandEmpty>
                        {patientsLoading ? "Searching..." : "No patients found"}
                      </CommandEmpty>
                      <CommandGroup>
                        {patients?.map((patient) => (
                          <CommandItem
                            key={patient.id}
                            value={`${patient.firstName} ${patient.lastName}`}
                            onSelect={() => handlePatientSelect(patient)}
                            className="cursor-pointer"
                          >
                            <User className="mr-2 h-4 w-4" />
                            {patient.firstName} {patient.lastName}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>

            {/* Appointment Type */}
            <div className="space-y-2">
              <Label htmlFor="type">Appointment Type</Label>
              <Select
                value={appointmentType}
                onValueChange={(v) => setAppointmentType(v as AppointmentTypeCode)}
              >
                <SelectTrigger className="h-11">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {APPOINTMENT_TYPES.map((type) => (
                    <SelectItem key={type.code} value={type.code}>
                      {type.label}
                      {type.cptCode && (
                        <span className="text-muted-foreground ml-2">({type.cptCode})</span>
                      )}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Date and Time */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="date">Date</Label>
                <div className="relative">
                  <Calendar className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
                  <Input
                    id="date"
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="h-11 pl-10"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="time">Time</Label>
                <Select value={time} onValueChange={setTime}>
                  <SelectTrigger className="h-11">
                    <Clock className="text-muted-foreground mr-2 h-4 w-4" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="max-h-60">
                    {TIME_SLOTS.map((slot) => (
                      <SelectItem key={slot.value} value={slot.value}>
                        {slot.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Duration */}
            <div className="space-y-2">
              <Label htmlFor="duration">Duration (minutes)</Label>
              <Select
                value={duration.toString()}
                onValueChange={(v) => setDuration(parseInt(v))}
              >
                <SelectTrigger className="h-11">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[15, 30, 45, 53, 60, 90].map((d) => (
                    <SelectItem key={d} value={d.toString()}>
                      {d} minutes
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Format */}
            <div className="space-y-2">
              <Label>Format</Label>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant={appointmentFormat === "in_person" ? "default" : "outline-white"}
                  className="h-11 flex-1"
                  onClick={() => setAppointmentFormat("in_person")}
                >
                  <MapPin className="mr-2 h-4 w-4" />
                  In-Person
                </Button>
                <Button
                  type="button"
                  variant={appointmentFormat === "telehealth" ? "default" : "outline-white"}
                  className="h-11 flex-1"
                  onClick={() => setAppointmentFormat("telehealth")}
                >
                  <Video className="mr-2 h-4 w-4" />
                  Telehealth
                </Button>
              </div>
            </div>

            {/* Room (only for in-person) */}
            {appointmentFormat === "in_person" && (
              <div className="space-y-2">
                <Label htmlFor="room">Room/Location (optional)</Label>
                <Input
                  id="room"
                  value={room}
                  onChange={(e) => setRoom(e.target.value)}
                  placeholder="e.g., Room 101"
                  className="h-11"
                />
              </div>
            )}

            {/* Notes */}
            <div className="space-y-2">
              <Label htmlFor="notes">Notes (optional)</Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add any notes about this appointment..."
                rows={2}
              />
            </div>

            {/* Recurring */}
            <div className="space-y-2">
              <Label>Recurring</Label>
              <div className="flex items-center gap-2">
                <Select
                  value={recurringPattern}
                  onValueChange={(v) =>
                    setRecurringPattern(v as "none" | "weekly" | "biweekly" | "monthly")
                  }
                >
                  <SelectTrigger className="h-11 flex-1">
                    <Repeat className="text-muted-foreground mr-2 h-4 w-4" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Does not repeat</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="biweekly">Every 2 weeks</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                  </SelectContent>
                </Select>

                {recurringPattern !== "none" && (
                  <Select
                    value={recurringOccurrences.toString()}
                    onValueChange={(v) => setRecurringOccurrences(parseInt(v))}
                  >
                    <SelectTrigger className="h-11 w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[2, 4, 8, 12, 24, 52].map((n) => (
                        <SelectItem key={n} value={n.toString()}>
                          {n} times
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>
            </div>

            <DialogFooter className="pt-4">
              <Button
                type="button"
                variant="outline-white"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={!patientId || createMutation.isPending}
              >
                {createMutation.isPending ? "Creating..." : "Create Appointment"}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
