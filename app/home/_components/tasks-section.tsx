"use client";

import { CheckCircle2 } from "lucide-react";
import { Card, CardContent } from "@/design-system/components/ui/card";
import { Button } from "@/design-system/components/ui/button";
import { Badge } from "@/design-system/components/ui/badge";

const tasks = [
  {
    id: "task-1",
    title: "Verify insurance eligibility for today's patients",
    subtitle: "TEBRA CLEARINGHOUSE • 14 PATIENTS SCHEDULED",
    action: "Start",
  },
  {
    id: "task-2",
    title: "Manage check-in/check-out and collect co-pays",
    subtitle: "ONGOING • MONITOR FRONT DESK FLOW",
    action: "Open",
  },
  {
    id: "task-3",
    title: "Answer calls & portal messages",
    subtitle: "8 NEW MESSAGES • 3 VOICEMAILS",
    action: "View",
  },
];

export function TasksSection() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-foreground text-xl font-light">Today&apos;s Tasks</h2>
        <Badge
          variant="outline"
          className="bg-accent/20 rounded-full border-none px-3 py-1 text-xs font-bold"
        >
          14 TOTAL
        </Badge>
      </div>

      <div className="grid gap-3">
        {tasks.map((task) => (
          <Card
            key={task.id}
            className="border-muted/50 hover:border-primary/20 overflow-hidden rounded-xl border shadow-none transition-all"
          >
            <CardContent className="p-3 sm:p-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
                <div className="flex items-center gap-3 sm:gap-4">
                  <div className="bg-accent/30 flex h-10 w-10 shrink-0 items-center justify-center rounded-full">
                    <CheckCircle2 className="text-muted-foreground h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-sm font-bold">{task.title}</h4>
                    <p className="text-muted-foreground mt-1 text-xs font-bold tracking-wider uppercase">
                      {task.subtitle}
                    </p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  className="border-muted hover:bg-accent h-10 w-full shrink-0 rounded-xl px-6 font-bold sm:w-auto"
                >
                  {task.action}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
