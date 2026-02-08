'use client';

import * as React from 'react';
import {
  Add01Icon,
  ArrowUp01Icon,
  ArrowDown01Icon,
  ArrowRight01Icon,
  Calendar01Icon,
  ChartLineData01Icon,
} from 'hugeicons-react';
import { cn } from '@/design-system/lib/utils';
import { Button } from '@/design-system/components/ui/button';
import { Input } from '@/design-system/components/ui/input';
import { Badge } from '@/design-system/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/design-system/components/ui/card';
import { Text } from '@/design-system/components/ui/typography';
import { Label } from '@/design-system/components/ui/label';
import { Textarea } from '@/design-system/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/design-system/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/design-system/components/ui/dialog';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/design-system/components/ui/popover';

export interface OutcomeScore {
  id: string;
  measureType: 'PHQ-9' | 'GAD-7' | 'PCL-5';
  score: number;
  maxScore: number;
  measurementDate: string;
  contextNotes?: string;
  severity: string;
  nextAssessmentDate?: string;
}

export interface OutcomeMeasureSectionProps {
  phq9Scores: OutcomeScore[];
  gad7Scores: OutcomeScore[];
  pcl5Scores: OutcomeScore[];
  onAddScore?: (score: Omit<OutcomeScore, 'id' | 'severity'>) => Promise<void>;
  onScheduleAssessment?: (measureType: string, date: string) => Promise<void>;
  isReadOnly?: boolean;
  className?: string;
}

// Severity configuration
const SEVERITY_CONFIG = {
  'PHQ-9': {
    maxScore: 27,
    bands: [
      { min: 0, max: 4, label: 'None', color: 'success' },
      { min: 5, max: 9, label: 'Mild', color: 'warning-light' },
      { min: 10, max: 14, label: 'Moderate', color: 'warning' },
      { min: 15, max: 19, label: 'Mod-Severe', color: 'destructive-light' },
      { min: 20, max: 27, label: 'Severe', color: 'destructive' },
    ],
  },
  'GAD-7': {
    maxScore: 21,
    bands: [
      { min: 0, max: 4, label: 'None', color: 'success' },
      { min: 5, max: 9, label: 'Mild', color: 'warning-light' },
      { min: 10, max: 14, label: 'Moderate', color: 'warning' },
      { min: 15, max: 21, label: 'Severe', color: 'destructive' },
    ],
  },
  'PCL-5': {
    maxScore: 80,
    bands: [
      { min: 0, max: 31, label: 'Below threshold', color: 'success' },
      { min: 32, max: 80, label: 'Above threshold', color: 'destructive' },
    ],
  },
};

/**
 * Get severity info for a score
 */
function getSeverityInfo(measureType: 'PHQ-9' | 'GAD-7' | 'PCL-5', score: number) {
  const config = SEVERITY_CONFIG[measureType];
  const band = config.bands.find(b => score >= b.min && score <= b.max);
  return band || { label: 'Unknown', color: 'secondary' };
}

/**
 * Get trend from last two scores
 */
function getTrend(scores: OutcomeScore[]): 'improving' | 'worsening' | 'stable' | null {
  if (scores.length < 2) return null;

  const latest = scores[0].score;
  const previous = scores[1].score;
  const diff = latest - previous;

  if (Math.abs(diff) <= 2) return 'stable';
  return diff > 0 ? 'worsening' : 'improving';
}

/**
 * Outcome Measure Section Component
 * Displays PHQ-9, GAD-7, and PCL-5 scores with charts and severity bands
 */
