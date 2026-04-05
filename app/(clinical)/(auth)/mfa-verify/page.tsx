"use client";

import { useState, useCallback, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Button } from "@/design-system/components/ui/button";
import { Input } from "@/design-system/components/ui/input";
import { ShieldCheck, Key, Loader2, AlertTriangle } from "lucide-react";
import type { MFAVerifyMode } from "@/src/lib/auth/mfa/types";

function MFAVerifyContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";

  const [mode, setMode] = useState<MFAVerifyMode>("totp");
  const [code, setCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [attemptsRemaining, setAttemptsRemaining] = useState<number | null>(null);
  const [lockedUntil, setLockedUntil] = useState<string | null>(null);

  const handleVerify = useCallback(async () => {
    if (!code) {
      setError(
        mode === "totp" ? "Please enter your 6-digit code" : "Please enter your backup code"
      );
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/auth/mfa/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, useBackupCode: mode === "backup" }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.lockedUntil) {
          setLockedUntil(data.lockedUntil);
        }
        if (data.attemptsRemaining !== undefined) {
          setAttemptsRemaining(data.attemptsRemaining);
        }
        throw new Error(data.message || data.error || "Verification failed");
      }

      router.push(callbackUrl);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  }, [code, mode, callbackUrl, router]);

  const isLocked = lockedUntil && new Date(lockedUntil) > new Date();
  const lockMinutesRemaining = isLocked
    ? Math.ceil((new Date(lockedUntil!).getTime() - Date.now()) / 60000)
    : 0;

  return (
    <div className="from-background to-muted/30 flex min-h-screen flex-col items-center justify-center bg-gradient-to-br p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="bg-card rounded-xl border p-6 shadow-lg">
          <div className="mb-6 flex flex-col items-center text-center">
            <div className="bg-primary/10 mb-4 flex h-16 w-16 items-center justify-center rounded-full">
              <ShieldCheck className="text-primary h-8 w-8" />
            </div>
            <h1 className="text-2xl font-bold">Two-Factor Authentication</h1>
            <p className="text-muted-foreground mt-2">
              {mode === "totp"
                ? "Enter the code from your authenticator app"
                : "Enter one of your backup codes"}
            </p>
          </div>

          {isLocked ? (
            <div className="space-y-4">
              <div className="bg-destructive/10 text-destructive flex items-start gap-3 rounded-lg p-4">
                <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />
                <div>
                  <p className="font-medium">Account Temporarily Locked</p>
                  <p className="mt-1 text-sm">
                    Too many failed attempts. Please try again in {lockMinutesRemaining} minute(s).
                  </p>
                </div>
              </div>
              <Button variant="outline" className="w-full" onClick={() => router.push("/")}>
                Return Home
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="bg-muted flex rounded-lg p-1">
                <button
                  onClick={() => {
                    setMode("totp");
                    setCode("");
                    setError(null);
                  }}
                  className={`flex-1 rounded-md px-3 py-2 text-sm font-medium transition-colors ${mode === "totp" ? "bg-background shadow" : "text-muted-foreground hover:text-foreground"}`}
                >
                  Authenticator
                </button>
                <button
                  onClick={() => {
                    setMode("backup");
                    setCode("");
                    setError(null);
                  }}
                  className={`flex-1 rounded-md px-3 py-2 text-sm font-medium transition-colors ${mode === "backup" ? "bg-background shadow" : "text-muted-foreground hover:text-foreground"}`}
                >
                  Backup Code
                </button>
              </div>

              <div className="space-y-2">
                {mode === "totp" ? (
                  <Input
                    type="text"
                    placeholder="000000"
                    value={code}
                    onChange={(e) => {
                      setCode(e.target.value.replace(/\D/g, "").slice(0, 6));
                      setError(null);
                    }}
                    className="text-center font-mono text-2xl tracking-widest"
                    maxLength={6}
                    autoFocus
                    disabled={isLoading}
                  />
                ) : (
                  <div className="space-y-2">
                    <Input
                      type="text"
                      placeholder="XXXX-XXXX"
                      value={code}
                      onChange={(e) => {
                        setCode(e.target.value.toUpperCase());
                        setError(null);
                      }}
                      className="text-center font-mono text-lg tracking-wider"
                      maxLength={9}
                      autoFocus
                      disabled={isLoading}
                    />
                    <p className="text-muted-foreground text-center text-xs">
                      Enter one of your saved backup codes
                    </p>
                  </div>
                )}
              </div>

              {error && (
                <div className="bg-destructive/10 rounded-lg p-3 text-center">
                  <p className="text-destructive text-sm">{error}</p>
                  {attemptsRemaining !== null && attemptsRemaining > 0 && (
                    <p className="text-destructive/80 mt-1 text-xs">
                      {attemptsRemaining} attempt(s) remaining
                    </p>
                  )}
                </div>
              )}

              <Button
                className="w-full"
                onClick={handleVerify}
                disabled={isLoading || (mode === "totp" && code.length !== 6)}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  <>
                    <Key className="mr-2 h-4 w-4" />
                    Verify
                  </>
                )}
              </Button>

              <p className="text-muted-foreground text-center text-sm">
                {mode === "totp"
                  ? "Lost access to your authenticator? "
                  : "Remember your authenticator? "}
                <button
                  onClick={() => {
                    setMode(mode === "totp" ? "backup" : "totp");
                    setCode("");
                    setError(null);
                  }}
                  className="text-primary font-medium hover:underline"
                >
                  {mode === "totp" ? "Use backup code" : "Use authenticator"}
                </button>
              </p>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}

export default function MFAVerifyPage() {
  return (
    <Suspense fallback={null}>
      <MFAVerifyContent />
    </Suspense>
  );
}
