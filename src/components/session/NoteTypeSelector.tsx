'use client';

import * as React from 'react';
import { NoteIcon, UserAccountIcon, Alert02Icon, CheckmarkCircle01Icon } from 'hugeicons-react';
import { cn } from '@/design-system/lib/utils';
import { Card, CardContent } from '@/design-system/components/ui/card';
import { Text } from '@/design-system/components/ui/typography';
import { type NoteType } from '@/lib/session/types';

export interface NoteTypeSelectorProps { value: NoteType; onChange: (type: NoteType) => void; disabled?: boolean; className?: string; }

const NOTE_TYPE_OPTIONS = [
  { type: 'progress_note' as NoteType, icon: NoteIcon, name: 'Progress Note', description: 'Standard SOAP format', sections: ['Subjective', 'Objective', 'Assessment', 'Plan'] },
  { type: 'initial_evaluation' as NoteType, icon: UserAccountIcon, name: 'Initial Evaluation', description: 'Comprehensive intake', sections: ['Chief Complaint', 'HPI', 'Psychiatric History', 'MSE', 'Assessment'] },
  { type: 'crisis_note' as NoteType, icon: Alert02Icon, name: 'Crisis Note', description: 'Safety assessment required', sections: ['Crisis Presentation', 'Safety Assessment', 'Risk Level', 'Safety Plan'] },
];

export function NoteTypeSelector({ value, onChange, disabled = false, className }: NoteTypeSelectorProps) {
  return (
    <div className={cn('space-y-4', className)}>
      <Text size="lg" weight="medium" className="text-foreground-strong">Select Session Type</Text>
      <div className="grid gap-4 sm:grid-cols-3">
        {NOTE_TYPE_OPTIONS.map(option => {
          const Icon = option.icon;
          const isSelected = value === option.type;
          return (
            <Card key={option.type} className={cn('relative cursor-pointer transition-all hover:border-primary/50 hover:shadow-md', isSelected && 'border-primary ring-2 ring-primary/20', disabled && 'cursor-not-allowed opacity-50')} onClick={() => !disabled && onChange(option.type)} role="radio" aria-checked={isSelected} tabIndex={disabled ? -1 : 0}>
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className={cn('flex h-10 w-10 items-center justify-center rounded-lg', isSelected ? 'bg-primary text-primary-foreground' : 'bg-surface-secondary text-foreground-muted')}><Icon size={20} /></div>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between"><Text weight="medium" className="text-foreground-strong">{option.name}</Text>{isSelected && <CheckmarkCircle01Icon size={18} className="text-primary" />}</div>
                    <Text size="sm" muted>{option.description}</Text>
                  </div>
                </div>
                <div className="mt-3 flex flex-wrap gap-1">{option.sections.slice(0, 3).map(s => <span key={s} className={cn('rounded-full px-2 py-0.5 text-xs', isSelected ? 'bg-primary/10 text-primary' : 'bg-surface-secondary text-foreground-muted')}>{s}</span>)}</div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

export function NoteTypeBadge({ type, className }: { type: NoteType; className?: string }) {
  const option = NOTE_TYPE_OPTIONS.find(o => o.type === type);
  if (!option) return null;
  const Icon = option.icon;
  return <div className={cn('inline-flex items-center gap-1.5 rounded-full bg-surface-secondary px-3 py-1', className)}><Icon size={14} className="text-foreground-muted" /><span className="text-sm text-foreground">{option.name}</span></div>;
}
