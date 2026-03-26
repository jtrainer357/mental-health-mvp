"use client";

import * as React from "react";
import { LeftNav } from "../_components/left-nav";
import { HeaderSearch } from "../_components/header-search";
import { AnimatedBackground } from "@/design-system/components/ui/animated-background";
import { PageTransition } from "@/design-system/components/ui/page-transition";
import { CardWrapper } from "@/design-system/components/ui/card-wrapper";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/design-system/components/ui/card";
import { Button } from "@/design-system/components/ui/button";
import { Input } from "@/design-system/components/ui/input";
import { Label } from "@/design-system/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/design-system/components/ui/select";

// Types
interface DirectoryListing {
  directory: string;
  found: boolean;
  profileUrl?: string;
  reviewCount?: number;
  averageRating?: number;
}

interface Competitor {
  name: string;
  practiceName?: string;
  compositeScore: number;
  seoScore: number;
  geoScore: number;
  aioScore: number;
  strengths: string[];
}

interface Recommendation {
  priority: "critical" | "high" | "medium" | "low";
  category: "seo" | "geo" | "aio";
  title: string;
  description: string;
  estimatedImpact: string;
}

interface AnalysisResult {
  provider: {
    providerName: string;
    practiceName: string;
    specialty: string;
    city: string;
    state: string;
    zip: string;
  };
  analyzedAt: string;
  seo: {
    score: number;
    directoryPresence: DirectoryListing[];
    googleBusinessProfile: boolean;
    localPackRanking: string;
    websiteOptimization: number;
    signals: string[];
  };
  geo: {
    score: number;
    aiCitability: number;
    contentStructure: number;
    authoritySignals: number;
    signals: string[];
  };
  aio: {
    score: number;
    eeatScore: number;
    clinicalContent: number;
    schemaMarkup: number;
    signals: string[];
  };
  compositeScore: number;
  tier: "S" | "A" | "B" | "C" | "D" | "F";
  competitors: Competitor[];
  marketPosition: string;
  recommendations: Recommendation[];
  executiveSummary: string;
}

const US_STATES = [
  "AL",
  "AK",
  "AZ",
  "AR",
  "CA",
  "CO",
  "CT",
  "DE",
  "FL",
  "GA",
  "HI",
  "ID",
  "IL",
  "IN",
  "IA",
  "KS",
  "KY",
  "LA",
  "ME",
  "MD",
  "MA",
  "MI",
  "MN",
  "MS",
  "MO",
  "MT",
  "NE",
  "NV",
  "NH",
  "NJ",
  "NM",
  "NY",
  "NC",
  "ND",
  "OH",
  "OK",
  "OR",
  "PA",
  "RI",
  "SC",
  "SD",
  "TN",
  "TX",
  "UT",
  "VT",
  "VA",
  "WA",
  "WV",
  "WI",
  "WY",
];

const SPECIALTIES = [
  "Mental Health Therapist",
  "Licensed Clinical Psychologist",
  "Psychiatrist",
  "Marriage and Family Therapist",
  "Licensed Clinical Social Worker",
  "Licensed Professional Counselor",
  "Addiction Counselor",
  "Child Psychologist",
  "Neuropsychologist",
  "Behavioral Health Specialist",
];

function ScoreBar({ score, label }: { score: number; label: string }) {
  const getColor = (s: number) => {
    if (s >= 75) return "bg-emerald-500";
    if (s >= 60) return "bg-sky-500";
    if (s >= 40) return "bg-amber-500";
    return "bg-rose-500";
  };

  return (
    <div className="space-y-1">
      <div className="flex justify-between text-sm">
        <span className="text-foreground-strong font-medium">{label}</span>
        <span className="font-semibold">{score}</span>
      </div>
      <div className="h-3 w-full overflow-hidden rounded-full bg-gray-200">
        <div
          className={`h-full rounded-full transition-all duration-1000 ease-out ${getColor(score)}`}
          style={{ width: `${score}%` }}
        />
      </div>
    </div>
  );
}

function TierBadge({ tier }: { tier: string }) {
  const colors: Record<string, string> = {
    S: "bg-teal-500 text-white",
    A: "bg-emerald-500 text-white",
    B: "bg-sky-500 text-white",
    C: "bg-amber-500 text-white",
    D: "bg-orange-500 text-white",
    F: "bg-rose-500 text-white",
  };

  const labels: Record<string, string> = {
    S: "Elite",
    A: "Strong",
    B: "Good",
    C: "Needs Work",
    D: "Poor",
    F: "Invisible",
  };

  return (
    <div className="flex items-center gap-3">
      <span
        className={`inline-flex h-14 w-14 items-center justify-center rounded-xl text-2xl font-bold ${colors[tier]}`}
      >
        {tier}
      </span>
      <div>
        <div className="text-muted-foreground text-sm">Tier</div>
        <div className="text-foreground-strong font-semibold">{labels[tier]}</div>
      </div>
    </div>
  );
}

