'use client';

import * as React from 'react';
import { Add01Icon, Pill01Icon, MoreHorizontalIcon, Cancel01Icon, Calendar01Icon } from 'hugeicons-react';
import { cn } from '@/design-system/lib/utils';
import { Button } from '@/design-system/components/ui/button';
import { Input } from '@/design-system/components/ui/input';
import { Badge } from '@/design-system/components/ui/badge';
import { Card, CardContent } from '@/design-system/components/ui/card';
import { Text } from '@/design-system/components/ui/typography';
import { Label } from '@/design-system/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/design-system/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/design-system/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/design-system/components/ui/dropdown-menu';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/design-system/components/ui/collapsible';
import { Textarea } from '@/design-system/components/ui/textarea';

export interface Medication { id: string; name: string; dosage?: string; frequency?: string; prescribingProvider?: string; startDate?: string; endDate?: string; discontinuedReason?: string; nextRefillDate?: string; }
export interface MedicationSectionProps { medications: Medication[]; onAdd?: (m: Omit<Medication, 'id'>) => Promise<void>; onDiscontinue?: (id: string, reason?: string) => Promise<void>; isReadOnly?: boolean; className?: string; }
const FREQUENCY_OPTIONS = [{ value: 'daily', label: 'Daily' }, { value: 'twice_daily', label: 'Twice daily' }, { value: 'three_times_daily', label: 'Three times daily' }, { value: 'as_needed', label: 'As needed (PRN)' }, { value: 'weekly', label: 'Weekly' }];

export function MedicationSection({ medications, onAdd, onDiscontinue, isReadOnly = false, className }: MedicationSectionProps) {
  const [isAddDialogOpen, setIsAddDialogOpen] = React.useState(false);
  const [isDiscontinueDialogOpen, setIsDiscontinueDialogOpen] = React.useState(false);
  const [selectedMedication, setSelectedMedication] = React.useState<Medication | null>(null);
  const [showPastMedications, setShowPastMedications] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const activeMedications = medications.filter(m => !m.endDate);
  const pastMedications = medications.filter(m => m.endDate);

  const handleAddMedication = async (data: Omit<Medication, 'id'>) => { if (!onAdd) return; setIsLoading(true); try { await onAdd(data); setIsAddDialogOpen(false); } finally { setIsLoading(false); } };
  const handleDiscontinue = async (reason?: string) => { if (!selectedMedication || !onDiscontinue) return; setIsLoading(true); try { await onDiscontinue(selectedMedication.id, reason); setIsDiscontinueDialogOpen(false); setSelectedMedication(null); } finally { setIsLoading(false); } };
  const formatFreq = (f?: string) => FREQUENCY_OPTIONS.find(o => o.value === f)?.label || f || '';

  return (
    <div className={cn('space-y-4', className)}>
      <div className="flex items-center justify-between">
        <Text weight="medium" className="text-foreground-strong">Medications</Text>
        {!isReadOnly && <Button variant="outline" size="sm" onClick={() => setIsAddDialogOpen(true)} className="gap-2"><Add01Icon size={16} />Add Medication</Button>}
      </div>
      {activeMedications.length > 0 && <div className="space-y-2">{activeMedications.map(m => <MedicationCard key={m.id} medication={m} onDiscontinue={() => { setSelectedMedication(m); setIsDiscontinueDialogOpen(true); }} isReadOnly={isReadOnly} />)}</div>}
      {activeMedications.length === 0 && <Card className="border-dashed"><CardContent className="flex flex-col items-center justify-center py-8"><Pill01Icon size={24} className="text-foreground-muted" /><Text size="sm" muted className="mt-2">No active medications</Text></CardContent></Card>}
      {pastMedications.length > 0 && (
        <Collapsible open={showPastMedications} onOpenChange={setShowPastMedications}>
          <CollapsibleTrigger asChild><Button variant="ghost" size="sm" className="gap-2">{showPastMedications ? 'Hide' : 'Show'} Past Medications ({pastMedications.length})</Button></CollapsibleTrigger>
          <CollapsibleContent className="mt-2 space-y-2">{pastMedications.map(m => <MedicationCard key={m.id} medication={m} isPast isReadOnly={isReadOnly} />)}</CollapsibleContent>
        </Collapsible>
      )}
      <AddMedicationDialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen} onAdd={handleAddMedication} isLoading={isLoading} />
      <DiscontinueMedicationDialog open={isDiscontinueDialogOpen} onOpenChange={setIsDiscontinueDialogOpen} medication={selectedMedication} onDiscontinue={handleDiscontinue} isLoading={isLoading} />
    </div>
  );
}

