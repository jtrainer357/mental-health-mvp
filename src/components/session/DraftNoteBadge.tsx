'use client';

import * as React from 'react';
import { NoteIcon, Alert02Icon } from 'hugeicons-react';
import { cn } from '@/design-system/lib/utils';
import { Badge } from '@/design-system/components/ui/badge';
import { Button } from '@/design-system/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/design-system/components/ui/tooltip';
import {
  getDaysSinceSession,
  getDraftWarningLevel,
  type SessionNote,
} from '@/lib/session/types';

export interface DraftNoteBadgeProps {
  draft: SessionNote;
  onResume?: () => void;
  className?: string;
}

/**
 * Draft Note Badge
 * Shows in Patient 360 when there's an unsigned note
 */
export function DraftNoteBadge({
  draft,
  onResume,
  className,
}: DraftNoteBadgeProps) {
  const daysSince = getDaysSinceSession(draft.sessionDate);
  const warningLevel = getDraftWarningLevel(daysSince);

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  const warningStyles = {
    none: 'bg-warning/10 text-warning border-warning/20',
    warning: 'bg-warning/20 text-warning-foreground border-warning/40',
    urgent: 'bg-destructive/10 text-destructive border-destructive/30',
    critical: 'bg-destructive/20 text-destructive border-destructive/50 animate-pulse',
  };

  const warningMessages = {
    none: 'Unsigned note from today',
    warning: `Unsigned note from ${formatDate(draft.sessionDate)} (24+ hours)`,
    urgent: `Unsigned note from ${formatDate(draft.sessionDate)} (48+ hours)`,
    critical: `URGENT: Unsigned note from ${formatDate(draft.sessionDate)} (72+ hours)`,
  };

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          onClick={onResume}
          className={cn(
            'h-auto gap-2 rounded-full border px-3 py-1.5',
            warningStyles[warningLevel],
            'hover:opacity-80',
            className
          )}
        >
          {warningLevel === 'critical' || warningLevel === 'urgent' ? (
            <Alert02Icon size={14} />
          ) : (
            <NoteIcon size={14} />
          )}
          <span className="text-xs font-medium">
            Unsigned note from {formatDate(draft.sessionDate)}
          </span>
        </Button>
      </TooltipTrigger>
      <TooltipContent side="bottom">
        <p>{warningMessages[warningLevel]}</p>
        <p className="mt-1 text-xs text-foreground-muted">
          Click to resume editing
        </p>
      </TooltipContent>
    </Tooltip>
  );
}

/**
 * Multiple draft notes indicator
 */
export function DraftNotesIndicator({
  drafts,
  onViewDrafts,
  className,
}: {
  drafts: SessionNote[];
  onViewDrafts?: () => void;
  className?: string;
}) {
  if (drafts.length === 0) return null;

  // Get the most urgent draft
  const mostUrgent = drafts.reduce((urgent, draft) => {
    const days = getDaysSinceSession(draft.sessionDate);
    const urgentDays = getDaysSinceSession(urgent.sessionDate);
    return days > urgentDays ? draft : urgent;
  }, drafts[0]);

  const warningLevel = getDraftWarningLevel(
    getDaysSinceSession(mostUrgent.sessionDate)
  );

  if (drafts.length === 1) {
    return <DraftNoteBadge draft={drafts[0]} onResume={onViewDrafts} />;
  }

  const badgeVariants = {
    none: 'secondary' as const,
    warning: 'secondary' as const,
    urgent: 'destructive' as const,
    critical: 'destructive' as const,
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={onViewDrafts}
      className={cn(
        'h-auto gap-2 px-3 py-1.5',
        warningLevel === 'critical' && 'animate-pulse',
        className
      )}
    >
      <NoteIcon size={14} />
      <Badge variant={badgeVariants[warningLevel]} className="text-xs">
        {drafts.length} unsigned notes
      </Badge>
    </Button>
  );
}
