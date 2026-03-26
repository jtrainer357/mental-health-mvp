"use client";

import * as React from "react";
import { LeftNav } from "../_components/left-nav";
import { HeaderSearch } from "../_components/header-search";
import { AnimatedBackground } from "@/design-system/components/ui/animated-background";
import { CardWrapper } from "@/design-system/components/ui/card-wrapper";
import { PageTransition } from "@/design-system/components/ui/page-transition";
import { Heading, Text } from "@/design-system/components/ui/typography";
import { Button } from "@/design-system/components/ui/button";
import {
  DollarSign,
  CreditCard,
  Clock,
  Lock,
  TrendingUp,
  AlertTriangle,
  RefreshCw,
  Sparkles,
  FileCheck,
  Receipt,
  Wallet,
  ShieldCheck,
} from "lucide-react";
import { MetricCardSkeleton } from "@/design-system/components/ui/skeleton";
import { getBillingSummary, type BillingSummary } from "@/src/lib/queries/billing";
import { createLogger } from "@/src/lib/logger";

const log = createLogger("BillingPage");

interface MetricCardProps {
  title: string;
  value: string;
  subtitle: string;
  icon: React.ElementType;
  status: "good" | "needs-improvement" | "critical";
  trend?: string;
  trendUp?: boolean;
}

function MetricCard({
  title,
  value,
  subtitle,
  icon: Icon,
  status,
  trend,
  trendUp,
}: MetricCardProps) {
  const valueColor =
    status === "good"
      ? "text-teal-dark"
      : status === "needs-improvement"
        ? "text-primary"
        : "text-destructive";

  const borderColor =
    status === "good"
      ? "border-teal-dark/40"
      : status === "needs-improvement"
        ? "border-primary/40"
        : "border-destructive/40";

  const leftBorderColor =
    status === "good"
      ? "border-l-teal-dark/60"
      : status === "needs-improvement"
        ? "border-l-primary/60"
        : "border-l-destructive/60";

  return (
    <CardWrapper className={`border border-l-4 bg-white/90 p-6 ${borderColor} ${leftBorderColor}`}>
      <div className="flex items-start gap-3">
        <div className="text-teal-dark mt-0.5">
          <Icon className="h-5 w-5" />
        </div>
        <div className="flex-1">
          <Text size="sm" className="text-foreground font-medium">
            {title}
          </Text>
          <div className="mt-1 flex items-baseline gap-2">
            <Heading level={2} className={`text-4xl ${valueColor}`}>
              {value}
            </Heading>
          </div>
          <Text size="sm" muted className="mt-2">
            {subtitle}
          </Text>
          {trend && (
            <div className="mt-2 flex items-center gap-1">
              <TrendingUp
                className={`h-4 w-4 ${trendUp ? "text-success" : "text-destructive rotate-180"}`}
              />
              <Text size="xs" className={trendUp ? "text-success" : "text-destructive"}>
                {trend}
              </Text>
            </div>
          )}
        </div>
      </div>
    </CardWrapper>
  );
}

// Circular progress component
function CircularProgress({
  percentage,
  color,
  size = 100,
}: {
  percentage: number;
  color: "teal" | "coral" | "gray";
  size?: number;
}) {
  const strokeWidth = 8;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;

  const strokeColor =
    color === "teal" ? "stroke-teal-dark" : color === "coral" ? "stroke-primary" : "stroke-border";

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg className="rotate-[-90deg]" width={size} height={size}>
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-muted-foreground/30"
        />
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          className={strokeColor}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 0.5s ease-in-out" }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-lg font-semibold">{percentage}%</span>
      </div>
    </div>
  );
}

// Simple bar chart component
function BarChart({ data }: { data: number[] }) {
  const max = Math.max(...data);
  return (
    <div className="flex h-32 items-end gap-3">
      {data.map((value, i) => (
        <div
          key={i}
          className="bg-rating flex-1 rounded-t"
          style={{
            height: `${(value / max) * 100}%`,
            opacity: i % 2 === 0 ? 0.9 : 0.8,
          }}
        />
      ))}
    </div>
  );
}

// Format currency
function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

