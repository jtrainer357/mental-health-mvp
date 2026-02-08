"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/design-system/components/ui/button";
import { Input } from "@/design-system/components/ui/input";
import { ShieldCheck, Loader2, AlertCircle, Clock } from "lucide-react";
import type { MFAVerifyMode } from "@/src/lib/auth/mfa/types";

export default function MFAVerifyPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/home";
  const [mode, setMode] = useState<MFAVerifyMode>("totp");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [attemptsRemaining, setAttemptsRemaining] = useState<number | null>(null);
  const [lockedUntil, setLockedUntil] = useState<string | null>(null);
  const [lockCountdown, setLockCountdown] = useState<number>(0);
  const [totpCode, setTotpCode] = useState<string[]>(["", "", "", "", "", ""]);
  const [backupCode, setBackupCode] = useState("");
  const digitRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (!lockedUntil) return;
    const updateCountdown = () => {
      const remaining = new Date(lockedUntil).getTime() - Date.now();
      if (remaining <= 0) { setLockedUntil(null); setLockCountdown(0); setError(null); }
      else setLockCountdown(Math.ceil(remaining / 1000));
    };
    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [lockedUntil]);

  useEffect(() => { if (mode === "totp") digitRefs.current[0]?.focus(); }, [mode]);

  const verify = useCallback(async () => {
    const code = mode === "totp" ? totpCode.join("") : backupCode.replace(/[\s-]/g, "");
    if (mode === "totp" && code.length !== 6) { setError("Please enter a complete 6-digit code"); return; }
    if (mode === "backup" && !code) { setError("Please enter a backup code"); return; }
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/auth/mfa/verify", {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ code, useBackupCode: mode === "backup" }),
      });
      const data = await response.json();
      if (!response.ok) {
        if (data.lockedUntil) setLockedUntil(data.lockedUntil);
        if (data.attemptsRemaining !== undefined) setAttemptsRemaining(data.attemptsRemaining);
        throw new Error(data.message || data.error || "Verification failed");
      }
      router.push(callbackUrl);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      if (mode === "totp") { setTotpCode(["", "", "", "", "", ""]); digitRefs.current[0]?.focus(); }
      else setBackupCode("");
    } finally {
      setIsLoading(false);
    }
  }, [mode, totpCode, backupCode, callbackUrl, router]);

  const handleDigitChange = (index: number, value: string) => {
    const digit = value.replace(/\D/g, "").slice(-1);
    const newCode = [...totpCode]; newCode[index] = digit; setTotpCode(newCode); setError(null);
    if (digit && index < 5) digitRefs.current[index + 1]?.focus();
    if (digit && index === 5 && newCode.every(d => d)) setTimeout(() => verify(), 100);
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !totpCode[index] && index > 0) digitRefs.current[index - 1]?.focus();
    if (e.key === "Enter") verify();
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const paste = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (paste) {
      const newCode = paste.split("").concat(["", "", "", "", "", ""]).slice(0, 6);
      setTotpCode(newCode);
      if (paste.length === 6) setTimeout(() => verify(), 100); else digitRefs.current[paste.length]?.focus();
    }
  };

  const formatCountdown = (seconds: number) => { const mins = Math.floor(seconds / 60); const secs = seconds % 60; return `${mins}:${secs.toString().padStart(2, "0")}`; };
  const isLocked = !!lockedUntil && lockCountdown > 0;

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="rounded-xl border bg-card p-8 shadow-lg">
          <div className="mb-6 flex justify-center"><div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10"><ShieldCheck className="h-8 w-8 text-primary" /></div></div>
          <h1 className="mb-2 text-center text-2xl font-bold">Two-Factor Authentication</h1>
          <p className="mb-6 text-center text-muted-foreground">{mode === "totp" ? "Enter the 6-digit code from your authenticator app." : "Enter one of your backup codes."}</p>
          {isLocked ? (
            <div className="mb-6 rounded-lg bg-destructive/10 p-4 text-center">
              <div className="mb-2 flex items-center justify-center gap-2 text-destructive"><Clock className="h-5 w-5" /><span className="font-medium">Account Temporarily Locked</span></div>
              <p className="text-sm text-muted-foreground">Too many failed attempts. Try again in <span className="font-mono font-bold">{formatCountdown(lockCountdown)}</span></p>
            </div>
          ) : (
            <AnimatePresence mode="wait">
              {mode === "totp" ? (
                <motion.div key="totp" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                  <div className="mb-6"><div className="flex justify-center gap-2" onPaste={handlePaste}>{totpCode.map((digit, index) => (<Input key={index} ref={(el) => { digitRefs.current[index] = el; }} type="text" inputMode="numeric" maxLength={1} value={digit} onChange={(e) => handleDigitChange(index, e.target.value)} onKeyDown={(e) => handleKeyDown(index, e)} className="h-14 w-12 text-center text-2xl font-bold" disabled={isLoading} aria-label={`Digit ${index + 1}`} />))}</div></div>
                  {error && <div className="mb-4 flex items-center justify-center gap-2 text-sm text-destructive"><AlertCircle className="h-4 w-4" /><span>{error}</span></div>}
                  {attemptsRemaining !== null && attemptsRemaining <= 3 && <p className="mb-4 text-center text-sm text-amber-600 dark:text-amber-400">{attemptsRemaining} attempt{attemptsRemaining !== 1 ? "s" : ""} remaining</p>}
                  <Button className="w-full" size="lg" onClick={verify} disabled={isLoading || totpCode.some(d => !d)}>{isLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Verifying...</> : "Verify"}</Button>
                  <button type="button" className="mt-4 w-full text-center text-sm text-muted-foreground hover:text-foreground" onClick={() => { setMode("backup"); setError(null); setTotpCode(["", "", "", "", "", ""]); }} disabled={isLoading}>Use a backup code instead</button>
                </motion.div>
              ) : (
                <motion.div key="backup" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                  <div className="mb-6"><Input type="text" placeholder="XXXX-XXXX" value={backupCode} onChange={(e) => { setBackupCode(e.target.value.toUpperCase()); setError(null); }} onKeyDown={(e) => { if (e.key === "Enter") verify(); }} className="h-14 text-center text-xl font-mono tracking-wider" disabled={isLoading} autoFocus /></div>
                  {error && <div className="mb-4 flex items-center justify-center gap-2 text-sm text-destructive"><AlertCircle className="h-4 w-4" /><span>{error}</span></div>}
                  <Button className="w-full" size="lg" onClick={verify} disabled={isLoading || !backupCode.trim()}>{isLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Verifying...</> : "Verify Backup Code"}</Button>
                  <button type="button" className="mt-4 w-full text-center text-sm text-muted-foreground hover:text-foreground" onClick={() => { setMode("totp"); setError(null); setBackupCode(""); }} disabled={isLoading}>Use authenticator app instead</button>
                </motion.div>
              )}
            </AnimatePresence>
          )}
          <div className="mt-6 border-t pt-4"><p className="text-center text-xs text-muted-foreground">Lost access to your authenticator and backup codes? <a href="mailto:support@tebra.com" className="text-primary hover:underline">Contact your administrator</a> to reset MFA.</p></div>
        </motion.div>
      </div>
    </div>
  );
}