function MedicationCard({ medication, isPast = false, onDiscontinue, isReadOnly }: { medication: Medication; isPast?: boolean; onDiscontinue?: () => void; isReadOnly?: boolean }) {
  const formatFreq = (f?: string) => FREQUENCY_OPTIONS.find(o => o.value === f)?.label || f || '';
  return (
    <Card className={cn('transition-colors', isPast && 'opacity-60')}>
      <CardContent className="flex items-center gap-3 p-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-surface-secondary"><Pill01Icon size={20} className="text-foreground-muted" /></div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2"><Text weight="medium" className="truncate">{medication.name}</Text>{medication.dosage && <Badge variant="outline" className="shrink-0">{medication.dosage}</Badge>}{isPast && <Badge variant="secondary" className="shrink-0 text-xs">Discontinued</Badge>}</div>
          <div className="flex items-center gap-2 mt-0.5">{medication.frequency && <Text size="sm" muted>{formatFreq(medication.frequency)}</Text>}{medication.prescribingProvider && <><span className="text-foreground-muted">•</span><Text size="sm" muted>Rx: {medication.prescribingProvider}</Text></>}</div>
          {medication.nextRefillDate && !isPast && <div className="flex items-center gap-1 mt-1"><Calendar01Icon size={12} className="text-foreground-muted" /><Text size="xs" muted>Next refill: {new Date(medication.nextRefillDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</Text></div>}
        </div>
        {!isReadOnly && !isPast && (
          <DropdownMenu><DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="h-8 w-8 shrink-0"><MoreHorizontalIcon size={16} /></Button></DropdownMenuTrigger><DropdownMenuContent align="end"><DropdownMenuItem onClick={onDiscontinue} className="text-destructive"><Cancel01Icon size={14} className="mr-2" />Discontinue</DropdownMenuItem></DropdownMenuContent></DropdownMenu>
        )}
      </CardContent>
    </Card>
  );
}

function AddMedicationDialog({ open, onOpenChange, onAdd, isLoading }: { open: boolean; onOpenChange: (o: boolean) => void; onAdd: (d: Omit<Medication, 'id'>) => Promise<void>; isLoading: boolean }) {
  const [formData, setFormData] = React.useState<Omit<Medication, 'id'>>({ name: '', dosage: '', frequency: 'daily', prescribingProvider: '', startDate: new Date().toISOString().split('T')[0] });
  const handleSubmit = async (e: React.FormEvent) => { e.preventDefault(); if (!formData.name) return; await onAdd(formData); setFormData({ name: '', dosage: '', frequency: 'daily', prescribingProvider: '', startDate: new Date().toISOString().split('T')[0] }); };
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md"><DialogHeader><DialogTitle>Add Medication</DialogTitle></DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2"><Label htmlFor="name">Medication Name *</Label><Input id="name" value={formData.name} onChange={e => setFormData(p => ({ ...p, name: e.target.value }))} placeholder="e.g., Sertraline" required /></div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2"><Label htmlFor="dosage">Dosage</Label><Input id="dosage" value={formData.dosage} onChange={e => setFormData(p => ({ ...p, dosage: e.target.value }))} placeholder="e.g., 50mg" /></div>
            <div className="space-y-2"><Label htmlFor="frequency">Frequency</Label><Select value={formData.frequency} onValueChange={v => setFormData(p => ({ ...p, frequency: v }))}><SelectTrigger id="frequency"><SelectValue /></SelectTrigger><SelectContent>{FREQUENCY_OPTIONS.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}</SelectContent></Select></div>
          </div>
          <div className="space-y-2"><Label htmlFor="provider">Prescribing Provider</Label><Input id="provider" value={formData.prescribingProvider} onChange={e => setFormData(p => ({ ...p, prescribingProvider: e.target.value }))} placeholder="e.g., Dr. Smith" /></div>
          <DialogFooter><Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>Cancel</Button><Button type="submit" disabled={!formData.name || isLoading}>{isLoading ? 'Adding...' : 'Add Medication'}</Button></DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function DiscontinueMedicationDialog({ open, onOpenChange, medication, onDiscontinue, isLoading }: { open: boolean; onOpenChange: (o: boolean) => void; medication: Medication | null; onDiscontinue: (r?: string) => Promise<void>; isLoading: boolean }) {
  const [reason, setReason] = React.useState('');
  const handleSubmit = async (e: React.FormEvent) => { e.preventDefault(); await onDiscontinue(reason || undefined); setReason(''); };
  if (!medication) return null;
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md"><DialogHeader><DialogTitle>Discontinue Medication</DialogTitle><DialogDescription>Are you sure you want to discontinue {medication.name}?</DialogDescription></DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2"><Label htmlFor="reason">Reason (optional)</Label><Textarea id="reason" value={reason} onChange={e => setReason(e.target.value)} placeholder="e.g., Switched to alternative" rows={3} /></div>
          <DialogFooter><Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>Cancel</Button><Button type="submit" variant="destructive" disabled={isLoading}>{isLoading ? 'Discontinuing...' : 'Discontinue'}</Button></DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
