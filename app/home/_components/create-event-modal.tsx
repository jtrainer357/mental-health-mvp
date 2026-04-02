"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/design-system/components/ui/dialog";
import { Button } from "@/design-system/components/ui/button";
import { Input } from "@/design-system/components/ui/input";
import { Label } from "@/design-system/components/ui/label";
import { cn } from "@/design-system/lib/utils";
import { Calendar, ClipboardList, Bell, Video, MapPin } from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────

type EventType = "appointment" | "task" | "reminder";

interface CreateEventModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultStartTime?: string;
  defaultEndTime?: string;
}

const EVENT_TYPES: { id: EventType; label: string; icon: React.ElementType }[] = [
  { id: "appointment", label: "Appointment", icon: Calendar },
  { id: "task", label: "Task", icon: ClipboardList },
  { id: "reminder", label: "Reminder", icon: Bell },
];

const inputClass =
  "border-border/60 focus-visible:ring-1 focus-visible:ring-growth-2/40 focus-visible:ring-offset-0 focus-visible:border-growth-2 transition-colors";

// ─── Component ────────────────────────────────────────────────────────────

export function CreateEventModal({
  open,
  onOpenChange,
  defaultStartTime = "",
  defaultEndTime = "",
}: CreateEventModalProps) {
  const [eventType, setEventType] = React.useState<EventType>("appointment");
  const [title, setTitle] = React.useState("");
  const [startTime, setStartTime] = React.useState(defaultStartTime);
  const [endTime, setEndTime] = React.useState(defaultEndTime);
  const [locationType, setLocationType] = React.useState<"in-person" | "telehealth">("in-person");
  const [duration, setDuration] = React.useState("45 min");

  // Reset form when modal opens
  React.useEffect(() => {
    if (open) {
      setTitle("");
      setStartTime(defaultStartTime);
      setEndTime(defaultEndTime);
      setLocationType("in-person");
      setDuration("45 min");
      setEventType("appointment");
    }
  }, [open, defaultStartTime, defaultEndTime]);

  const handleSave = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="!z-[100] !bg-white sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>Create New</DialogTitle>
          <DialogDescription className="sr-only">
            Create a new appointment, task, or reminder
          </DialogDescription>
        </DialogHeader>

        {/* Event type selector — pill tabs with animated indicator */}
        <div className="relative flex rounded-lg bg-backbone-1/50 p-1">
          {EVENT_TYPES.map((type) => {
            const Icon = type.icon;
            const isActive = eventType === type.id;
            return (
              <button
                key={type.id}
                type="button"
                onClick={() => setEventType(type.id)}
                className={cn(
                  "relative z-10 flex flex-1 items-center justify-center gap-2 rounded-md px-3 py-2.5 text-sm font-medium transition-colors duration-200",
                  isActive
                    ? "text-foreground"
                    : "text-muted-foreground/60 hover:text-muted-foreground"
                )}
              >
                <Icon className="h-4 w-4" />
                {type.label}
                {/* Animated background pill */}
                {isActive && (
                  <motion.div
                    layoutId="event-type-pill"
                    className="absolute inset-0 rounded-md bg-white shadow-sm"
                    style={{ zIndex: -1 }}
                    transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
                  />
                )}
              </button>
            );
          })}
        </div>

        {/* Animated form fields */}
        <AnimatePresence mode="wait">
          <motion.div
            key={eventType}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="space-y-4 pt-1"
          >
            {/* Title */}
            <div className="space-y-1.5">
              <Label htmlFor="event-title" className="text-xs font-medium text-muted-foreground">
                {eventType === "appointment"
                  ? "Patient or title"
                  : eventType === "task"
                    ? "Task name"
                    : "Reminder"}
              </Label>
              <Input
                id="event-title"
                placeholder={
                  eventType === "appointment"
                    ? "Search patients or enter title..."
                    : eventType === "task"
                      ? "What needs to be done?"
                      : "What to remember?"
                }
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className={inputClass}
                autoFocus
              />
            </div>

            {/* Time row — appointment & task */}
            {eventType !== "reminder" && (
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="start-time" className="text-xs font-medium text-muted-foreground">
                    Start
                  </Label>
                  <Input
                    id="start-time"
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className={inputClass}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="end-time" className="text-xs font-medium text-muted-foreground">
                    End
                  </Label>
                  <Input
                    id="end-time"
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className={inputClass}
                  />
                </div>
              </div>
            )}

            {/* Reminder: just a time */}
            {eventType === "reminder" && (
              <div className="space-y-1.5">
                <Label htmlFor="reminder-time" className="text-xs font-medium text-muted-foreground">
                  When
                </Label>
                <Input
                  id="reminder-time"
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className={inputClass}
                />
              </div>
            )}

            {/* Location — appointment only */}
            {eventType === "appointment" && (
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-muted-foreground">Location</Label>
                <div className="flex gap-2">
                  {([
                    { id: "in-person" as const, label: "In-person", icon: MapPin },
                    { id: "telehealth" as const, label: "Telehealth", icon: Video },
                  ]).map((loc) => {
                    const isActive = locationType === loc.id;
                    const LocIcon = loc.icon;
                    return (
                      <button
                        key={loc.id}
                        type="button"
                        onClick={() => setLocationType(loc.id)}
                        className={cn(
                          "flex flex-1 items-center justify-center gap-2 rounded-lg border px-3 py-2.5 text-sm font-medium transition-all duration-150",
                          isActive
                            ? "border-growth-2 bg-growth-1/10 text-growth-4"
                            : "border-border/60 text-muted-foreground/60 hover:border-border hover:text-muted-foreground"
                        )}
                      >
                        <LocIcon className="h-4 w-4" />
                        {loc.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Duration — appointment only */}
            {eventType === "appointment" && (
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-muted-foreground">Duration</Label>
                <div className="flex gap-2">
                  {["30 min", "45 min", "60 min"].map((dur) => {
                    const isActive = duration === dur;
                    return (
                      <button
                        key={dur}
                        type="button"
                        onClick={() => setDuration(dur)}
                        className={cn(
                          "flex-1 rounded-lg border px-3 py-2 text-sm font-medium transition-all duration-150",
                          isActive
                            ? "border-growth-2 bg-growth-1/10 text-growth-4"
                            : "border-border/60 text-muted-foreground/60 hover:border-border hover:text-muted-foreground"
                        )}
                      >
                        {dur}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        <DialogFooter className="pt-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            {eventType === "appointment"
              ? "Schedule"
              : eventType === "task"
                ? "Create Task"
                : "Set Reminder"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
