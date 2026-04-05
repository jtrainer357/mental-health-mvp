"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { DollarSign } from "lucide-react";
import { OutstandingCard } from "@/design-system/components/ui/outstanding-card";
import { cn } from "@/design-system/lib/utils";

interface BillingUpsellWidgetProps {
  className?: string;
}

export function BillingUpsellWidget({ className }: BillingUpsellWidgetProps) {
  const router = useRouter();

  // Prefetch billing route on mount for instant navigation
  React.useEffect(() => {
    router.prefetch("/home/billing");
  }, [router]);

  return (
    <OutstandingCard
      title="Try Our Billing Solution"
      count={30}
      suffix="%"
      subtitle="Increase collections"
      buttonText="Learn More"
      onButtonClick={() => router.push("/home/billing")}
      icon={DollarSign}
      className={cn(className)}
    />
  );
}
