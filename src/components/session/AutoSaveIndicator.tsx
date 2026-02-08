'use client';

import * as React from 'react';
import { CheckmarkCircle01Icon, Loading01Icon, Alert02Icon, CloudSavingIcon } from 'hugeicons-react';
import { cn } from '@/design-system/lib/utils';
import { Button } from '@/design-system/components/ui/button';
import { type AutoSaveStatus } from '@/lib/session/use-auto-save';

export interface AutoSaveIndicatorProps { status: AutoSaveStatus; lastSavedAgo?: string; error?: string | null; onManualSave?: () => void; className?: string; }

export function AutoSaveIndicator({ status, lastSavedAgo, error, onManualSave, className }: AutoSaveIndicatorProps) {
  const statusConfig = {
    idle: { icon: CloudSavingIcon, text: 'Ready', className: 'text-foreground-muted', animate: false },
    pending: { icon: CloudSavingIcon, text: 'Unsaved changes', className: 'text-warning', animate: false },
    saving: { icon: Loading01Icon, text: 'Saving...', className: 'text-primary', animate: true },
    saved: { icon: CheckmarkCircle01Icon, text: lastSavedAgo ? `Saved ${lastSavedAgo}` : 'Saved', className: 'text-success', animate: false },
    error: { icon: Alert02Icon, text: error || 'Save failed', className: 'text-destructive', animate: false },
  };
  const config = statusConfig[status];
  const Icon = config.icon;
  return (
    <div className={cn('flex items-center gap-2 text-sm transition-colors', config.className, className)} role="status" aria-live="polite">
      <Icon size={16} className={cn(config.animate && 'animate-spin')} /><span>{config.text}</span>
      {(status === 'pending' || status === 'error') && onManualSave && <Button variant="ghost" size="sm" onClick={onManualSave} className="h-6 px-2 text-xs">Save now</Button>}
    </div>
  );
}

export function AutoSaveIndicatorCompact({ status, className }: { status: AutoSaveStatus; className?: string }) {
  const iconConfig = { idle: { icon: CloudSavingIcon, className: 'text-foreground-muted' }, pending: { icon: CloudSavingIcon, className: 'text-warning' }, saving: { icon: Loading01Icon, className: 'text-primary animate-spin' }, saved: { icon: CheckmarkCircle01Icon, className: 'text-success' }, error: { icon: Alert02Icon, className: 'text-destructive' } };
  const config = iconConfig[status];
  const Icon = config.icon;
  const labels = { idle: 'Ready', pending: 'Unsaved changes', saving: 'Saving...', saved: 'Saved', error: 'Save failed' };
  return <div className={cn('flex items-center', className)} title={labels[status]} role="status"><Icon size={18} className={config.className} /></div>;
}