export function OutcomeMeasureSection({
  phq9Scores,
  gad7Scores,
  pcl5Scores,
  onAddScore,
  onScheduleAssessment,
  isReadOnly = false,
  className,
}: OutcomeMeasureSectionProps) {
  const [isAddDialogOpen, setIsAddDialogOpen] = React.useState(false);
  const [selectedMeasure, setSelectedMeasure] = React.useState<'PHQ-9' | 'GAD-7' | 'PCL-5'>('PHQ-9');
  const [isLoading, setIsLoading] = React.useState(false);

  const openAddDialog = (measureType: 'PHQ-9' | 'GAD-7' | 'PCL-5') => {
    setSelectedMeasure(measureType);
    setIsAddDialogOpen(true);
  };

  const handleAddScore = async (data: Omit<OutcomeScore, 'id' | 'severity'>) => {
    if (!onAddScore) return;
    setIsLoading(true);
    try {
      await onAddScore(data);
      setIsAddDialogOpen(false);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={cn('space-y-6', className)}>
      {/* Section Header */}
      <div className="flex items-center justify-between">
        <Text weight="medium" className="text-foreground-strong">
          Outcome Measures
        </Text>
      </div>

      {/* Measure Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <MeasureCard
          title="PHQ-9"
          description="Depression"
          scores={phq9Scores}
          onAddScore={() => openAddDialog('PHQ-9')}
          onScheduleAssessment={onScheduleAssessment}
          isReadOnly={isReadOnly}
        />
        <MeasureCard
          title="GAD-7"
          description="Anxiety"
          scores={gad7Scores}
          onAddScore={() => openAddDialog('GAD-7')}
          onScheduleAssessment={onScheduleAssessment}
          isReadOnly={isReadOnly}
        />
        <MeasureCard
          title="PCL-5"
          description="PTSD"
          scores={pcl5Scores}
          onAddScore={() => openAddDialog('PCL-5')}
          onScheduleAssessment={onScheduleAssessment}
          isReadOnly={isReadOnly}
        />
      </div>

      {/* Add Score Dialog */}
      <AddScoreDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        measureType={selectedMeasure}
        onAdd={handleAddScore}
        isLoading={isLoading}
      />
    </div>
  );
}

/**
 * Individual Measure Card
 */
function MeasureCard({
  title,
  description,
  scores,
  onAddScore,
  onScheduleAssessment,
  isReadOnly,
}: {
  title: 'PHQ-9' | 'GAD-7' | 'PCL-5';
  description: string;
  scores: OutcomeScore[];
  onAddScore: () => void;
  onScheduleAssessment?: (measureType: string, date: string) => Promise<void>;
  isReadOnly: boolean;
}) {
  const latestScore = scores[0];
  const trend = getTrend(scores);
  const config = SEVERITY_CONFIG[title];

  const severityInfo = latestScore
    ? getSeverityInfo(title, latestScore.score)
    : null;

  const severityColors: Record<string, string> = {
    success: 'bg-success/20 text-success border-success/30',
    'warning-light': 'bg-warning/10 text-warning border-warning/20',
    warning: 'bg-warning/20 text-warning border-warning/30',
    'destructive-light': 'bg-destructive/10 text-destructive border-destructive/20',
    destructive: 'bg-destructive/20 text-destructive border-destructive/30',
    secondary: 'bg-surface-secondary text-foreground-muted border-border',
  };

  const TrendIcon =
    trend === 'improving'
      ? ArrowDown01Icon
      : trend === 'worsening'
      ? ArrowUp01Icon
      : ArrowRight01Icon;

  const trendColors = {
    improving: 'text-success',
    worsening: 'text-destructive',
    stable: 'text-foreground-muted',
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg">{title}</CardTitle>
            <Text size="sm" muted>
              {description}
            </Text>
          </div>
          {!isReadOnly && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onAddScore}
              className="h-8 w-8"
              title="Record new score"
            >
              <Add01Icon size={16} />
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {latestScore ? (
          <>
            {/* Current Score */}
            <div className="flex items-center justify-between">
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold">{latestScore.score}</span>
                <span className="text-foreground-muted">
                  / {config.maxScore}
                </span>
              </div>
              {trend && (
                <div
                  className={cn('flex items-center gap-1', trendColors[trend])}
                  title={
                    trend === 'improving'
                      ? 'Improving'
                      : trend === 'worsening'
                      ? 'Worsening'
                      : 'Stable'
                  }
                >
                  <TrendIcon size={16} />
                  <span className="text-xs capitalize">{trend}</span>
                </div>
              )}
            </div>

            {/* Severity Badge */}
            {severityInfo && (
              <Badge
                className={cn(
                  'border',
                  severityColors[severityInfo.color]
                )}
              >
                {severityInfo.label}
              </Badge>
            )}

            {/* Severity Band Visualization */}
            <div className="space-y-1">
              <div className="flex h-2 overflow-hidden rounded-full bg-surface-secondary">
                {config.bands.map((band, index) => {
                  const width =
                    ((band.max - band.min + 1) / (config.maxScore + 1)) * 100;
                  const isActive =
                    latestScore.score >= band.min && latestScore.score <= band.max;

                  return (
                    <div
                      key={index}
                      className={cn(
                        'h-full transition-opacity',
                        band.color === 'success' && 'bg-success',
                        band.color === 'warning-light' && 'bg-warning/50',
                        band.color === 'warning' && 'bg-warning',
                        band.color === 'destructive-light' && 'bg-destructive/50',
                        band.color === 'destructive' && 'bg-destructive',
                        !isActive && 'opacity-30'
                      )}
                      style={{ width: `${width}%` }}
                      title={`${band.label}: ${band.min}-${band.max}`}
                    />
                  );
                })}
              </div>
              <div className="flex justify-between text-xs text-foreground-muted">
                <span>0</span>
                <span>{config.maxScore}</span>
              </div>
            </div>

            {/* Last measured date */}
            <Text size="xs" muted>
              Last measured:{' '}
              {new Date(latestScore.measurementDate).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              })}
            </Text>

            {/* History preview */}
            {scores.length > 1 && (
              <div className="flex items-center gap-1">
                <ChartLineData01Icon size={14} className="text-foreground-muted" />
                <Text size="xs" muted>
                  {scores.length} assessments recorded
                </Text>
              </div>
            )}
          </>
        ) : (
          <div className="py-4 text-center">
            <Text size="sm" muted>
              No scores recorded
            </Text>
            {!isReadOnly && (
              <Button
                variant="link"
                size="sm"
                onClick={onAddScore}
                className="mt-2"
              >
                Record first score
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

/**
 * Add Score Dialog
 */
function AddScoreDialog({
  open,
  onOpenChange,
  measureType,
  onAdd,
  isLoading,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  measureType: 'PHQ-9' | 'GAD-7' | 'PCL-5';
  onAdd: (data: Omit<OutcomeScore, 'id' | 'severity'>) => Promise<void>;
  isLoading: boolean;
}) {
  const config = SEVERITY_CONFIG[measureType];
  const [score, setScore] = React.useState('');
  const [measurementDate, setMeasurementDate] = React.useState(
    new Date().toISOString().split('T')[0]
  );
  const [contextNotes, setContextNotes] = React.useState('');
  const [nextAssessmentDate, setNextAssessmentDate] = React.useState('');

  const parsedScore = parseInt(score, 10);
  const isValidScore =
    !isNaN(parsedScore) && parsedScore >= 0 && parsedScore <= config.maxScore;

  const severityPreview = isValidScore
    ? getSeverityInfo(measureType, parsedScore)
    : null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValidScore) return;

    await onAdd({
      measureType,
      score: parsedScore,
      maxScore: config.maxScore,
      measurementDate,
      contextNotes: contextNotes || undefined,
      nextAssessmentDate: nextAssessmentDate || undefined,
    });

    // Reset form
    setScore('');
    setContextNotes('');
    setNextAssessmentDate('');
    setMeasurementDate(new Date().toISOString().split('T')[0]);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Record {measureType} Score</DialogTitle>
          <DialogDescription>
            Enter the patient's {measureType} score from the assessment.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="score">Score (0-{config.maxScore}) *</Label>
            <Input
              id="score"
              type="number"
              min="0"
              max={config.maxScore}
              value={score}
              onChange={e => setScore(e.target.value)}
              placeholder={`0-${config.maxScore}`}
              required
            />
            {severityPreview && (
              <Text size="sm" className="text-foreground-muted">
                Severity: <span className="font-medium">{severityPreview.label}</span>
              </Text>
            )}
          </div>

          {/* Severity reference */}
          <div className="rounded-lg bg-surface-secondary p-3">
            <Text size="xs" weight="medium" className="mb-2">
              Severity Interpretation:
            </Text>
            <div className="space-y-1">
              {config.bands.map((band, index) => (
                <div key={index} className="flex justify-between text-xs">
                  <span>{band.label}</span>
                  <span className="text-foreground-muted">
                    {band.min}-{band.max}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="date">Assessment Date</Label>
            <Input
              id="date"
              type="date"
              value={measurementDate}
              onChange={e => setMeasurementDate(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Context Notes (optional)</Label>
            <Textarea
              id="notes"
              value={contextNotes}
              onChange={e => setContextNotes(e.target.value)}
              placeholder="Any relevant context about this assessment..."
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="nextDate">Schedule Next Assessment (optional)</Label>
            <Input
              id="nextDate"
              type="date"
              value={nextAssessmentDate}
              onChange={e => setNextAssessmentDate(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={!isValidScore || isLoading}>
              {isLoading ? 'Saving...' : 'Save Score'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