export default function BillingPage() {
  const [summary, setSummary] = React.useState<BillingSummary | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  // Load billing summary from Supabase
  const loadBilling = React.useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getBillingSummary();
      setSummary(data);
    } catch (err) {
      log.error("Failed to load billing", err);
      setError("Unable to load billing data. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    loadBilling();
  }, [loadBilling]);

  return (
    <div className="min-h-screen pb-24 md:pb-0">
      <AnimatedBackground />

      {/* Left Nav */}
      <LeftNav activePage="billing" />

      {/* Main Content Wrapper */}
      <div className="md:pl-24">
        <HeaderSearch />

        <main
          id="main-content"
          role="main"
          aria-label="Billing content"
          className="px-4 py-4 sm:px-6 sm:py-6 md:py-8"
        >
          <PageTransition>
            <div className="mx-auto max-w-[1600px] pb-10">
              {/* Upsell Banner - Teal Gradient */}
              <div className="from-teal to-teal/80 mb-8 overflow-hidden rounded-xl bg-gradient-to-r p-4 text-white sm:p-6 md:p-8">
                <div className="flex flex-col items-start gap-4 md:flex-row md:items-center md:justify-between md:gap-6">
                  <div className="flex flex-1 items-start gap-4 md:gap-6">
                    <div className="hidden shrink-0 md:block">
                      <Lock className="h-16 w-16 text-white/90" strokeWidth={1.5} />
                    </div>
                    <div className="flex-1">
                      <div className="mb-2 flex items-center gap-2">
                        <Sparkles className="h-5 w-5 shrink-0" />
                        <Text
                          size="xs"
                          className="font-bold tracking-wider text-white/90 uppercase"
                        >
                          Premium Feature
                        </Text>
                      </div>
                      <Heading
                        level={3}
                        className="mb-2 text-xl text-white sm:text-2xl md:text-3xl"
                      >
                        Unlock Complete Revenue Cycle Management
                      </Heading>
                      <Text className="max-w-xl text-sm text-white/80 sm:text-base">
                        Automate claims processing, patient statements, payment plans, and
                        collections. Get real-time insights into your practice finances with
                        AI-powered analytics.
                      </Text>
                    </div>
                  </div>
                  <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
                    <Button
                      variant="ghost"
                      className="border border-white/30 text-white hover:bg-white/10"
                    >
                      Learn More
                    </Button>
                    <Button variant="secondary" className="text-teal bg-white hover:bg-white/90">
                      Upgrade Now
                    </Button>
                  </div>
                </div>
              </div>

              {/* Loading State with Skeleton */}
              {loading && (
                <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                  <MetricCardSkeleton />
                  <MetricCardSkeleton />
                  <MetricCardSkeleton />
                </div>
              )}

              {/* Error State */}
              {error && !loading && (
                <CardWrapper className="mb-8 p-8">
                  <div className="flex flex-col items-center justify-center py-6 text-center">
                    <div className="bg-destructive/10 mb-4 flex h-14 w-14 items-center justify-center rounded-full">
                      <AlertTriangle className="text-destructive h-7 w-7" />
                    </div>
                    <Heading level={4} className="mb-2 text-lg font-semibold">
                      Unable to Load Billing Data
                    </Heading>
                    <Text muted className="mb-4 max-w-sm">
                      {error}
                    </Text>
                    <Button onClick={loadBilling} variant="outline" className="gap-2">
                      <RefreshCw className="h-4 w-4" />
                      Try Again
                    </Button>
                  </div>
                </CardWrapper>
              )}

              {/* Metrics Grid - shown when loaded successfully */}
              {!loading && !error && (
                <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                  <MetricCard
                    title="Total Charged"
                    value={formatCurrency(summary?.totalCharged || 0)}
                    subtitle={`${(summary?.invoiceCount || 0).toLocaleString()} Invoices (6 months)`}
                    icon={DollarSign}
                    status="good"
                    trend={`${(summary?.paidCount || 0).toLocaleString()} paid, ${(summary?.pendingCount || 0).toLocaleString()} pending`}
                    trendUp={true}
                  />
                  <MetricCard
                    title="Collections"
                    value={formatCurrency(summary?.totalCollected || 0)}
                    subtitle={`${summary?.collectionRate || 0}% Collection Rate`}
                    icon={CreditCard}
                    status={(summary?.collectionRate || 0) >= 80 ? "good" : "needs-improvement"}
                    trend={
                      summary?.collectionRate && summary.collectionRate >= 80
                        ? "Above industry average"
                        : "Below target"
                    }
                    trendUp={(summary?.collectionRate || 0) >= 80}
                  />
                  <MetricCard
                    title="Outstanding AR"
                    value={formatCurrency(summary?.outstandingAR || 0)}
                    subtitle="Balance Due"
                    icon={Clock}
                    status={
                      (summary?.outstandingAR || 0) === 0
                        ? "good"
                        : (summary?.outstandingAR || 0) > 10000
                          ? "critical"
                          : "needs-improvement"
                    }
                    trend={
                      summary?.outstandingAR && summary.outstandingAR > 0
                        ? "Requires follow-up"
                        : "All collected"
                    }
                    trendUp={(summary?.outstandingAR || 0) === 0}
                  />
                </div>
              )}

              {/* Advanced Billing Features */}
              <CardWrapper className="p-6">
                <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <Heading level={3} className="text-xl">
                      Advanced Billing Features
                    </Heading>
                    <Text muted>
                      Unlock the full power of Tebra&apos;s revenue cycle management
                    </Text>
                  </div>
                  <Button className="shrink-0 gap-2">
                    Unlock Premium AI Features
                    <Sparkles className="h-4 w-4" />
                  </Button>
                </div>

                {/* Feature Grid */}
                <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                  {[
                    {
                      title: "Claims Management",
                      description:
                        "Automated insurance claims submission, tracking, and denial management",
                      icon: FileCheck,
                    },
                    {
                      title: "Patient Statements",
                      description:
                        "Automated patient billing with customizable statement templates",
                      icon: Receipt,
                    },
                    {
                      title: "Payment Plans",
                      description: "Flexible payment plan options to improve patient collections",
                      icon: Wallet,
                    },
                    {
                      title: "Denial Prevention",
                      description: "AI-powered claim scrubbing to catch errors before submission",
                      icon: ShieldCheck,
                    },
                  ].map((feature, i) => (
                    <CardWrapper key={i} className="border-border bg-white p-4 shadow-sm">
                      <div className="mb-3 flex items-center gap-3">
                        <feature.icon className="text-teal-dark h-10 w-10 shrink-0 opacity-50" />
                        <Text className="font-medium">{feature.title}</Text>
                      </div>
                      <Text size="sm" muted className="pl-[3.25rem]">
                        {feature.description}
                      </Text>
                    </CardWrapper>
                  ))}
                </div>

                {/* Financial Performance Section */}
                <CardWrapper className="border-0 bg-white p-4 shadow-sm sm:p-6">
                  <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                    <Heading level={4} className="text-lg">
                      Financial Performance
                    </Heading>
                    <Text size="xs" muted className="sm:text-right">
                      * Data is for display purposes only
                    </Text>
                  </div>

                  {/* Revenue Summary */}
                  <div className="mb-6">
                    <Heading level={2} className="text-4xl">
                      $824,500
                    </Heading>
                    <Text size="sm" muted>
                      +12.5% from last month
                    </Text>
                  </div>

                  {/* Bar Chart */}
                  <div className="mb-8">
                    <BarChart data={[65, 85, 78, 45, 72, 88]} />
                  </div>

                  {/* Circular Progress Indicators */}
                  <div className="mb-6 grid grid-cols-1 gap-6 sm:grid-cols-3 sm:gap-4">
                    <div className="flex flex-col items-center">
                      <CircularProgress percentage={92.4} color="teal" />
                      <Text size="sm" muted className="mt-2 text-center">
                        Collections Rate
                      </Text>
                    </div>
                    <div className="flex flex-col items-center">
                      <CircularProgress percentage={2.8} color="gray" />
                      <Text size="sm" muted className="mt-2 text-center">
                        Denial Rate
                      </Text>
                    </div>
                    <div className="flex flex-col items-center">
                      <CircularProgress percentage={91.7} color="coral" />
                      <Text size="sm" muted className="mt-2 text-center">
                        Clean Claim Rate
                      </Text>
                    </div>
                  </div>

                  {/* Alert Cards */}
                  <div className="space-y-3">
                    <CardWrapper className="border-border flex flex-col gap-3 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex items-center gap-3">
                        <div className="bg-destructive/10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full">
                          <AlertTriangle className="text-destructive h-5 w-5" />
                        </div>
                        <div className="min-w-0">
                          <Text className="font-medium">Denial Spikes</Text>
                          <Text size="sm" muted>
                            Unusual rate for CPT 99213
                          </Text>
                        </div>
                      </div>
                      <Button variant="outline" size="sm" className="w-full shrink-0 sm:w-auto">
                        Learn More
                      </Button>
                    </CardWrapper>

                    <CardWrapper className="border-border flex flex-col gap-3 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex items-center gap-3">
                        <div className="bg-warning/10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full">
                          <Clock className="text-warning h-5 w-5" />
                        </div>
                        <div className="min-w-0">
                          <Text className="font-medium">Aging A/R</Text>
                          <Text size="sm" muted>
                            $12k outstanding &gt; 90 days
                          </Text>
                        </div>
                      </div>
                      <Button variant="outline" size="sm" className="w-full shrink-0 sm:w-auto">
                        Learn More
                      </Button>
                    </CardWrapper>
                  </div>
                </CardWrapper>
              </CardWrapper>
            </div>
          </PageTransition>
        </main>
      </div>
    </div>
  );
}
