"use client";

import * as React from "react";
import { Shield, Plus, Pencil, AlertCircle, CheckCircle, Clock } from "lucide-react";
import { Button } from "@/design-system/components/ui/button";
import { Input } from "@/design-system/components/ui/input";
import { Label } from "@/design-system/components/ui/label";
import { Text } from "@/design-system/components/ui/typography";
import { Badge } from "@/design-system/components/ui/badge";
import { CardWrapper } from "@/design-system/components/ui/card-wrapper";
import { cn } from "@/design-system/lib/utils";
import { toast } from "sonner";

export interface InsuranceInfo {
  id: string;
  type: "primary" | "secondary";
  provider: string;
  planName?: string;
  memberId: string;
  groupNumber?: string;
  subscriberName?: string;
  subscriberDob?: string;
  relationshipToSubscriber?: "self" | "spouse" | "child" | "other";
  effectiveDate?: string;
  terminationDate?: string;
  copay?: number;
  deductible?: number;
  deductibleMet?: number;
}

export interface Authorization {
  id: string;
  insuranceId: string;
  authNumber: string;
  serviceType: string;
  startDate: string;
  endDate: string;
  sessionsApproved: number;
  sessionsUsed: number;
  status: "active" | "expired" | "pending";
  notes?: string;
}

export interface InsuranceTabProps {
  patientId: string;
  insurances: InsuranceInfo[];
  authorizations: Authorization[];
  isLoading?: boolean;
  onSaveInsurance?: (insurance: Partial<InsuranceInfo>) => Promise<void>;
  onAddAuthorization?: (auth: Partial<Authorization>) => Promise<void>;
  className?: string;
}

