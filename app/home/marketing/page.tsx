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
  Star,
  Search,
  MapPin,
  TrendingUp,
  TrendingDown,
  Minus,
  Sparkles,
  Lock,
} from "lucide-react";

// Competitive landscape data
const competitorData = [
  {
    rank: 1,
    name: "Advanced Care Medical Group",
    seo: 85,
    seoTrend: "up",
    aio: 78,
    aioTrend: "up",
    geo: 92,
    geoTrend: "up",
    overall: 85,
  },
  {
    rank: 2,
    name: "HealthFirst Family Practice",
    seo: 76,
    seoTrend: "up",
    aio: 71,
    aioTrend: "up",
    geo: 88,
    geoTrend: "up",
    overall: 78,
  },
  {
    rank: 3,
    name: "Wellness Primary Care",
    seo: 72,
    seoTrend: "up",
    aio: 68,
    aioTrend: "flat",
    geo: 81,
    geoTrend: "up",
    overall: 74,
  },
  {
    rank: 4,
    name: "Community Health Partners",
    seo: 58,
    seoTrend: "flat",
    aio: 45,
    aioTrend: "down",
    geo: 73,
    geoTrend: "up",
    overall: 59,
  },
  {
    rank: 5,
    name: "City Medical Associates",
    seo: 51,
    seoTrend: "flat",
    aio: 38,
    aioTrend: "down",
    geo: 69,
    geoTrend: "flat",
    overall: 53,
  },
  {
    rank: 6,
    name: "Smith Family Medicine",
    seo: 64,
    seoTrend: "flat",
    aio: 42,
    aioTrend: "down",
    geo: 45,
    geoTrend: "down",
    overall: 50,
    isYou: true,
  },
];

function TrendIcon({ trend }: { trend: "up" | "down" | "flat" }) {
  if (trend === "up") return <TrendingUp className="text-success h-4 w-4" />;
  if (trend === "down") return <TrendingDown className="text-destructive h-4 w-4" />;
  return <Minus className="text-muted-foreground h-4 w-4" />;
}

function ScoreWithTrend({ score, trend }: { score: number; trend: "up" | "down" | "flat" }) {
  const color =
    trend === "up" ? "text-success" : trend === "down" ? "text-destructive" : "text-warning";
  return (
    <div className="flex items-center gap-1">
      <span className={`font-medium ${color}`}>{score}</span>
      <TrendIcon trend={trend} />
    </div>
  );
}

interface ScoreCardProps {
  title: string;
  score: number;
  description: string;
  status: "good" | "needs-improvement" | "critical";
  icon: React.ElementType;
}

function ScoreCard({ title, score, description, status, icon: Icon }: ScoreCardProps) {
  const scoreColor =
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
            <Heading level={2} className={`text-4xl ${scoreColor}`}>
              {score}
            </Heading>
            <Text size="sm" muted>
              out of 100
            </Text>
          </div>
          <Text size="sm" muted className="mt-2">
            {description}
          </Text>
        </div>
      </div>
    </CardWrapper>
  );
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`h-5 w-5 ${
            star <= Math.floor(rating)
              ? "fill-rating text-rating"
              : star - 0.5 <= rating
                ? "fill-rating/50 text-rating"
                : "fill-rating-empty text-rating-empty"
          }`}
        />
      ))}
    </div>
  );
}

