"use client";

import { useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/design-system/components/ui/button";
import { Input } from "@/design-system/components/ui/input";
import { Checkbox } from "@/design-system/components/ui/checkbox";
import { ShieldCheck, QrCode, Key, Download, Copy, Check, ArrowRight, ArrowLeft, Loader2 } from "lucide-react";
import type { MFASetupStep } from "@/src/lib/auth/mfa/types";

export default function MFASetupPage() {
  const router = useRouter();
  const [step, setStep] = useState<MFASetupStep>("intro");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string | null>(null);
  const [secret, setSecret] = useState<string | null>(null);
  const [verificationCode, setVerificationCode] = useState<string[]>(["", "", "", "", "", ""]);
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [savedBackupCodes, setSavedBackupCodes] = useState(false);
  const [copied, setCopied] = useState(false);
  const digitRefs = useRef<(HTMLInputElement | null)[]>([]);

  const initializeSetup = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/auth/mfa/setup", { method: "POST", headers: { "Content-Type": "application/json" } });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to initialize MFA setup");
      setQrCodeDataUrl(data.qrCodeDataUrl);
      setSecret(data.secret);
      setStep("qr");
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const verifyCode = useCallback(async () => {
    const code = verificationCode.join("");
    if (code.length !== 6) { setError("Please enter a complete 6-digit code"); return; }
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/auth/mfa/setup", {
        method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ code, secret }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || data.message || "Verification failed");
      if (data.backupCodes) { setBackupCodes(data.backupCodes); setStep("backup"); }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      setVerificationCode(["", "", "", "", "", ""]);
      digitRefs.current[0]?.focus();
    } finally {
      setIsLoading(false);
    }
  }, [verificationCode, secret]);

  const handleDigitChange = (index: number, value: string) => {
    const digit = value.replace(/\D/g, "").slice(-1);
    const newCode = [...verificationCode];
    newCode[index] = digit;
    setVerificationCode(newCode);
    setError(null);
    if (digit && index < 5) digitRefs.current[index + 1]?.focus();
    if (digit && index === 5 && newCode.every(d => d)) setTimeout(() => verifyCode(), 100);
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !verificationCode[index] && index > 0) digitRefs.current[index - 1]?.focus();
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const paste = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (paste) {
      const newCode = paste.split("").concat(["", "", "", "", "", ""]).slice(0, 6);
      setVerificationCode(newCode);
      if (paste.length === 6) setTimeout(() => verifyCode(), 100);
      else digitRefs.current[paste.length]?.focus();
    }
  };

  const copyBackupCodes = async () => { await navigator.clipboard.writeText(backupCodes.join("\n")); setCopied(true); setTimeout(() => setCopied(false), 2000); };

  const downloadBackupCodes = () => {
    const text = `Tebra Mental Health - Backup Codes\nGenerated: ${new Date().toLocaleDateString()}\n\nIMPORTANT: Each code can only be used once.\n\n${backupCodes.join("\n")}\n`;
    const blob = new Blob([text], { type: "text/plain" });
    const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = "tebra-mfa-backup-codes.txt";
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
  };

  const pageVariants = { initial: { opacity: 0, x: 20 }, animate: { opacity: 1, x: 0 }, exit: { opacity: 0, x: -20 } };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        <AnimatePresence mode="wait">
          {step === "intro" && (
            <motion.div key="intro" variants={pageVariants} initial="initial" animate="animate" exit="exit" className="rounded-xl border bg-card p-8 shadow-lg">
              <div className="mb-6 flex justify-center"><div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10"><ShieldCheck className="h-8 w-8 text-primary" /></div></div>
              <h1 className="mb-2 text-center text-2xl font-bold">Enhance Your Security</h1>
              <p className="mb-6 text-center text-muted-foreground">Two-factor authentication adds an extra layer of protection for patient data.</p>
              <div className="mb-6 space-y-3">
                <div className="flex items-start gap-3 rounded-lg bg-muted/50 p-3"><Check className="mt-0.5 h-5 w-5 shrink-0 text-primary" /><span className="text-sm">Protects against unauthorized access</span></div>
                <div className="flex items-start gap-3 rounded-lg bg-muted/50 p-3"><Check className="mt-0.5 h-5 w-5 shrink-0 text-primary" /><span className="text-sm">Required for HIPAA compliance</span></div>
              </div>
              <p className="mb-4 text-center text-sm text-muted-foreground">Scan with any authenticator app:</p>
              <div className="mb-6 flex justify-center gap-4">
                <div className="flex flex-col items-center gap-1"><div className="flex h-12 w-12 items-center justify-center rounded-lg bg-muted"><span className="text-lg font-bold">G</span></div><span className="text-xs text-muted-foreground">Google</span></div>
                <div className="flex flex-col items-center gap-1"><div className="flex h-12 w-12 items-center justify-center rounded-lg bg-muted"><span className="text-lg font-bold">A</span></div><span className="text-xs text-muted-foreground">Authy</span></div>
                <div className="flex flex-col items-center gap-1"><div className="flex h-12 w-12 items-center justify-center rounded-lg bg-muted"><span className="text-lg font-bold">M</span></div><span className="text-xs text-muted-foreground">Microsoft</span></div>
              </div>
              <Button className="w-full" size="lg" onClick={initializeSetup} disabled={isLoading}>
                {isLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Setting up...</> : <>Continue<ArrowRight className="ml-2 h-4 w-4" /></>}
              </Button>
              {error && <p className="mt-4 text-center text-sm text-destructive">{error}</p>}
            </motion.div>
          )}
          {step === "qr" && (
            <motion.div key="qr" variants={pageVariants} initial="initial" animate="animate" exit="exit" className="rounded-xl border bg-card p-8 shadow-lg">
              <div className="mb-6 flex justify-center"><div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10"><QrCode className="h-8 w-8 text-primary" /></div></div>
              <h1 className="mb-2 text-center text-2xl font-bold">Scan QR Code</h1>
              <p className="mb-6 text-center text-muted-foreground">Open your authenticator app and scan this QR code.</p>
              {qrCodeDataUrl && <div className="mb-6 flex justify-center"><div className="rounded-xl border bg-white p-4"><Image src={qrCodeDataUrl} alt="MFA QR Code" width={200} height={200} className="h-[200px] w-[200px]" /></div></div>}
              <div className="mb-6"><p className="mb-2 text-center text-sm text-muted-foreground">Can&apos;t scan? Enter this code manually:</p><div className="flex items-center justify-center gap-2"><code className="rounded bg-muted px-3 py-2 text-sm font-mono">{secret}</code><Button variant="ghost" size="icon" onClick={() => { navigator.clipboard.writeText(secret || ""); setCopied(true); setTimeout(() => setCopied(false), 2000); }}>{copied ? <Check className="h-4 w-4 text-primary" /> : <Copy className="h-4 w-4" />}</Button></div></div>
              <Button className="w-full" size="lg" onClick={() => setStep("verify")}>I&apos;ve scanned the code<ArrowRight className="ml-2 h-4 w-4" /></Button>
              <Button variant="ghost" className="mt-2 w-full" onClick={() => setStep("intro")}><ArrowLeft className="mr-2 h-4 w-4" />Back</Button>
            </motion.div>
          )}
          {step === "verify" && (
            <motion.div key="verify" variants={pageVariants} initial="initial" animate="animate" exit="exit" className="rounded-xl border bg-card p-8 shadow-lg">
              <div className="mb-6 flex justify-center"><div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10"><Key className="h-8 w-8 text-primary" /></div></div>
              <h1 className="mb-2 text-center text-2xl font-bold">Verify Setup</h1>
              <p className="mb-6 text-center text-muted-foreground">Enter the 6-digit code from your authenticator app.</p>
              <div className="mb-6"><div className="flex justify-center gap-2" onPaste={handlePaste}>{verificationCode.map((digit, index) => (<Input key={index} ref={(el) => { digitRefs.current[index] = el; }} type="text" inputMode="numeric" maxLength={1} value={digit} onChange={(e) => handleDigitChange(index, e.target.value)} onKeyDown={(e) => handleKeyDown(index, e)} className="h-14 w-12 text-center text-2xl font-bold" disabled={isLoading} aria-label={`Digit ${index + 1}`} />))}</div></div>
              {error && <p className="mb-4 text-center text-sm text-destructive">{error}</p>}
              <Button className="w-full" size="lg" onClick={verifyCode} disabled={isLoading || verificationCode.some(d => !d)}>{isLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Verifying...</> : "Verify"}</Button>
              <Button variant="ghost" className="mt-2 w-full" onClick={() => setStep("qr")} disabled={isLoading}><ArrowLeft className="mr-2 h-4 w-4" />Back to QR code</Button>
            </motion.div>
          )}
          {step === "backup" && (
            <motion.div key="backup" variants={pageVariants} initial="initial" animate="animate" exit="exit" className="rounded-xl border bg-card p-8 shadow-lg">
              <div className="mb-6 flex justify-center"><div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10"><Key className="h-8 w-8 text-primary" /></div></div>
              <h1 className="mb-2 text-center text-2xl font-bold">Save Backup Codes</h1>
              <p className="mb-6 text-center text-muted-foreground">Save these codes in a safe place.</p>
              <div className="mb-4 grid grid-cols-2 gap-2">{backupCodes.map((code, index) => (<div key={index} className="rounded border bg-muted px-3 py-2 text-center font-mono text-sm">{code}</div>))}</div>
              <div className="mb-6 flex gap-2"><Button variant="outline" className="flex-1" onClick={downloadBackupCodes}><Download className="mr-2 h-4 w-4" />Download</Button><Button variant="outline" className="flex-1" onClick={copyBackupCodes}>{copied ? <><Check className="mr-2 h-4 w-4" />Copied!</> : <><Copy className="mr-2 h-4 w-4" />Copy All</>}</Button></div>
              <div className="mb-4 rounded-lg bg-amber-50 dark:bg-amber-950/30 p-3"><p className="text-sm text-amber-800 dark:text-amber-200"><strong>Warning:</strong> Each backup code can only be used once.</p></div>
              <div className="mb-6 flex items-start gap-3"><Checkbox id="saved-codes" checked={savedBackupCodes} onCheckedChange={(checked) => setSavedBackupCodes(checked === true)} /><label htmlFor="saved-codes" className="cursor-pointer text-sm leading-tight">I have saved my backup codes in a safe place</label></div>
              <Button className="w-full" size="lg" onClick={() => router.push("/home")} disabled={!savedBackupCodes}>Complete Setup<ArrowRight className="ml-2 h-4 w-4" /></Button>
            </motion.div>
          )}
        </AnimatePresence>
        <div className="mt-6 flex justify-center gap-2">{(["intro", "qr", "verify", "backup"] as const).map((s) => (<div key={s} className={`h-2 w-2 rounded-full transition-colors ${s === step ? "bg-primary" : step === "backup" || (step === "verify" && (s === "intro" || s === "qr")) || (step === "qr" && s === "intro") ? "bg-primary/50" : "bg-muted"}`} />))}</div>
      </div>
    </div>
  );
}
