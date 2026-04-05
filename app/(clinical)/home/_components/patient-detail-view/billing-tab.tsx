"use client";

import { Card } from "@/design-system/components/ui/card";
import { Badge } from "@/design-system/components/ui/badge";
import { Text } from "@/design-system/components/ui/typography";
import type { PatientDetail } from "./types";

interface BillingTabProps {
  patient: PatientDetail;
}

export function BillingTab({ patient }: BillingTabProps) {
  if (!patient.invoices || patient.invoices.length === 0) {
    return (
      <div className="border-muted-foreground/30 rounded-lg border-2 border-dashed py-8">
        <Text size="sm" muted className="text-center">
          No billing records found
        </Text>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {patient.invoices.map((invoice) => (
        <Card
          key={invoice.id}
          className="hover:bg-card-hover/70 p-3 transition-all hover:border-white hover:shadow-md sm:p-4"
        >
          <div className="flex items-start justify-between">
            <div>
              <Text className="font-medium">{invoice.description || "Service Charge"}</Text>
              <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1">
                <Text size="sm" muted>
                  Charge: ${invoice.chargeAmount.toFixed(2)}
                </Text>
                {invoice.insurancePaid > 0 && (
                  <Text size="sm" muted>
                    Insurance: ${invoice.insurancePaid.toFixed(2)}
                  </Text>
                )}
                {invoice.patientPaid > 0 && (
                  <Text size="sm" muted>
                    Patient Paid: ${invoice.patientPaid.toFixed(2)}
                  </Text>
                )}
              </div>
            </div>
            <div className="text-right">
              <Badge variant={invoice.balance > 0 ? "destructive" : "default"} className="text-xs">
                {invoice.balance > 0 ? `Due: $${invoice.balance.toFixed(2)}` : "Paid"}
              </Badge>
              <Text size="xs" muted className="mt-1 block">
                {invoice.dateOfService
                  ? new Date(invoice.dateOfService).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })
                  : ""}
              </Text>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