export default function MarketingPage() {
  return (
    <div className="min-h-screen pb-24 md:pb-0">
      <AnimatedBackground />

      {/* Left Nav */}
      <LeftNav activePage="marketing" />

      {/* Main Content Wrapper */}
      <div className="md:pl-24">
        <HeaderSearch />

        <main
          id="main-content"
          role="main"
          aria-label="Marketing content"
          className="px-4 py-4 sm:px-6 sm:py-6 md:py-8"
        >
          <PageTransition>
            <div className="mx-auto max-w-[1600px] pb-10">
              {/* Upsell Banner - Teal Gradient */}
              <div className="from-teal to-teal/80 mb-8 overflow-hidden rounded-xl bg-gradient-to-r p-8 text-white">
                <div className="flex flex-col items-start gap-6 md:flex-row md:items-center md:justify-between">
                  <div className="flex flex-1 items-start gap-6">
                    <div className="hidden shrink-0 md:block">
                      <Lock className="h-16 w-16 text-white/90" strokeWidth={1.5} />
                    </div>
                    <div className="flex-1">
                      <div className="mb-2 flex items-center gap-2">
                        <Sparkles className="h-5 w-5" />
                        <Text
                          size="xs"
                          className="font-bold tracking-wider text-white/90 uppercase"
                        >
                          Premium Feature
                        </Text>
                      </div>
                      <Heading level={3} className="mb-2 text-3xl text-white">
                        Unlock Automated Marketing & Reputation Management
                      </Heading>
                      <Text className="max-w-xl text-white/80">
                        Automatically request reviews from satisfied patients, respond to feedback,
                        monitor your online presence across platforms, and improve your search
                        visibility with AI-powered optimization.
                      </Text>
                    </div>
                  </div>
                  <div className="flex flex-col gap-3 sm:flex-row">
                    <Button
                      variant="ghost"
                      className="min-h-[44px] border border-white/30 text-white hover:bg-white/10"
                    >
                      Learn More
                    </Button>
                    <Button
                      variant="secondary"
                      className="text-teal min-h-[44px] bg-white hover:bg-white/90"
                    >
                      Upgrade Now
                    </Button>
                  </div>
                </div>
              </div>

              {/* Metrics Grid */}
              <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                {/* Review Score Card - Special styling */}
                <CardWrapper className="bg-white/90 p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <Text size="sm" muted className="mb-1">
                        Review Score
                      </Text>
                      <div className="mb-2 flex items-baseline gap-2">
                        <Heading level={2} className="text-3xl">
                          4.8
                        </Heading>
                        <StarRating rating={4.8} />
                      </div>
                      <Text size="sm" muted>
                        142 Reviews
                      </Text>
                    </div>
                  </div>
                </CardWrapper>

                <ScoreCard
                  title="SEO Score"
                  score={64}
                  description="Google organic search ranking - needs improvement"
                  status="needs-improvement"
                  icon={Search}
                />
                <ScoreCard
                  title="AIO Score"
                  score={42}
                  description="AI search visibility (ChatGPT, Perplexity) - critical"
                  status="critical"
                  icon={TrendingUp}
                />
                <ScoreCard
                  title="GEO Score"
                  score={45}
                  description="Generative Engine Optimization - critical"
                  status="critical"
                  icon={MapPin}
                />
              </div>

              {/* Competitive Landscape */}
              <CardWrapper className="mb-8 p-6">
                <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <Heading level={3} className="text-xl">
                      Competitive Landscape in Pittsburgh, PA
                    </Heading>
                    <Text muted>
                      See how your practice visibility compares to nearby competitors
                    </Text>
                  </div>
                  <Button className="shrink-0 gap-2">
                    Unlock Premium AI Features
                    <Sparkles className="h-4 w-4" />
                  </Button>
                </div>

                {/* Warning Banner */}
                <div className="bg-warning-bg mb-6 flex items-start gap-3 rounded-lg p-4">
                  <TrendingDown className="text-warning mt-0.5 h-5 w-5 flex-shrink-0" />
                  <div>
                    <Text className="text-warning-muted font-medium">
                      Your practice ranks #6 out of 12 in your market
                    </Text>
                    <Text size="sm" className="text-warning">
                      Top-ranking practices are capturing 3-5x more patient inquiries through
                      AI-powered search. You&apos;re missing opportunities to 60% of patients
                      searching for care in your specialty.
                    </Text>
                  </div>
                </div>

                {/* Table */}
                <div className="-mx-2 overflow-x-auto px-2 pt-2 pb-4">
                  <table className="w-full border-separate border-spacing-0">
                    <thead>
                      <tr>
                        <th className="text-muted-foreground pb-3 text-left text-xs font-medium tracking-wider uppercase">
                          Practice
                        </th>
                        <th className="text-muted-foreground pb-3 text-left text-xs font-medium tracking-wider uppercase">
                          SEO
                        </th>
                        <th className="text-muted-foreground pb-3 text-left text-xs font-medium tracking-wider uppercase">
                          AIO
                        </th>
                        <th className="text-muted-foreground pb-3 text-left text-xs font-medium tracking-wider uppercase">
                          GEO
                        </th>
                        <th className="text-muted-foreground pb-3 text-right text-xs font-medium tracking-wider uppercase">
                          Overall
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {competitorData.map((competitor) => (
                        <tr key={competitor.rank}>
                          <td
                            className={`py-4 ${competitor.isYou ? "border-l-primary border-y-primary/40 rounded-l-lg border-y border-l-4 bg-white pl-4 shadow-md" : "border-border/50 border-b"}`}
                          >
                            <div className="flex items-center gap-2">
                              <span className="text-muted-foreground text-sm">
                                #{competitor.rank}
                              </span>
                              <div>
                                <Text className="font-medium">{competitor.name}</Text>
                                {competitor.isYou && (
                                  <Text size="xs" className="text-teal-dark font-medium">
                                    Your Practice
                                  </Text>
                                )}
                              </div>
                            </div>
                          </td>
                          <td
                            className={`py-4 ${competitor.isYou ? "border-y-primary/40 border-y bg-white shadow-md" : "border-border/50 border-b"}`}
                          >
                            <ScoreWithTrend
                              score={competitor.seo}
                              trend={competitor.seoTrend as "up" | "down" | "flat"}
                            />
                          </td>
                          <td
                            className={`py-4 ${competitor.isYou ? "border-y-primary/40 border-y bg-white shadow-md" : "border-border/50 border-b"}`}
                          >
                            <ScoreWithTrend
                              score={competitor.aio}
                              trend={competitor.aioTrend as "up" | "down" | "flat"}
                            />
                          </td>
                          <td
                            className={`py-4 ${competitor.isYou ? "border-y-primary/40 border-y bg-white shadow-md" : "border-border/50 border-b"}`}
                          >
                            <ScoreWithTrend
                              score={competitor.geo}
                              trend={competitor.geoTrend as "up" | "down" | "flat"}
                            />
                          </td>
                          <td
                            className={`py-4 text-right ${competitor.isYou ? "border-y-primary/40 border-r-primary/40 rounded-r-lg border-y border-r bg-white pr-4 shadow-md" : "border-border/50 border-b"}`}
                          >
                            <span className="font-medium">{competitor.overall}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Footer Stats */}
                <div className="border-border mt-6 grid grid-cols-1 gap-4 border-t pt-6 sm:grid-cols-3">
                  <div className="text-center">
                    <Heading level={4} className="text-2xl">
                      85
                    </Heading>
                    <Text size="xs" muted className="font-bold tracking-wider uppercase">
                      Market Leader Score
                    </Text>
                  </div>
                  <div className="text-center">
                    <Heading level={4} className="text-2xl">
                      68
                    </Heading>
                    <Text size="xs" muted className="font-bold tracking-wider uppercase">
                      Market Average
                    </Text>
                  </div>
                  <div className="text-center">
                    <Heading level={4} className="text-primary text-2xl">
                      +35 pts
                    </Heading>
                    <Text size="xs" muted className="font-bold tracking-wider uppercase">
                      Your Growth Potential
                    </Text>
                  </div>
                </div>
              </CardWrapper>

              {/* Additional Info Cards */}
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                <CardWrapper className="flex flex-col bg-white/90 p-6">
                  <Heading level={4} className="mb-4 text-lg">
                    Recent Reviews
                  </Heading>
                  <div className="flex-1 space-y-4">
                    {[
                      {
                        name: "John D.",
                        rating: 5,
                        text: "Dr. Chen is amazing! Very thorough and caring.",
                        date: "2 days ago",
                      },
                      {
                        name: "Maria S.",
                        rating: 5,
                        text: "Easy scheduling and minimal wait time.",
                        date: "1 week ago",
                      },
                      {
                        name: "Robert K.",
                        rating: 4,
                        text: "Great experience overall, would recommend.",
                        date: "2 weeks ago",
                      },
                    ].map((review, i) => (
                      <div key={i} className="border-border/50 border-b pb-3 last:border-0">
                        <div className="mb-1 flex items-center justify-between">
                          <Text className="font-medium">{review.name}</Text>
                          <Text size="xs" muted>
                            {review.date}
                          </Text>
                        </div>
                        <StarRating rating={review.rating} />
                        <Text size="sm" muted className="mt-1">
                          {review.text}
                        </Text>
                      </div>
                    ))}
                  </div>
                  <div className="mt-auto flex justify-center pt-4">
                    <Button variant="outline" size="default">
                      Learn More
                    </Button>
                  </div>
                </CardWrapper>

                <CardWrapper className="flex flex-col bg-white/90 p-6">
                  <Heading level={4} className="mb-4 text-lg">
                    Platform Performance
                  </Heading>
                  <div className="flex-1 space-y-4">
                    {[
                      { platform: "Google Business", reviews: 89, rating: 4.9 },
                      { platform: "Healthgrades", reviews: 32, rating: 4.7 },
                      { platform: "Zocdoc", reviews: 21, rating: 4.8 },
                    ].map((platform, i) => (
                      <div
                        key={i}
                        className="border-border/50 flex items-center justify-between border-b pb-3 last:border-0"
                      >
                        <div>
                          <Text className="font-medium">{platform.platform}</Text>
                          <Text size="sm" muted>
                            {platform.reviews} reviews
                          </Text>
                        </div>
                        <div className="flex items-center gap-2">
                          <Star className="fill-rating text-rating h-4 w-4" />
                          <Text className="font-medium">{platform.rating}</Text>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-auto flex justify-center pt-4">
                    <Button variant="outline" size="default">
                      Learn More
                    </Button>
                  </div>
                </CardWrapper>

                <CardWrapper className="flex flex-col bg-white/90 p-6">
                  <Heading level={4} className="mb-4 text-center text-lg">
                    Appointment Insights
                  </Heading>
                  <div className="mb-4 text-center">
                    <Heading level={2} className="text-teal-dark text-5xl">
                      47
                    </Heading>
                    <Text size="sm" muted>
                      Total Appointments
                    </Text>
                  </div>
                  <div className="mb-4 text-center">
                    <Text className="text-success text-2xl font-medium">+12%</Text>
                    <Text size="sm" muted>
                      vs. Last Month
                    </Text>
                  </div>
                  <div className="border-border bg-card rounded-lg border p-4">
                    <Text className="mb-3 font-medium">Top Channels</Text>
                    <div className="space-y-2">
                      {[
                        { channel: "Google Search", percentage: 67 },
                        { channel: "Direct Website", percentage: 23 },
                        { channel: "Social Media", percentage: 10 },
                      ].map((item, i) => (
                        <div key={i} className="flex items-center justify-between">
                          <Text size="sm" muted>
                            {item.channel}
                          </Text>
                          <Text size="sm" className="text-teal-dark font-medium">
                            {item.percentage}%
                          </Text>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="mt-auto flex justify-center pt-4">
                    <Button variant="outline" size="default">
                      Learn More
                    </Button>
                  </div>
                </CardWrapper>
              </div>
            </div>
          </PageTransition>
        </main>
      </div>
    </div>
  );
}
