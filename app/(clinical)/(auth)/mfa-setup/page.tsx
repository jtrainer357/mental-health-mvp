"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/design-system/components/ui/button";
import { Input } from "@/design-system/components/ui/input";
import {
  ShieldCheck,
  Smartphone,
  Key,
  Copy,
  Download,
  Check,
  ArrowRight,
  ArrowLeft,
  Loader2,
} from "lucide-react";
import type { MFASetupStep } from "@/src/lib/auth/mfa/types";

const STEPS: { id: MFASetupStep; title: string; description: string }[] = [
  {
    id: "intro",
    title: "Enable Two-Factor Authentication",
    description: "Add an extra layer of security to your account",
  },
  { id: "qr", title: "Scan QR Code", description: "Use your authenticator app to scan the code" },
  { id: "verify", title: "Verify Code", description: "Enter the 6-digit code from your app" },
  { id: "backup", title: "Save Backup Codes", description: "Store these codes in a safe place" },
];

export default function MFASetupPage() {
  const router = useRouter();
  const [step, setStep] = useState<MFASetupStep>("intro");
  const [qrCode, setQRCode] = useState<string>("");
  const [secret, setSecret] = useState<string>("");
  const [verificationCode, setVerificationCode] = useState("");
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [secretCopied, setSecretCopied] = useState(false);

  const currentStepIndex = STEPS.findIndex((s) => s.id === step);

  const initiateSetup = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/auth/mfa/setup", { method: "POST" });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to initiate MFA setup");
      setQRCode(data.qrCodeDataUrl);
      setSecret(data.secret);
      setStep("qr");
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const verifyAndEnable = useCallback(async () => {
    if (verificationCode.length !== 6) {
      setError("Please enter a 6-digit code");
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/auth/mfa/setup", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: verificationCode }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || data.error || "Verification failed");
      setBackupCodes(data.backupCodes);
      setStep("backup");
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  }, [verificationCode]);

  const copyBackupCodes = async () => {
    await navigator.clipboard.writeText(backupCodes.join("\n"));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadBackupCodes = () => {
    const text = `Tebra Mental Health - MFA Backup Codes\nGenerated: ${new Date().toLocaleDateString()}\n\n${backupCodes.join("\n")}\n\nIMPORTANT: Each code can only be used once.`;
    const blob = new Blob([text], { type: "text/plain" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "tebra-mfa-backup-codes.txt";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const copySecret = async () => {
    await navigator.clipboard.writeText(secret);
    setSecretCopied(true);
    setTimeout(() => setSecretCopied(false), 2000);
  };

  return (
    <div className="from-background to-muted/30 flex min-h-screen flex-col items-center justify-center bg-gradient-to-br p-4">
      <div className="w-full max-w-lg">
        <div className="mb-8 flex items-center justify-center gap-2">
          {STEPS.map((s, i) => (
            <div key={s.id} className="flex items-center">
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium transition-colors ${i < currentStepIndex ? "bg-primary text-primary-foreground" : i === currentStepIndex ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}
              >
                {i < currentStepIndex ? <Check className="h-4 w-4" /> : i + 1}
              </div>
              {i < STEPS.length - 1 && (
                <div
                  className={`mx-2 h-0.5 w-8 transition-colors ${i < currentStepIndex ? "bg-primary" : "bg-muted"}`}
                />
              )}
            </div>
          ))}
        </div>

        <motion.div layout className="bg-card rounded-xl border p-6 shadow-lg">
          <AnimatePresence mode="wait">
            {step === "intro" && (
              <motion.div
                key="intro"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-6"
              >
                <div className="flex flex-col items-center text-center">
                  <div className="bg-primary/10 mb-4 flex h-16 w-16 items-center justify-center rounded-full">
                    <ShieldCheck className="text-primary h-8 w-8" />
                  </div>
                  <h1 className="text-2xl font-bold">{STEPS[0]!.title}</h1>
                  <p className="text-muted-foreground mt-2">{STEPS[0]!.description}</p>
                </div>
                <div className="bg-muted/50 space-y-3 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <Smartphone className="text-primary mt-0.5 h-5 w-5" />
                    <div>
                      <p className="font-medium">Authenticator App Required</p>
                      <p className="text-muted-foreground text-sm">
                        Download Google Authenticator, Authy, or similar
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Key className="text-primary mt-0.5 h-5 w-5" />
                    <div>
                      <p className="font-medium">Backup Codes</p>
                      <p className="text-muted-foreground text-sm">
                        You&apos;ll receive 10 one-time backup codes
                      </p>
                    </div>
                  </div>
                </div>
                {error && <p className="text-destructive text-center text-sm">{error}</p>}
                <div className="flex gap-3">
                  <Button variant="outline" className="flex-1" onClick={() => router.back()}>
                    Cancel
                  </Button>
                  <Button className="flex-1" onClick={initiateSetup} disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Setting up...
                      </>
                    ) : (
                      <>
                        Get Started
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </>
                    )}
                  </Button>
                </div>
              </motion.div>
            )}

            {step === "qr" && (
              <motion.div
                key="qr"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-6"
              >
                <div className="text-center">
                  <h1 className="text-2xl font-bold">{STEPS[1]!.title}</h1>
                  <p className="text-muted-foreground mt-2">{STEPS[1]!.description}</p>
                </div>
                <div className="flex justify-center">
                  <div className="rounded-lg bg-white p-4">
                    {qrCode && (
                      <Image
                        src={qrCode}
                        alt="MFA QR Code"
                        width={200}
                        height={200}
                        className="rounded"
                      />
                    )}
                  </div>
                </div>
                <div className="space-y-2">
                  <p className="text-muted-foreground text-center text-sm">
                    Or enter this code manually:
                  </p>
                  <div className="flex items-center gap-2">
                    <code className="bg-muted flex-1 rounded px-3 py-2 text-center font-mono text-sm">
                      {secret}
                    </code>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={copySecret}
                      aria-label={secretCopied ? "Copied" : "Copy secret code"}
                    >
                      {secretCopied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
                <div className="flex gap-3">
                  <Button variant="outline" onClick={() => setStep("intro")}>
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back
                  </Button>
                  <Button className="flex-1" onClick={() => setStep("verify")}>
                    Continue
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </motion.div>
            )}

            {step === "verify" && (
              <motion.div
                key="verify"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-6"
              >
                <div className="text-center">
                  <h1 className="text-2xl font-bold">{STEPS[2]!.title}</h1>
                  <p className="text-muted-foreground mt-2">{STEPS[2]!.description}</p>
                </div>
                <div className="space-y-4">
                  <Input
                    type="text"
                    placeholder="000000"
                    value={verificationCode}
                    onChange={(e) => {
                      setVerificationCode(e.target.value.replace(/\D/g, "").slice(0, 6));
                      setError(null);
                    }}
                    className="text-center font-mono text-2xl tracking-widest"
                    maxLength={6}
                    autoFocus
                  />
                  {error && <p className="text-destructive text-center text-sm">{error}</p>}
                </div>
                <div className="flex gap-3">
                  <Button variant="outline" onClick={() => setStep("qr")} disabled={isLoading}>
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back
                  </Button>
                  <Button
                    className="flex-1"
                    onClick={verifyAndEnable}
                    disabled={isLoading || verificationCode.length !== 6}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Verifying...
                      </>
                    ) : (
                      <>
                        Verify & Enable
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </>
                    )}
                  </Button>
                </div>
              </motion.div>
            )}

            {step === "backup" && (
              <motion.div
                key="backup"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-6"
              >
                <div className="flex flex-col items-center text-center">
                  <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-950">
                    <Check className="h-8 w-8 text-green-600 dark:text-green-400" />
                  </div>
                  <h1 className="text-2xl font-bold">MFA Enabled!</h1>
                  <p className="text-muted-foreground mt-2">
                    Save these backup codes in a safe place
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {backupCodes.map((code, index) => (
                    <div
                      key={index}
                      className="bg-muted rounded border px-3 py-2 text-center font-mono text-sm"
                    >
                      {code}
                    </div>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" className="flex-1" onClick={downloadBackupCodes}>
                    <Download className="mr-2 h-4 w-4" />
                    Download
                  </Button>
                  <Button variant="outline" className="flex-1" onClick={copyBackupCodes}>
                    {copied ? (
                      <>
                        <Check className="mr-2 h-4 w-4" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="mr-2 h-4 w-4" />
                        Copy All
                      </>
                    )}
                  </Button>
                </div>
                <div className="rounded-lg bg-amber-50 p-3 dark:bg-amber-950/30">
                  <p className="text-sm text-amber-800 dark:text-amber-200">
                    <strong>Warning:</strong> Each backup code can only be used once. Store them
                    securely.
                  </p>
                </div>
                <Button className="w-full" onClick={() => router.push("/settings")}>
                  Done
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
}