function DirectoryList({ directories }: { directories: DirectoryListing[] }) {
  const found = directories.filter((d) => d.found);
  const _notFound = directories.filter((d) => !d.found);

  return (
    <div className="space-y-3">
      <div className="text-foreground-strong text-sm font-medium">
        Directory Presence ({found.length}/{directories.length})
      </div>
      <div className="grid grid-cols-2 gap-2">
        {directories.map((d) => (
          <div
            key={d.directory}
            className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm ${
              d.found ? "bg-emerald-50 text-emerald-700" : "bg-gray-50 text-gray-500"
            }`}
          >
            <span>{d.found ? "✓" : "✗"}</span>
            <span>{d.directory}</span>
            {d.found && d.averageRating && (
              <span className="ml-auto text-xs">{d.averageRating}★</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function CompetitorTable({
  competitors,
  marketPosition,
}: {
  competitors: Competitor[];
  marketPosition: string;
}) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="text-foreground-strong text-sm font-medium">Competitive Landscape</div>
        <div className="text-muted-foreground text-sm">{marketPosition}</div>
      </div>
      <div className="space-y-2">
        {competitors.slice(0, 5).map((c, i) => {
          const tier =
            c.compositeScore >= 75
              ? "A"
              : c.compositeScore >= 60
                ? "B"
                : c.compositeScore >= 40
                  ? "C"
                  : "D";
          return (
            <div key={i} className="flex items-center gap-3 rounded-lg bg-gray-50 px-3 py-2">
              <span
                className={`flex h-8 w-8 items-center justify-center rounded-lg text-sm font-bold ${
                  tier === "A"
                    ? "bg-emerald-100 text-emerald-700"
                    : tier === "B"
                      ? "bg-sky-100 text-sky-700"
                      : tier === "C"
                        ? "bg-amber-100 text-amber-700"
                        : "bg-rose-100 text-rose-700"
                }`}
              >
                {c.compositeScore}
              </span>
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-medium">{c.name}</div>
                {c.practiceName && c.practiceName !== c.name && (
                  <div className="text-muted-foreground truncate text-xs">{c.practiceName}</div>
                )}
              </div>
              <div className="text-muted-foreground text-xs">
                SEO {c.seoScore} • GEO {c.geoScore} • AIO {c.aioScore}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function RecommendationList({ recommendations }: { recommendations: Recommendation[] }) {
  const priorityIcons: Record<string, string> = {
    critical: "🔴",
    high: "🟠",
    medium: "🟡",
    low: "🟢",
  };

  const categoryColors: Record<string, string> = {
    seo: "bg-blue-100 text-blue-700",
    geo: "bg-cyan-100 text-cyan-700",
    aio: "bg-teal-100 text-teal-700",
  };

  return (
    <div className="space-y-3">
      <div className="text-foreground-strong text-sm font-medium">Recommendations</div>
      <div className="space-y-3">
        {recommendations.slice(0, 5).map((r, i) => (
          <div key={i} className="space-y-2 rounded-lg bg-gray-50 p-3">
            <div className="flex items-start gap-2">
              <span>{priorityIcons[r.priority]}</span>
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm font-medium">{r.title}</span>
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs ${categoryColors[r.category]}`}
                  >
                    {r.category.toUpperCase()}
                  </span>
                </div>
                <p className="text-muted-foreground mt-1 text-sm">{r.description}</p>
                <p className="mt-1 text-xs text-emerald-600">{r.estimatedImpact}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function MarketingTestPage() {
  const [formData, setFormData] = React.useState({
    practiceName: "",
    specialty: "Mental Health Therapist",
    city: "",
    state: "CA",
    zip: "",
    websiteUrl: "",
  });
  const [isLoading, setIsLoading] = React.useState(false);
  const [result, setResult] = React.useState<AnalysisResult | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch("/api/marketing-analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          providerName: formData.practiceName,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Analysis failed");
      }

      const data = await response.json();
      setResult(data);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen pb-24 md:pb-0">
      <AnimatedBackground />
      <LeftNav activePage="marketing" />

      <div className="md:pl-20">
        <HeaderSearch />

        <main className="px-4 py-4 sm:px-6 sm:py-6 md:py-8">
          <PageTransition>
            <div className="mx-auto max-w-[1600px] space-y-6">
              {/* Header */}
              <div>
                <h1 className="text-foreground-strong text-2xl font-semibold">
                  Marketing Intelligence
                </h1>
                <p className="text-muted-foreground mt-1">
                  Analyze your practice&apos;s online visibility with AI-powered insights
                </p>
              </div>

              <div className="grid gap-6 lg:grid-cols-[400px_1fr]">
                {/* Form */}
                <CardWrapper>
                  <Card>
                    <CardHeader>
                      <CardTitle>Practice Details</CardTitle>
                      <CardDescription>
                        Enter your practice information to analyze visibility
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="practiceName">Practice Name</Label>
                          <Input
                            id="practiceName"
                            placeholder="e.g., Portland Therapy Center"
                            value={formData.practiceName}
                            onChange={(e) =>
                              setFormData((f) => ({
                                ...f,
                                practiceName: e.target.value,
                              }))
                            }
                            required
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="specialty">Specialty</Label>
                          <Select
                            value={formData.specialty}
                            onValueChange={(v) => setFormData((f) => ({ ...f, specialty: v }))}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {SPECIALTIES.map((s) => (
                                <SelectItem key={s} value={s}>
                                  {s}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-2">
                            <Label htmlFor="city">City</Label>
                            <Input
                              id="city"
                              placeholder="Portland"
                              value={formData.city}
                              onChange={(e) =>
                                setFormData((f) => ({
                                  ...f,
                                  city: e.target.value,
                                }))
                              }
                              required
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="state">State</Label>
                            <Select
                              value={formData.state}
                              onValueChange={(v) => setFormData((f) => ({ ...f, state: v }))}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {US_STATES.map((s) => (
                                  <SelectItem key={s} value={s}>
                                    {s}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="zip">ZIP Code</Label>
                          <Input
                            id="zip"
                            placeholder="97205"
                            value={formData.zip}
                            onChange={(e) => setFormData((f) => ({ ...f, zip: e.target.value }))}
                            required
                            maxLength={5}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="websiteUrl">
                            Website URL{" "}
                            <span className="text-muted-foreground font-normal">(optional)</span>
                          </Label>
                          <Input
                            id="websiteUrl"
                            type="url"
                            placeholder="https://www.yourpractice.com"
                            value={formData.websiteUrl}
                            onChange={(e) =>
                              setFormData((f) => ({
                                ...f,
                                websiteUrl: e.target.value,
                              }))
                            }
                          />
                        </div>

                        <Button type="submit" className="w-full" disabled={isLoading}>
                          {isLoading ? (
                            <span className="flex items-center gap-2">
                              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                              Analyzing...
                            </span>
                          ) : (
                            "Analyze Visibility"
                          )}
                        </Button>

                        {error && (
                          <div className="rounded-lg bg-rose-50 p-3 text-sm text-rose-700">
                            {error}
                          </div>
                        )}
                      </form>
                    </CardContent>
                  </Card>
                </CardWrapper>

                {/* Results */}
                <div className="space-y-6">
                  {isLoading && (
                    <CardWrapper>
                      <Card>
                        <CardContent className="py-12">
                          <div className="flex flex-col items-center justify-center gap-4">
                            <div className="border-primary/30 border-t-primary h-12 w-12 animate-spin rounded-full border-4" />
                            <div className="text-center">
                              <div className="font-medium">Analyzing online visibility...</div>
                              <div className="text-muted-foreground text-sm">
                                Searching directories, evaluating AI citability, analyzing
                                competitors
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </CardWrapper>
                  )}

                  {result && !isLoading && (
                    <>
                      {/* Score Overview */}
                      <CardWrapper>
                        <Card>
                          <CardContent className="pt-6">
                            <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
                              <TierBadge tier={result.tier} />
                              <div className="flex-1">
                                <div className="text-foreground-strong text-3xl font-bold">
                                  {result.compositeScore}
                                  <span className="text-muted-foreground text-lg font-normal">
                                    /100
                                  </span>
                                </div>
                                <div className="text-muted-foreground text-sm">
                                  Provider Discovery Score
                                </div>
                              </div>
                              <div className="text-muted-foreground text-sm">
                                Analyzed {new Date(result.analyzedAt).toLocaleString()}
                              </div>
                            </div>

                            <div className="mt-6 rounded-lg bg-gray-50 p-4">
                              <p className="text-foreground text-sm">{result.executiveSummary}</p>
                            </div>

                            <div className="mt-6 grid gap-4 sm:grid-cols-3">
                              <ScoreBar score={result.seo.score} label="SEO" />
                              <ScoreBar score={result.geo.score} label="GEO" />
                              <ScoreBar score={result.aio.score} label="AIO" />
                            </div>

                            <div className="text-muted-foreground mt-4 text-xs">
                              <span className="font-medium">Formula:</span> Composite = (SEO × 40%)
                              + (GEO × 30%) + (AIO × 30%)
                            </div>
                          </CardContent>
                        </Card>
                      </CardWrapper>

                      {/* Details Grid */}
                      <div className="grid gap-6 lg:grid-cols-2">
                        {/* Directories */}
                        <CardWrapper>
                          <Card>
                            <CardContent className="pt-6">
                              <DirectoryList directories={result.seo.directoryPresence} />
                            </CardContent>
                          </Card>
                        </CardWrapper>

                        {/* Competitors */}
                        <CardWrapper>
                          <Card>
                            <CardContent className="pt-6">
                              <CompetitorTable
                                competitors={result.competitors}
                                marketPosition={result.marketPosition}
                              />
                            </CardContent>
                          </Card>
                        </CardWrapper>
                      </div>

                      {/* Recommendations */}
                      <CardWrapper>
                        <Card>
                          <CardContent className="pt-6">
                            <RecommendationList recommendations={result.recommendations} />
                          </CardContent>
                        </Card>
                      </CardWrapper>

                      {/* Detailed Scores */}
                      <CardWrapper>
                        <Card>
                          <CardHeader>
                            <CardTitle>Detailed Score Breakdown</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="grid gap-6 md:grid-cols-3">
                              <div className="space-y-3">
                                <div className="flex items-center gap-2 font-medium">
                                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100 text-sm font-bold text-blue-700">
                                    {result.seo.score}
                                  </span>
                                  SEO - Search Visibility
                                </div>
                                <ul className="text-muted-foreground space-y-1 text-sm">
                                  <li>
                                    • Google Business:{" "}
                                    {result.seo.googleBusinessProfile ? "Found" : "Not Found"}
                                  </li>
                                  <li>• Local Pack: {result.seo.localPackRanking}</li>
                                  <li>• Website Score: {result.seo.websiteOptimization}/100</li>
                                  {result.seo.signals.slice(0, 3).map((s, i) => (
                                    <li key={i}>• {s}</li>
                                  ))}
                                </ul>
                              </div>

                              <div className="space-y-3">
                                <div className="flex items-center gap-2 font-medium">
                                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-cyan-100 text-sm font-bold text-cyan-700">
                                    {result.geo.score}
                                  </span>
                                  GEO - AI Citability
                                </div>
                                <ul className="text-muted-foreground space-y-1 text-sm">
                                  <li>
                                    • AI Citability: {result.geo.aiCitability}
                                    /100
                                  </li>
                                  <li>• Content Structure: {result.geo.contentStructure}/100</li>
                                  <li>
                                    • Authority: {result.geo.authoritySignals}
                                    /100
                                  </li>
                                  {result.geo.signals.slice(0, 3).map((s, i) => (
                                    <li key={i}>• {s}</li>
                                  ))}
                                </ul>
                              </div>

                              <div className="space-y-3">
                                <div className="flex items-center gap-2 font-medium">
                                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-100 text-sm font-bold text-teal-700">
                                    {result.aio.score}
                                  </span>
                                  AIO - AI Overview
                                </div>
                                <ul className="text-muted-foreground space-y-1 text-sm">
                                  <li>• E-E-A-T Score: {result.aio.eeatScore}/100</li>
                                  <li>• Clinical Content: {result.aio.clinicalContent}/100</li>
                                  <li>
                                    • Schema Markup: {result.aio.schemaMarkup}
                                    /100
                                  </li>
                                  {result.aio.signals.slice(0, 3).map((s, i) => (
                                    <li key={i}>• {s}</li>
                                  ))}
                                </ul>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </CardWrapper>
                    </>
                  )}

                  {/* Empty State */}
                  {!result && !isLoading && (
                    <CardWrapper>
                      <Card>
                        <CardContent className="py-12">
                          <div className="flex flex-col items-center justify-center gap-4 text-center">
                            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
                              <svg
                                className="h-8 w-8 text-gray-400"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={1.5}
                                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                                />
                              </svg>
                            </div>
                            <div>
                              <div className="text-foreground-strong font-medium">
                                Ready to analyze
                              </div>
                              <div className="text-muted-foreground max-w-sm text-sm">
                                Enter your practice details and click &quot;Analyze Visibility&quot;
                                to get your Provider Discovery Score
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </CardWrapper>
                  )}
                </div>
              </div>
            </div>
          </PageTransition>
        </main>
      </div>
    </div>
  );
}
