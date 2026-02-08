"use client";

/**
 * AppointmentModal - Create/Edit appointment modal
 * Agent: GAMMA | Feature: Scheduling Production
 */

import * as React from "react";
import { useState, useCallback } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import {
  Calendar,
  Clock,
  User,
  MapPin,
  Video,
  Repeat,
  AlertCircle,
  Search,
} from "lucide-react";

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
import { Popover, PopoverContent, PopoverTrigger } from "@/design-system/components/ui/popover";
import { APPOINTMENT_TYPES, type AppointmentTypeCode } from "@/src/lib/supabase/scheduling-types";
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

interface Patient {
  id: string;
  first_name: string;
  last_name: string;
  date_of_birth: string;
  avatar_url?: string | null;
}

interface AppointmentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialDate?: Date;
  initialTime?: string;
  onSuccess?: () => void;
}

const TIME_SLOTS = Array.from({ length: 40 }, (_, i) => {
  const hour = Math.floor(i / 4) + 8;
  const minute = (i % 4) * 15;
  return `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`;
}).filter((t) => {
  const [h] = t.split(":").map(Number);
  return (h ?? 0) >= 8 && (h ?? 0) < 18;
});

export function AppointmentModal({
  open,
  onOpenChange,
  initialDate,
  initialTime,
  onSuccess,
}: AppointmentModalProps) {
  const queryClient = useQueryClient();

  const [patientId, setPatientId] = useState("");
  const [patientSearch, setPatientSearch] = useState("");
  const [patientOpen, setPatientOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [date, setDate] = useState(initialDate ? format(initialDate, "yyyy-MM-dd") : format(new Date(), "yyyy-MM-dd"));
  const [time, setTime] = useState(initialTime || "09:00");
  const [appointmentType, setAppointmentType] = useState<AppointmentTypeCode>("individual_therapy_45");
  const [duration, setDuration] = useState(45);
  const [appointmentFormat, setAppointmentFormat] = useState<"in_person" | "telehealth">("in_person");
  const [room, setRoom] = useState("");
  const [notes, setNotes] = useState("");
  const [recurringPattern, setRecurringPattern] = useState<"none" | "weekly" | "biweekly" | "monthly">("none");
  const [recurringOccurrences, setRecurringOccurrences] = useState(8);
  const [conflicts, setConflicts] = useState<ConflictingAppointment[]>([]);
  const [showConflictWarning, setShowConflictWarning] = useState(false);

  React.useEffect(() => {
    if (initialDate) setDate(format(initialDate, "yyyy-MM-dd"));
    if (initialTime) setTime(initialTime);
  }, [initialDate, initialTime]);

  const { data: patientsData } = useQuery({
    queryKey: patientKeys.search(patientSearch),
    queryFn: async () => {
      if (!patientSearch || patientSearch.length < 2) return [];
      const supabase = createClient();
      const { data } = await supabase
        .from("patients")
        .select("id, first_name, last_name, date_of_birth, avatar_url")
        .eq("practice_id", DEMO_PRACTICE_ID)
        .or(`first_name.ilike.%${patientSearch}%,last_name.ilike.%${patientSearch}%`)
        .limit(10);
      return data || [];
    },
    enabled: patientSearch.length >= 2,
  });

  const createMutation = useMutation({
    mutationFn: async (skipConflict: boolean) => {
      const response = await fetch("/api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patientId,
          date,
          startTime: time,
          duration,
          appointmentType,
          format: appointmentFormat,
          room: room || undefined,
          notes: notes || undefined,
          recurring: recurringPattern !== "none" ? { pattern: recurringPattern, occurrences: recurringOccurrences } : undefined,
          skipConflictCheck: skipConflict,
        }),
      });

      const result = await response.json();

      if (response.status === 409) {
        setConflicts(result.conflicts);
        setShowConflictWarning(true);
        throw new Error("conflict");
      }

      if (!response.ok) throw new Error(result.error);
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: appointmentKeys.all });
      resetForm();
      onOpenChange(false);
      onSuccess?.();
    },
  });

  const resetForm = useCallback(() => {
    setPatientId("");
    setPatientSearch("");
    setSelectedPatient(null);
    setDate(format(new Date(), "yyyy-MM-dd"));
    setTime("09:00");
    setAppointmentType("individual_therapy_45");
    setDuration(45);
    setAppointmentFormat("in_person");
    setRoom("");
    setNotes("");
    setRecurringPattern("none");
    setRecurringOccurrences(8);
    setConflicts([]);
    setShowConflictWarning(false);
  }, []);

  const handlePatientSelect = (patient: Patient) => {
    setPatientId(patient.id);
    setSelectedPatient(patient);
    setPatientSearch(`${patient.first_name} ${patient.last_name}`);
    setPatientOpen(false);
  };

  const handleTypeChange = (code: string) => {
    setAppointmentType(code as AppointmentTypeCode);
    const typeConfig = APPOINTMENT_TYPES.find((t: { code: string }) => t.code === code);
    if (typeConfig) setDuration(typeConfig.defaultDuration);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate(false);
  };

  const handleForceCreate = () => {
    setShowConflictWarning(false);
    createMutation.mutate(true);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            New Appointment
          </DialogTitle>
          <DialogDescription>
            Schedule a new appointment for a patient.
          </DialogDescription>
        </DialogHeader>

        {showConflictWarning && conflicts.length > 0 && (
          <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4 mb-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-500 mt-0.5" />
              <div>
                <h4 className="font-medium text-amber-800 dark:text-amber-300">Scheduling Conflict</h4>
                <p className="text-sm text-amber-700 dark:text-amber-400 mt-1">
                  This time slot overlaps with existing appointments:
                </p>
                <ul className="text-sm text-amber-700 dark:text-amber-400 mt-2 space-y-1">
                  {conflicts.map((c) => (
                    <li key={c.id}>
                      {c.patientName} at {c.startTime.slice(0, 5)} - {c.endTime.slice(0, 5)}
                    </li>
                  ))}
                </ul>
                <div className="flex gap-2 mt-3">
                  <Button size="sm" variant="outline" onClick={() => setShowConflictWarning(false)}>
                    Choose Different Time
                  </Button>
                  <Button size="sm" variant="destructive" onClick={handleForceCreate}>
                    Create Anyway
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Patient Search */}
          <div className="space-y-2">
            <Label>Patient</Label>
            <Popover open={patientOpen} onOpenChange={setPatientOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  className="w-full justify-between h-11"
                >
                  {selectedPatient ? (
                    <span className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      {selectedPatient.first_name} {selectedPatient.last_name}
                    </span>
                  ) : (
                    <span className="flex items-center gap-2 text-muted-foreground">
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
                    value={patientSearch}
                    onValueChange={setPatientSearch}
                  />
                  <CommandList>
                    <CommandEmpty>
                      {patientSearch.length < 2 ? "Type at least 2 characters..." : "No patients found."}
                    </CommandEmpty>
                    <CommandGroup>
                      {patientsData?.map((patient: Patient) => (
                        <CommandItem
                          key={patient.id}
                          value={`${patient.first_name} ${patient.last_name}`}
                          onSelect={() => handlePatientSelect(patient)}
                          className="min-h-[44px]"
                        >
                          <User className="h-4 w-4 mr-2" />
                          <div>
                            <div>{patient.first_name} {patient.last_name}</div>
                            <div className="text-xs text-muted-foreground">
                              DOB: {patient.date_of_birth}
                            </div>
                          </div>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>

          {/* Date & Time */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Date</Label>
              <Input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="h-11"
              />
            </div>
            <div className="space-y-2">
              <Label>Time</Label>
              <Select value={time} onValueChange={setTime}>
                <SelectTrigger className="h-11">
                  <Clock className="h-4 w-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TIME_SLOTS.map((slot) => (
                    <SelectItem key={slot} value={slot}>
                      {slot}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Appointment Type */}
          <div className="space-y-2">
            <Label>Appointment Type</Label>
            <Select value={appointmentType} onValueChange={handleTypeChange}>
              <SelectTrigger className="h-11">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {APPOINTMENT_TYPES.map((type) => (
                  <SelectItem key={type.code} value={type.code}>
                    <div className="flex justify-between items-center w-full gap-4">
                      <span>{type.label}</span>
                      <span className="text-xs text-muted-foreground">{type.cptCode} • {type.defaultDuration}min</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Duration & Format */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Duration (minutes)</Label>
              <Input
                type="number"
                value={duration}
                onChange={(e) => setDuration(Number(e.target.value))}
                min={15}
                max={180}
                step={15}
                className="h-11"
              />
            </div>
            <div className="space-y-2">
              <Label>Format</Label>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant={appointmentFormat === "in_person" ? "default" : "outline"}
                  onClick={() => setAppointmentFormat("in_person")}
                  className="flex-1 h-11"
                >
                  <MapPin className="h-4 w-4 mr-2" />
                  In-Person
                </Button>
                <Button
                  type="button"
                  variant={appointmentFormat === "telehealth" ? "default" : "outline"}
                  onClick={() => setAppointmentFormat("telehealth")}
                  className="flex-1 h-11"
                >
                  <Video className="h-4 w-4 mr-2" />
                  Telehealth
                </Button>
              </div>
            </div>
          </div>

          {/* Room (if in-person) */}
          {appointmentFormat === "in_person" && (
            <div className="space-y-2">
              <Label>Room</Label>
              <Input
                value={room}
                onChange={(e) => setRoom(e.target.value)}
                placeholder="e.g., Room 101"
                className="h-11"
              />
            </div>
          )}

          {/* Recurring */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Repeat className="h-4 w-4" />
              Recurring
            </Label>
            <div className="grid grid-cols-2 gap-4">
              <Select value={recurringPattern} onValueChange={(v) => setRecurringPattern(v as typeof recurringPattern)}>
                <SelectTrigger className="h-11">
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
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    value={recurringOccurrences}
                    onChange={(e) => setRecurringOccurrences(Number(e.target.value))}
                    min={2}
                    max={52}
                    className="h-11 w-20"
                  />
                  <span className="text-sm text-muted-foreground">sessions</span>
                </div>
              )}
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label>Notes</Label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add any notes about this appointment..."
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={!patientId || createMutation.isPending}>
              {createMutation.isPending ? "Creating..." : "Create Appointment"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
