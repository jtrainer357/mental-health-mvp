'use client';

import * as React from 'react';
import { NoteIcon, Alert02Icon } from 'hugeicons-react';
import { cn } from '@/design-system/lib/utils';
import { Badge } from '@/design-system/components/ui/badge';
import { Button } from '@/design-system/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/design-system/components/ui/tooltip';
import { getDaysSinceSession, getDraftWarningLevel, type SessionNote } from '@/lib/session/types';

export interface DraftNoteBadgeProps { draft: SessionNote; onResume?: () => void; className?: string; }

export function DraftNoteBadge({ draft, onResume, className }: DraftNoteBadgeProps) {
  const daysSince = getDaysSinceSession(draft.sessionDate);
  const warningLevel = getDraftWarningLevel(daysSince);
  const formatDate = (dateStr: string) => new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  const warningStyles = { none: 'bg-warning/10 text-warning border-warning/20', warning: 'bg-warning/20 text-warning-foreground border-warning/40', urgent: 'bg-destructive/10 text-destructive border-destructive/30', critical: 'bg-destructive/20 text-destructive border-destructive/50 animate-pulse' };
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button variant="ghost" size="sm" onClick={onResume} className={cn('h-auto gap-2 rounded-full border px-3 py-1.5', warningStyles[warningLevel], 'hover:opacity-80', className)}>
          {warningLevel === 'critical' || warningLevel === 'urgent' ? <Alert02Icon size={14} /> : <NoteIcon size={14} />}
          <span className="text-xs font-medium">Unsigned note from {formatDate(draft.sessionDate)}</span>
        </Button>
      </TooltipTrigger>
      <TooltipContent side="bottom"><p>Click to resume editing</p></TooltipContent>
    </Tooltip>
  );
}

export function DraftNotesIndicator({ drafts, onViewDrafts, className }: { drafts: SessionNote[]; onViewDrafts?: () => void; className?: string }) {
  if (drafts.length === 0) return null;
  if (drafts.length === 1) return <DraftNoteBadge draft={drafts[0]} onResume={onViewDrafts} />;
  const mostUrgent = drafts.reduce((u, d) => getDaysSinceSession(d.sessionDate) > getDaysSinceSession(u.sessionDate) ? d : u, drafts[0]);
  const warningLevel = getDraftWarningLevel(getDaysSinceSession(mostUrgent.sessionDate));
  return <Button variant="ghost" size="sm" onClick={onViewDrafts} className={cn('h-auto gap-2 px-3 py-1.5', warningLevel === 'critical' && 'animate-pulse', className)}><NoteIcon size={14} /><Badge variant={warningLevel === 'urgent' || warningLevel === 'critical' ? 'destructive' : 'secondary'} className="text-xs">{drafts.length} unsigned notes</Badge></Button>;
}
