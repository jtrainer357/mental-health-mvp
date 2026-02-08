'use client';

import * as React from 'react';
import { LockIcon, Alert02Icon, SecurityCheckIcon } from 'hugeicons-react';
import { cn } from '@/design-system/lib/utils';
import { Button } from '@/design-system/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/design-system/components/ui/dialog';
import { Text } from '@/design-system/components/ui/typography';
import { isLateEntry, type SessionNote } from '@/lib/session/types';

export interface SignAndLockDialogProps { open: boolean; onOpenChange: (open: boolean) => void; session: SessionNote; signerName: string; signerCredentials: string; onSign: () => Promise<void>; isLoading?: boolean; }

export function SignAndLockDialog({ open, onOpenChange, session, signerName, signerCredentials, onSign, isLoading = false }: SignAndLockDialogProps) {
  const willBeLateEntry = isLateEntry(session.sessionDate);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const handleSign = async () => { setIsSubmitting(true); try { await onSign(); onOpenChange(false); } finally { setIsSubmitting(false); } };
  const currentDate = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  const currentTime = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10"><LockIcon size={24} className="text-primary" /></div>
          <DialogTitle className="text-center">Sign and Lock Note</DialogTitle>
          <DialogDescription className="text-center">This action cannot be undone.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          {willBeLateEntry && (
            <div className="flex items-start gap-3 rounded-lg border border-warning/50 bg-warning/10 p-3">
              <Alert02Icon size={20} className="mt-0.5 text-warning" />
              <div><Text weight="medium" className="text-warning">Late Entry Notice</Text><Text size="sm" muted>This note will be marked as a late entry.</Text></div>
            </div>
          )}
          <div className="rounded-lg bg-surface-secondary p-4">
            <Text size="sm">By signing, you confirm that:</Text>
            <ul className="mt-2 space-y-1.5 text-sm text-foreground-muted">
              <li className="flex items-start gap-2"><SecurityCheckIcon size={16} className="mt-0.5 shrink-0" />This note is accurate and complete</li>
              <li className="flex items-start gap-2"><LockIcon size={16} className="mt-0.5 shrink-0" />The note will be locked and cannot be edited</li>
              <li className="flex items-start gap-2"><SecurityCheckIcon size={16} className="mt-0.5 shrink-0" />Only addendums can be added after signing</li>
            </ul>
          </div>
          <div className="rounded-lg border p-4">
            <Text size="sm" muted className="mb-2">Electronic Signature Preview:</Text>
            <div className="border-t pt-3"><Text size="sm" className="italic">Electronically signed by</Text><Text weight="medium" className="mt-1">{signerName}{signerCredentials && `, ${signerCredentials}`}</Text><Text size="sm" muted className="mt-1">{currentDate} at {currentTime}</Text></div>
          </div>
        </div>
        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading || isSubmitting} className="min-h-[44px]">Continue Editing</Button>
          <Button onClick={handleSign} disabled={isLoading || isSubmitting} className="min-h-[44px] gap-2 bg-accent hover:bg-accent/90"><LockIcon size={16} />{isSubmitting ? 'Signing...' : 'Sign & Lock'}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
