"use client";

import { Shield } from "lucide-react";
import { Card } from "@/design-system/components/ui/card";
import { Button } from "@/design-system/components/ui/button";
import { Text } from "@/design-system/components/ui/typography";
import { cn } from "@/design-system/lib/utils";
import type { SelectedActivity } from "./types";

// ─── Props ──────────────────────────────────────────────────────────────────

interface CptApprovalCardProps {
  activity: SelectedActivity;
  cptApproved: boolean;
  onToggleApproval: () => void;
}

// ─── Component ──────────────────────────────────────────────────────────────

export function CptApprovalCard({ activity, cptApproved, onToggleApproval }: CptApprovalCardProps) {
  return (
    <Card className="border-border/70 bg-teal/5 flex flex-col overflow-hidden p-0 shadow-sm">
      <div className="border-border/30 border-b px-5 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-warning/10 flex h-6 w-6 items-center justify-center rounded-lg">
              <Shield className="text-warning h-3.5 w-3.5" />
            </div>
            <Text size="xs" className="font-bold tracking-wide uppercase">
              CPT Code
            </Text>
          </div>
        </div>
      </div>
      {activity.id === "new-session" ? (
        <div className="flex flex-1 flex-col items-center justify-center p-8 text-center">
          <Shield className="text-muted-foreground/30 mb-3 h-8 w-8" />
          <Text size="sm" className="text-muted-foreground">
            CPT code will be suggested after the session is recorded.
          </Text>
          <Button variant="outline" size="sm" disabled className="mt-4 opacity-50">
            Approve CPT Code
          </Button>
        </div>
      ) : (
        <div className="flex flex-1 flex-col p-5">
          <div className="flex items-start justify-between">
            <div>
              <Text className="text-3xl font-bold tracking-tight">
                {activity.cptCode || "90837"}
              </Text>
              <Text size="xs" className="text-muted-foreground mt-1">
                {activity.appointmentType || "Individual Therapy"}, {activity.duration || "50 min"}
              </Text>
            </div>
            <div className="bg-muted/50 rounded-lg px-3 py-2 text-right">
              <Text
                size="xs"
                className="text-muted-foreground text-sm font-bold tracking-wider uppercase"
              >
                Duration
              </Text>
              <Text size="sm" className="font-bold">
                {activity.duration || "50 min"}
              </Text>
            </div>
          </div>

          <Card className="bg-card/60 border-border/30 mt-4 flex-1 p-3.5">
            <Text
              size="xs"
              className="text-muted-foreground mb-2 text-sm font-bold tracking-wider uppercase"
            >
              Compliance Evidence
            </Text>
            <ul className="space-y-1.5">
              {[
                `Transcript confirms ${activity.duration || "50 min"} of psychotherapy content`,
                'Payer requires "counseling vs. medical management" documentation \u2014 auto-inserted',
                "No up-coding risk detected",
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-2">
                  <div className="bg-success mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full" />
                  <Text size="xs" className="text-foreground/65 leading-relaxed">
                    {item}
                  </Text>
                </li>
              ))}
            </ul>
          </Card>

          <div className="mt-4">
            <Button
              variant="outline"
              size="lg"
              onClick={onToggleApproval}
              disabled={cptApproved}
              className={cn(
                "w-full",
                cptApproved && "border-success/30 bg-success/10 text-success hover:bg-success/10"
              )}
            >
              {cptApproved
                ? `CPT ${activity.cptCode || "90837"} Approved \u2713`
                : `Approve CPT ${activity.cptCode || "90837"}`}
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
}
