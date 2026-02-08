'use client';

import * as React from 'react';
import { Add01Icon, StarIcon, MoreHorizontalIcon, Delete02Icon, CheckmarkCircle01Icon } from 'hugeicons-react';
import { cn } from '@/design-system/lib/utils';
import { Button } from '@/design-system/components/ui/button';
import { Badge } from '@/design-system/components/ui/badge';
import { Card, CardContent } from '@/design-system/components/ui/card';
import { Text } from '@/design-system/components/ui/typography';
import { Popover, PopoverContent, PopoverTrigger } from '@/design-system/components/ui/popover';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/design-system/components/ui/dropdown-menu';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/design-system/components/ui/command';
import icd10Data from '@/lib/data/icd10-mental-health.json';

export type DiagnosisStatus = 'active' | 'resolved' | 'rule_out';
export interface Diagnosis { id: string; icd10Code: string; description: string; status: DiagnosisStatus; isPrimary: boolean; dateDiagnosed?: string; dateResolved?: string; }
export interface DiagnosisSectionProps { diagnoses: Diagnosis[]; onAdd?: (d: Omit<Diagnosis, 'id'>) => Promise<void>; onUpdate?: (id: string, updates: Partial<Diagnosis>) => Promise<void>; onDelete?: (id: string) => Promise<void>; onSetPrimary?: (id: string) => Promise<void>; isReadOnly?: boolean; className?: string; }
interface ICD10Code { code: string; description: string; category: string; }

export function DiagnosisSection({ diagnoses, onAdd, onUpdate, onDelete, onSetPrimary, isReadOnly = false, className }: DiagnosisSectionProps) {
  const [isAddingOpen, setIsAddingOpen] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);
  const activeDiagnoses = diagnoses.filter(d => d.status === 'active');
  const resolvedDiagnoses = diagnoses.filter(d => d.status === 'resolved');
  const filteredCodes: ICD10Code[] = React.useMemo(() => {
    if (!searchQuery || searchQuery.length < 2) return [];
    const query = searchQuery.toLowerCase();
    return (icd10Data.codes as ICD10Code[]).filter(c => c.code.toLowerCase().includes(query) || c.description.toLowerCase().includes(query)).slice(0, 20);
  }, [searchQuery]);

  const handleSelectCode = async (code: ICD10Code) => {
    if (!onAdd) return;
    setIsLoading(true);
    try { await onAdd({ icd10Code: code.code, description: code.description, status: 'active', isPrimary: activeDiagnoses.length === 0, dateDiagnosed: new Date().toISOString().split('T')[0] }); setIsAddingOpen(false); setSearchQuery(''); } finally { setIsLoading(false); }
  };

  return (
    <div className={cn('space-y-4', className)}>
      <div className="flex items-center justify-between">
        <Text weight="medium" className="text-foreground-strong">Diagnoses</Text>
        {!isReadOnly && (
          <Popover open={isAddingOpen} onOpenChange={setIsAddingOpen}>
            <PopoverTrigger asChild><Button variant="outline" size="sm" className="gap-2"><Add01Icon size={16} />Add Diagnosis</Button></PopoverTrigger>
            <PopoverContent className="w-96 p-0" align="end">
              <Command shouldFilter={false}>
                <CommandInput placeholder="Search ICD-10..." value={searchQuery} onValueChange={setSearchQuery} />
                <CommandList>
                  <CommandEmpty>{searchQuery.length < 2 ? 'Type at least 2 characters' : 'No diagnoses found'}</CommandEmpty>
                  <CommandGroup>
                    {filteredCodes.map(code => (
                      <CommandItem key={code.code} value={code.code} onSelect={() => handleSelectCode(code)} className="flex flex-col items-start gap-1 py-3">
                        <div className="flex w-full items-center justify-between"><Badge variant="outline" className="font-mono">{code.code}</Badge><span className="text-xs text-foreground-muted">{code.category}</span></div>
                        <span className="text-sm">{code.description}</span>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        )}
      </div>
      {activeDiagnoses.length > 0 && <div className="space-y-2">{activeDiagnoses.map(d => <DiagnosisCard key={d.id} diagnosis={d} onSetPrimary={() => onSetPrimary?.(d.id)} onResolve={() => onUpdate?.(d.id, { status: 'resolved', dateResolved: new Date().toISOString().split('T')[0] })} onDelete={() => onDelete?.(d.id)} isReadOnly={isReadOnly} />)}</div>}
      {resolvedDiagnoses.length > 0 && <div className="space-y-2"><Text size="sm" muted className="mt-4">Resolved</Text>{resolvedDiagnoses.map(d => <DiagnosisCard key={d.id} diagnosis={d} onDelete={() => onDelete?.(d.id)} isReadOnly={isReadOnly} />)}</div>}
      {diagnoses.length === 0 && <Card className="border-dashed"><CardContent className="flex flex-col items-center justify-center py-8"><Text size="sm" muted>No diagnoses recorded</Text></CardContent></Card>}
    </div>
  );
}

function DiagnosisCard({ diagnosis, onSetPrimary, onResolve, onDelete, isReadOnly }: { diagnosis: Diagnosis; onSetPrimary?: () => void; onResolve?: () => void; onDelete?: () => void; isReadOnly?: boolean }) {
  return (
    <Card className={cn('transition-colors', diagnosis.status === 'resolved' && 'opacity-60')}>
      <CardContent className="flex items-center gap-3 p-3">
        <button onClick={onSetPrimary} disabled={isReadOnly || diagnosis.isPrimary || diagnosis.status !== 'active'} className={cn('flex h-8 w-8 shrink-0 items-center justify-center rounded-full', diagnosis.isPrimary ? 'bg-warning/20 text-warning' : 'text-foreground-muted hover:bg-surface-secondary')} title={diagnosis.isPrimary ? 'Primary diagnosis' : 'Set as primary'}><StarIcon size={16} className={cn(diagnosis.isPrimary && 'fill-current')} /></button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2"><Badge variant="outline" className="font-mono shrink-0">{diagnosis.icd10Code}</Badge><Badge variant={diagnosis.status === 'active' ? 'default' : 'secondary'} className="shrink-0 text-xs">{diagnosis.status === 'active' ? 'Active' : 'Resolved'}</Badge></div>
          <Text size="sm" className="mt-1 truncate">{diagnosis.description}</Text>
        </div>
        {!isReadOnly && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="h-8 w-8 shrink-0"><MoreHorizontalIcon size={16} /></Button></DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {diagnosis.status === 'active' && <DropdownMenuItem onClick={onResolve}><CheckmarkCircle01Icon size={14} className="mr-2" />Mark Resolved</DropdownMenuItem>}
              <DropdownMenuItem onClick={onDelete} className="text-destructive"><Delete02Icon size={14} className="mr-2" />Delete</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </CardContent>
    </Card>
  );
}
