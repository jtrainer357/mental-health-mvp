"use client";

import { Card } from "@/design-system/components/ui/card";
import { Text } from "@/design-system/components/ui/typography";
import type { PatientDetail } from "./types";

interface MedicalRecordsTabProps {
  patient: PatientDetail;
}

export function MedicalRecordsTab({ patient }: MedicalRecordsTabProps) {
  if (!patient.outcomeMeasures || patient.outcomeMeasures.length === 0) {
    return (
      <div className="border-muted-foreground/30 rounded-lg border-2 border-dashed py-8">
        <Text size="sm" muted className="text-center">
          No medical records found
        </Text>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {patient.outcomeMeasures.map((measure) => (
        <Card
          key={measure.id}
          className="hover:bg-card-hover/70 p-3 transition-all hover:border-white hover:shadow-md sm:p-4"
        >
          <div className="flex items-start justify-between">
            <div>
              <Text className="font-medium">{measure.measureType}</Text>
              {measure.score !== null && (
                <Text size="sm" muted className="mt-1">
                  Score: {measure.score}
                </Text>
              )}
              {measure.notes && (
                <Text size="sm" muted className="mt-1">
                  {measure.notes}
                </Text>
              )}
            </div>
            <Text size="xs" muted>
              {new Date(measure.measurementDate).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </Text>
          </div>
        </Card>
      ))}
    </div>
  );
}