function formatDate(dateString: string | undefined): string {
  if (!dateString) return "—";
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatCurrency(amount: number | undefined): string {
  if (amount === undefined) return "—";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
}

function getAuthStatusColor(status: Authorization["status"]): string {
  switch (status) {
    case "active":
      return "bg-green-100 text-green-800";
    case "expired":
      return "bg-red-100 text-red-800";
    case "pending":
      return "bg-yellow-100 text-yellow-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
}

function AuthStatusIcon({ status }: { status: Authorization["status"] }) {
  switch (status) {
    case "active":
      return <CheckCircle className="h-4 w-4 text-green-600" />;
    case "expired":
      return <AlertCircle className="h-4 w-4 text-red-600" />;
    case "pending":
      return <Clock className="h-4 w-4 text-yellow-600" />;
    default:
      return null;
  }
}

function InsuranceCard({
  insurance,
  authorizations,
  onEdit,
}: {
  insurance: InsuranceInfo;
  authorizations: Authorization[];
  onEdit?: () => void;
}) {
  const relatedAuths = authorizations.filter((a) => a.insuranceId === insurance.id);
  const activeAuth = relatedAuths.find((a) => a.status === "active");

  return (
    <CardWrapper className="relative">
      {onEdit && (
        <Button
          variant="ghost"
          size="sm"
          className="absolute top-3 right-3 h-8 w-8 p-0"
          onClick={onEdit}
        >
          <Pencil className="h-4 w-4" />
        </Button>
      )}

      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
          <Shield className="h-5 w-5 text-primary" />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <Text weight="medium">{insurance.provider}</Text>
            <Badge variant={insurance.type === "primary" ? "default" : "secondary"} className="text-xs">
              {insurance.type}
            </Badge>
          </div>
          {insurance.planName && (
            <Text size="sm" muted>
              {insurance.planName}
            </Text>
          )}
        </div>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <div>
          <Text size="xs" muted className="uppercase tracking-wide">
            Member ID
          </Text>
          <Text size="sm" className="mt-0.5 font-mono">
            {insurance.memberId}
          </Text>
        </div>
        {insurance.groupNumber && (
          <div>
            <Text size="xs" muted className="uppercase tracking-wide">
              Group Number
            </Text>
            <Text size="sm" className="mt-0.5 font-mono">
              {insurance.groupNumber}
            </Text>
          </div>
        )}
        <div>
          <Text size="xs" muted className="uppercase tracking-wide">
            Copay
          </Text>
          <Text size="sm" className="mt-0.5">
            {formatCurrency(insurance.copay)}
          </Text>
        </div>
        <div>
          <Text size="xs" muted className="uppercase tracking-wide">
            Deductible
          </Text>
          <Text size="sm" className="mt-0.5">
            {formatCurrency(insurance.deductibleMet)} / {formatCurrency(insurance.deductible)}
          </Text>
        </div>
        <div>
          <Text size="xs" muted className="uppercase tracking-wide">
            Effective Date
          </Text>
          <Text size="sm" className="mt-0.5">
            {formatDate(insurance.effectiveDate)}
          </Text>
        </div>
        {insurance.terminationDate && (
          <div>
            <Text size="xs" muted className="uppercase tracking-wide">
              Termination Date
            </Text>
            <Text size="sm" className="mt-0.5">
              {formatDate(insurance.terminationDate)}
            </Text>
          </div>
        )}
      </div>

      {/* Authorization Summary */}
      {activeAuth && (
        <div className="mt-4 rounded-lg border bg-muted/30 p-3">
          <div className="flex items-center gap-2">
            <AuthStatusIcon status={activeAuth.status} />
            <Text size="sm" weight="medium">
              Active Authorization
            </Text>
          </div>
          <div className="mt-2 grid gap-2 sm:grid-cols-3">
            <div>
              <Text size="xs" muted>
                Auth #
              </Text>
              <Text size="sm" className="font-mono">
                {activeAuth.authNumber}
              </Text>
            </div>
            <div>
              <Text size="xs" muted>
                Sessions
              </Text>
              <Text size="sm">
                {activeAuth.sessionsUsed} / {activeAuth.sessionsApproved} used
              </Text>
            </div>
            <div>
              <Text size="xs" muted>
                Valid Until
              </Text>
              <Text size="sm">{formatDate(activeAuth.endDate)}</Text>
            </div>
          </div>
          {activeAuth.sessionsApproved - activeAuth.sessionsUsed <= 3 && (
            <div className="mt-2 flex items-center gap-1.5 text-warning">
              <AlertCircle className="h-3.5 w-3.5" />
              <Text size="xs" weight="medium">
                {activeAuth.sessionsApproved - activeAuth.sessionsUsed} sessions remaining
              </Text>
            </div>
          )}
        </div>
      )}
    </CardWrapper>
  );
}

export function InsuranceTab({
  patientId,
  insurances,
  authorizations,
  isLoading = false,
  onSaveInsurance,
  onAddAuthorization,
  className,
}: InsuranceTabProps) {
  const [editingInsurance, setEditingInsurance] = React.useState<InsuranceInfo | null>(null);

  const primaryInsurance = insurances.find((i) => i.type === "primary");
  const secondaryInsurance = insurances.find((i) => i.type === "secondary");

  if (isLoading) {
    return (
      <div className={cn("flex h-64 items-center justify-center", className)}>
        <Text size="sm" muted>
          Loading insurance information...
        </Text>
      </div>
    );
  }

  return (
    <div className={cn("space-y-6", className)}>
      {/* Primary Insurance */}
      {primaryInsurance ? (
        <InsuranceCard
          insurance={primaryInsurance}
          authorizations={authorizations}
          onEdit={onSaveInsurance ? () => setEditingInsurance(primaryInsurance) : undefined}
        />
      ) : (
        <CardWrapper className="flex flex-col items-center justify-center py-8">
          <Shield className="h-10 w-10 text-muted-foreground/50" />
          <Text size="sm" muted className="mt-2">
            No primary insurance on file
          </Text>
          {onSaveInsurance && (
            <Button variant="outline" size="sm" className="mt-3 min-h-[44px]">
              <Plus className="mr-2 h-4 w-4" />
              Add Primary Insurance
            </Button>
          )}
        </CardWrapper>
      )}

      {/* Secondary Insurance */}
      {secondaryInsurance ? (
        <InsuranceCard
          insurance={secondaryInsurance}
          authorizations={authorizations}
          onEdit={onSaveInsurance ? () => setEditingInsurance(secondaryInsurance) : undefined}
        />
      ) : (
        primaryInsurance &&
        onSaveInsurance && (
          <Button variant="ghost" size="sm" className="w-full min-h-[44px]">
            <Plus className="mr-2 h-4 w-4" />
            Add Secondary Insurance
          </Button>
        )
      )}

      {/* All Authorizations */}
      <div>
        <div className="mb-3 flex items-center justify-between">
          <Text weight="medium">Authorization History</Text>
          {onAddAuthorization && (
            <Button variant="outline" size="sm" className="h-8">
              <Plus className="mr-1.5 h-3.5 w-3.5" />
              New Auth
            </Button>
          )}
        </div>

        {authorizations.length === 0 ? (
          <div className="rounded-lg border border-dashed p-6 text-center">
            <Text size="sm" muted>
              No authorizations on file
            </Text>
          </div>
        ) : (
          <div className="space-y-2">
            {authorizations.map((auth) => (
              <div
                key={auth.id}
                className="flex items-center justify-between rounded-lg border p-3"
              >
                <div className="flex items-center gap-3">
                  <AuthStatusIcon status={auth.status} />
                  <div>
                    <div className="flex items-center gap-2">
                      <Text size="sm" weight="medium" className="font-mono">
                        {auth.authNumber}
                      </Text>
                      <Badge className={cn("text-xs", getAuthStatusColor(auth.status))}>
                        {auth.status}
                      </Badge>
                    </div>
                    <Text size="xs" muted>
                      {auth.serviceType} &bull; {formatDate(auth.startDate)} -{" "}
                      {formatDate(auth.endDate)}
                    </Text>
                  </div>
                </div>
                <div className="text-right">
                  <Text size="sm" weight="medium">
                    {auth.sessionsUsed}/{auth.sessionsApproved}
                  </Text>
                  <Text size="xs" muted>
                    sessions
                  </Text>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
