"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/design-system/components/ui/button";
import { Input } from "@/design-system/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/design-system/components/ui/dialog";
import { ShieldCheck, ShieldOff, Key, RefreshCw, Download, Copy, Check, Loader2, AlertTriangle } from "lucide-react";
import type { MFAStatus } from "@/src/lib/auth/mfa/types";

export function MFASettings() {
  const router = useRouter();
  const [status, setStatus] = useState<MFAStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDisableDialog, setShowDisableDialog] = useState(false);
  const [showRegenerateDialog, setShowRegenerateDialog] = useState(false);
  const [showBackupCodesDialog, setShowBackupCodesDialog] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");
  const [newBackupCodes, setNewBackupCodes] = useState<string[]>([]);
  const [copied, setCopied] = useState(false);

  const fetchStatus = useCallback(async () => {
    try {
      const response = await fetch("/api/auth/mfa/status");
      if (response.ok) setStatus(await response.json());
    } catch (err) {
      console.error("Failed to fetch MFA status:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { fetchStatus(); }, [fetchStatus]);

  const handleDisable = async () => {
    if (!verificationCode) { setError("Please enter your verification code"); return; }
    setActionLoading(true); setError(null);
    try {
      const response = await fetch("/api/auth/mfa/disable", {
        method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ code: verificationCode }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || data.error || "Failed to disable MFA");
      setShowDisableDialog(false); setVerificationCode(""); fetchStatus();
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setActionLoading(false);
    }
  };

  const handleRegenerate = async () => {
    if (!verificationCode) { setError("Please enter your verification code"); return; }
    setActionLoading(true); setError(null);
    try {
      const response = await fetch("/api/auth/mfa/regenerate-backup", {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ code: verificationCode }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || data.error || "Failed to regenerate codes");
      setShowRegenerateDialog(false); setVerificationCode(""); setNewBackupCodes(data.backupCodes); setShowBackupCodesDialog(true); fetchStatus();
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setActionLoading(false);
    }
  };

  const copyBackupCodes = async () => { await navigator.clipboard.writeText(newBackupCodes.join("\n")); setCopied(true); setTimeout(() => setCopied(false), 2000); };
  const downloadBackupCodes = () => {
    const text = `Tebra Mental Health - Backup Codes\nGenerated: ${new Date().toLocaleDateString()}\n\n${newBackupCodes.join("\n")}\n`;
    const blob = new Blob([text], { type: "text/plain" });
    const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = "tebra-mfa-backup-codes.txt";
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
  };

  if (isLoading) return <div className="rounded-lg border bg-card p-6"><div className="flex items-center justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div></div>;

  return (
    <>
      <div className="rounded-lg border bg-card p-6">
        <div className="mb-4 flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10"><ShieldCheck className="h-5 w-5 text-primary" /></div><div><h3 className="font-semibold">Two-Factor Authentication</h3><p className="text-sm text-muted-foreground">Add an extra layer of security</p></div></div>
        {status?.isEnabled ? (
          <div className="space-y-4">
            <div className="flex items-center gap-2 rounded-lg bg-primary/10 p-3 text-primary"><Check className="h-5 w-5" /><span className="font-medium">Two-factor authentication is enabled</span></div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-lg bg-muted/50 p-3"><p className="text-sm text-muted-foreground">Enabled on</p><p className="font-medium">{status.enabledAt ? new Date(status.enabledAt).toLocaleDateString() : "Unknown"}</p></div>
              <div className="rounded-lg bg-muted/50 p-3"><p className="text-sm text-muted-foreground">Backup codes remaining</p><p className="font-medium">{status.backupCodesRemaining} of 10</p></div>
            </div>
            {status.backupCodesRemaining <= 3 && <div className="flex items-start gap-2 rounded-lg bg-amber-50 dark:bg-amber-950/30 p-3 text-amber-800 dark:text-amber-200"><AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" /><p className="text-sm">You&apos;re running low on backup codes.</p></div>}
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" size="sm" onClick={() => setShowRegenerateDialog(true)}><RefreshCw className="mr-2 h-4 w-4" />Regenerate Backup Codes</Button>
              <Button variant="outline" size="sm" className="text-destructive hover:text-destructive" onClick={() => setShowDisableDialog(true)}><ShieldOff className="mr-2 h-4 w-4" />Disable MFA</Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center gap-2 rounded-lg bg-muted/50 p-3 text-muted-foreground"><ShieldOff className="h-5 w-5" /><span>Two-factor authentication is not enabled</span></div>
            <p className="text-sm text-muted-foreground">Protect your account by requiring a verification code in addition to your password.</p>
            <Button onClick={() => router.push("/mfa-setup")}><Key className="mr-2 h-4 w-4" />Enable Two-Factor Authentication</Button>
          </div>
        )}
      </div>

      <Dialog open={showDisableDialog} onOpenChange={setShowDisableDialog}>
        <DialogContent><DialogHeader><DialogTitle>Disable Two-Factor Authentication</DialogTitle><DialogDescription>Enter your current verification code to confirm.</DialogDescription></DialogHeader>
          <div className="space-y-4 py-4">
            <div className="rounded-lg bg-amber-50 dark:bg-amber-950/30 p-3 text-amber-800 dark:text-amber-200"><p className="text-sm"><strong>Warning:</strong> Disabling MFA will make your account less secure.</p></div>
            <div><label className="mb-2 block text-sm font-medium">Verification Code</label><Input type="text" placeholder="Enter 6-digit code" value={verificationCode} onChange={(e) => { setVerificationCode(e.target.value.replace(/\D/g, "").slice(0, 6)); setError(null); }} className="font-mono" maxLength={6} /></div>
            {error && <p className="text-sm text-destructive">{error}</p>}
          </div>
          <DialogFooter><Button variant="outline" onClick={() => { setShowDisableDialog(false); setVerificationCode(""); setError(null); }} disabled={actionLoading}>Cancel</Button><Button variant="destructive" onClick={handleDisable} disabled={actionLoading || verificationCode.length !== 6}>{actionLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Disabling...</> : "Disable MFA"}</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showRegenerateDialog} onOpenChange={setShowRegenerateDialog}>
        <DialogContent><DialogHeader><DialogTitle>Regenerate Backup Codes</DialogTitle><DialogDescription>This will invalidate all existing codes.</DialogDescription></DialogHeader>
          <div className="space-y-4 py-4">
            <div><label className="mb-2 block text-sm font-medium">Verification Code</label><Input type="text" placeholder="Enter 6-digit code" value={verificationCode} onChange={(e) => { setVerificationCode(e.target.value.replace(/\D/g, "").slice(0, 6)); setError(null); }} className="font-mono" maxLength={6} /></div>
            {error && <p className="text-sm text-destructive">{error}</p>}
          </div>
          <DialogFooter><Button variant="outline" onClick={() => { setShowRegenerateDialog(false); setVerificationCode(""); setError(null); }} disabled={actionLoading}>Cancel</Button><Button onClick={handleRegenerate} disabled={actionLoading || verificationCode.length !== 6}>{actionLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Regenerating...</> : "Regenerate Codes"}</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showBackupCodesDialog} onOpenChange={setShowBackupCodesDialog}>
        <DialogContent className="max-w-md"><DialogHeader><DialogTitle>New Backup Codes</DialogTitle><DialogDescription>Save these codes in a safe place.</DialogDescription></DialogHeader>
          <div className="py-4">
            <div className="mb-4 grid grid-cols-2 gap-2">{newBackupCodes.map((code, index) => (<div key={index} className="rounded border bg-muted px-3 py-2 text-center font-mono text-sm">{code}</div>))}</div>
            <div className="flex gap-2"><Button variant="outline" className="flex-1" onClick={downloadBackupCodes}><Download className="mr-2 h-4 w-4" />Download</Button><Button variant="outline" className="flex-1" onClick={copyBackupCodes}>{copied ? <><Check className="mr-2 h-4 w-4" />Copied!</> : <><Copy className="mr-2 h-4 w-4" />Copy All</>}</Button></div>
            <div className="mt-4 rounded-lg bg-amber-50 dark:bg-amber-950/30 p-3"><p className="text-sm text-amber-800 dark:text-amber-200"><strong>Warning:</strong> Each backup code can only be used once.</p></div>
          </div>
          <DialogFooter><Button onClick={() => setShowBackupCodesDialog(false)}>Done</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
