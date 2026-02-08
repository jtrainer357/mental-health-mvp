"use client";

/**
 * Session Timer Component with CPT Auto-Suggestion
 * @component
 */

import { useEffect, useState } from "react";
import { Clock, Play, Pause, Square, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  useSessionTimer,
  getSuggestedCPTCode,
  getApplicableCPTCodes,
  type NoteType,
  type CPTCode,
} from "@/lib/session";

interface SessionTimerProps {
  /** Initial elapsed time in seconds (for resuming drafts) */
  initialSeconds?: number;
  /** Note type for CPT code suggestions */
  noteType?: NoteType;
  /** Currently selected CPT code */
  selectedCPTCode?: string;
  /** Callback when CPT code is selected */
  onCPTCodeChange?: (code: string) => void;
  /** Callback when timer state changes */
  onTimerChange?: (data: {
    isRunning: boolean;
    elapsedSeconds: number;
    elapsedMinutes: number;
  }) => void;
  /** Compact display mode */
  compact?: boolean;
}

export function SessionTimer({
  initialSeconds = 0,
  noteType = "progress_note",
  selectedCPTCode,
  onCPTCodeChange,
  onTimerChange,
  compact = false,
}: SessionTimerProps) {
  const timer = useSessionTimer(initialSeconds);
  const [suggestedCode, setSuggestedCode] = useState<CPTCode | null>(null);

  const applicableCodes = getApplicableCPTCodes(noteType);

  // Update suggested CPT code based on elapsed time
  useEffect(() => {
    const suggested = getSuggestedCPTCode(timer.elapsedMinutes, noteType);
    setSuggestedCode(suggested);

    // Auto-select if no code is selected and timer is running
    if (suggested && !selectedCPTCode && timer.isRunning) {
      onCPTCodeChange?.(suggested.code);
    }
  }, [timer.elapsedMinutes, noteType, selectedCPTCode, timer.isRunning, onCPTCodeChange]);

  // Notify parent of timer changes
  useEffect(() => {
    onTimerChange?.({
      isRunning: timer.isRunning,
      elapsedSeconds: timer.elapsedSeconds,
      elapsedMinutes: timer.elapsedMinutes,
    });
  }, [timer.isRunning, timer.elapsedSeconds, timer.elapsedMinutes, onTimerChange]);

  // Minutes until next billable threshold
  const getMinutesToBillable = (): number | null => {
    if (timer.elapsedMinutes >= 16) return null;
    return 16 - timer.elapsedMinutes;
  };

  const minutesToBillable = getMinutesToBillable();

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        <Clock className="h-4 w-4 text-muted-foreground" />
        <span className="font-mono text-sm">{timer.formattedTime}</span>
        {suggestedCode && (
          <Badge variant="outline" className="text-xs">
            {suggestedCode.code}
          </Badge>
        )}
      </div>
    );
  }

  return (
    <div className="rounded-lg border bg-card p-4 space-y-4">
      {/* Timer Display */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            className={cn(
              "flex items-center justify-center w-12 h-12 rounded-full",
              timer.isRunning
                ? "bg-green-100 text-green-700"
                : timer.isPaused
                ? "bg-yellow-100 text-yellow-700"
                : "bg-muted text-muted-foreground"
            )}
          >
            <Clock className="h-6 w-6" />
          </div>
          <div>
            <div className="text-3xl font-mono font-semibold">
              {timer.formattedTime}
            </div>
            <div className="text-sm text-muted-foreground">
              {timer.elapsedMinutes} minutes
            </div>
          </div>
        </div>

        {/* Timer Controls */}
        <div className="flex items-center gap-2">
          {!timer.isRunning && !timer.isPaused && (
            <Button onClick={timer.start} size="sm">
              <Play className="h-4 w-4 mr-1" />
              Start
            </Button>
          )}
          {timer.isRunning && (
            <Button onClick={timer.pause} variant="outline" size="sm">
              <Pause className="h-4 w-4 mr-1" />
              Pause
            </Button>
          )}
          {timer.isPaused && (
            <Button onClick={timer.resume} size="sm">
              <Play className="h-4 w-4 mr-1" />
              Resume
            </Button>
          )}
          {(timer.isRunning || timer.isPaused) && (
            <Button onClick={timer.stop} variant="destructive" size="sm">
              <Square className="h-4 w-4 mr-1" />
              Stop
            </Button>
          )}
        </div>
      </div>

      {/* Billable Status */}
      {minutesToBillable !== null && (
        <div className="flex items-center gap-2 text-sm text-yellow-600 bg-yellow-50 rounded-md px-3 py-2">
          <DollarSign className="h-4 w-4" />
          <span>
            {minutesToBillable} minute{minutesToBillable !== 1 ? "s" : ""} to
            billable session (90832)
          </span>
        </div>
      )}

      {/* CPT Code Selection */}
      <div className="flex items-center gap-4">
        <div className="flex-1">
          <label className="text-sm font-medium text-muted-foreground mb-1 block">
            CPT Code
          </label>
          <Select
            value={selectedCPTCode || ""}
            onValueChange={(value) => onCPTCodeChange?.(value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select CPT code" />
            </SelectTrigger>
            <SelectContent>
              {applicableCodes.map((code) => (
                <SelectItem key={code.code} value={code.code}>
                  <div className="flex items-center gap-2">
                    <span className="font-mono">{code.code}</span>
                    <span className="text-muted-foreground text-sm">
                      {code.description}
                    </span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Suggested Badge */}
        {suggestedCode && (
          <div className="pt-5">
            <Badge
              variant={selectedCPTCode === suggestedCode.code ? "default" : "secondary"}
              className="cursor-pointer"
              onClick={() => onCPTCodeChange?.(suggestedCode.code)}
            >
              Suggested: {suggestedCode.code}
            </Badge>
          </div>
        )}
      </div>

      {/* Fee Estimate */}
      {selectedCPTCode && (
        <div className="text-sm text-muted-foreground">
          Estimated fee:{" "}
          <span className="font-medium text-foreground">
            ${applicableCodes.find((c) => c.code === selectedCPTCode)?.fee || 0}
          </span>
        </div>
      )}
    </div>
  );
}

export default SessionTimer;
