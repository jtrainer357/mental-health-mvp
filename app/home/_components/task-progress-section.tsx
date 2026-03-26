"use client";

import * as React from "react";
import { CheckCircle2 } from "lucide-react";
import { cn } from "@/design-system/lib/utils";

interface TaskItem {
  id: string;
  label: string;
  completed: boolean;
  step?: number;
}

interface TaskProgressSectionProps {
  className?: string;
}

// Demo task progress data
const taskItems: TaskItem[] = [
  { id: "1", label: "Opened patient record", completed: true },
  { id: "2", label: "Send message", completed: false, step: 2 },
  { id: "3", label: "Order follow-up", completed: false, step: 3 },
];

export function TaskProgressSection({ className }: TaskProgressSectionProps) {
  return (
    <div className={cn("space-y-3", className)}>
      <h4 className="text-muted-foreground text-sm font-semibold tracking-wide uppercase">
        Task Progress
      </h4>

      <div className="border-border bg-card rounded-lg border">
        {taskItems.map((task, index) => (
          <div
            key={task.id}
            className={cn(
              "flex items-center gap-3 px-4 py-3",
              index !== taskItems.length - 1 && "border-border/50 border-b",
              task.completed && "bg-priority-bg/30"
            )}
          >
            {task.completed ? (
              <div className="bg-primary flex h-7 w-7 shrink-0 items-center justify-center rounded-full">
                <CheckCircle2 className="h-4 w-4 text-white" />
              </div>
            ) : (
              <div className="border-border bg-card text-muted-foreground flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 text-sm font-medium">
                {task.step}
              </div>
            )}
            <span
              className={cn(
                "text-sm font-medium",
                task.completed ? "text-primary" : "text-muted-foreground"
              )}
            >
              {task.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
