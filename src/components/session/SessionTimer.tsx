'use client';

import * as React from 'react';
import { Clock01Icon, PauseIcon, PlayIcon, StopIcon } from 'hugeicons-react';
import { cn } from '@/design-system/lib/utils';
import { Badge } from '@/design-system/components/ui/badge';
import { Button } from '@/design-system/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/design-system/components/ui/dropdown-menu';
import { type UseSessionTimerReturn } from '@/lib/session/use-session-timer';
import { getSuggestedCPTCode, CPT_CODES, type CPTCode, type NoteType } from '@/lib/session/types';

export interface SessionTimerProps {
  timer: UseSessionTimerReturn;
  noteType?: NoteType;
  selectedCPTCode?: string;
  onCPTCodeChange?: (code: string) => void;
  className?: string;
  showControls?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export function SessionTimer({ timer, noteType = 'progress_note', selectedCPTCode, onCPTCodeChange, className, showControls = true, size = 'md' }: SessionTimerProps) {
  const suggestedCPT = getSuggestedCPTCode(timer.elapsedMinutes, noteType);
  const activeCPT = selectedCPTCode ? CPT_CODES.find(c => c.code === selectedCPTCode) : suggestedCPT;
  const handleSelectCPT = (code: CPTCode) => onCPTCodeChange?.(code.code);
  const sizeClasses = { sm: 'text-lg', md: 'text-2xl', lg: 'text-4xl' };
  const iconSizes = { sm: 16, md: 20, lg: 28 };

  return (
    <div className={cn('flex items-center gap-3', className)}>
      <div className="flex items-center gap-2">
        <Clock01Icon size={iconSizes[size]} className={cn('transition-colors', timer.isRunning ? 'text-accent animate-pulse' : 'text-foreground-muted')} />
        <span className={cn('font-mono font-semibold tabular-nums', sizeClasses[size], timer.isRunning ? 'text-foreground-strong' : 'text-foreground-muted')} role="timer" aria-live="polite">{timer.formattedTime}</span>
      </div>
      {showControls && (
        <div className="flex items-center gap-1">
          {!timer.isRunning && !timer.startTime && <Button variant="outline" size="sm" onClick={timer.start} className="min-h-[44px] gap-2"><PlayIcon size={16} />Start</Button>}
          {timer.isRunning && (<><Button variant="outline" size="icon" onClick={timer.pause} className="min-h-[44px] min-w-[44px]"><PauseIcon size={16} /></Button><Button variant="default" size="sm" onClick={timer.stop} className="min-h-[44px] gap-2 bg-accent hover:bg-accent/90"><StopIcon size={16} />End Session</Button></>)}
          {!timer.isRunning && timer.startTime && !timer.endTime && <Button variant="outline" size="sm" onClick={timer.resume} className="min-h-[44px] gap-2"><PlayIcon size={16} />Resume</Button>}
        </div>
      )}
      {timer.elapsedMinutes >= 16 && activeCPT && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-auto p-0"><Badge variant={selectedCPTCode ? 'default' : 'secondary'} className={cn('cursor-pointer transition-colors hover:bg-primary/80', !selectedCPTCode && 'animate-pulse')}>{activeCPT.code}{!selectedCPTCode && <span className="ml-1 text-xs opacity-75">(suggested)</span>}</Badge></Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            {CPT_CODES.filter(c => noteType === 'crisis_note' ? ['90839', '90840'].includes(c.code) : noteType === 'initial_evaluation' ? ['90791', '90792'].includes(c.code) : ['90832', '90834', '90837', '90836'].includes(c.code)).map(code => (
              <DropdownMenuItem key={code.code} onClick={() => handleSelectCPT(code)} className={cn('flex flex-col items-start gap-1 py-3', activeCPT?.code === code.code && 'bg-primary/10')}>
                <div className="flex w-full items-center justify-between"><span className="font-semibold">{code.code}</span><span className="text-sm text-foreground-muted">${code.fee}</span></div>
                <span className="text-sm text-foreground-muted">{code.description}</span>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      )}
      {timer.elapsedMinutes > 0 && timer.elapsedMinutes < 16 && <Badge variant="outline" className="text-foreground-muted">{16 - timer.elapsedMinutes}min to billable</Badge>}
    </div>
  );
}
