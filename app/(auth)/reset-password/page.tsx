"use client";

import * as React from "react";
import { Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/design-system/components/ui/button";
import { Input } from "@/design-system/components/ui/input";
import { Label } from "@/design-system/components/ui/label";
import { Loader2, Lock, AlertCircle, CheckCircle2, Check } from "lucide-react";
import { cn } from "@/design-system/lib/utils";

interface PasswordStrength {
  score: number;
  label: string;
  color: string;
  requirements: { met: boolean; text: string }[];
}

function checkPasswordStrength(password: string): PasswordStrength {
  const requirements = [
    { met: password.length >= 12, text: "At least 12 characters" },
    { met: /[A-Z]/.test(password), text: "One uppercase letter" },
    { met: /[a-z]/.test(password), text: "One lowercase letter" },
    { met: /[0-9]/.test(password), text: "One number" },
    { met: /[^A-Za-z0-9]/.test(password), text: "One special character" },
  ];

  const metCount = requirements.filter((r) => r.met).length;
  const score = Math.min(metCount, 4);

  const labels = ["Very Weak", "Weak", "Fair", "Good", "Strong"];
  const colors = ["bg-red-500", "bg-orange-500", "bg-yellow-500", "bg-blue-500", "bg-green-500"];

  return {
    score,
    label: labels[score],
    color: colors[score],
    requirements,
  };
}

function ResetPasswordFormSkeleton() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="h-12 bg-gray-200 rounded-md" />
      <div className="h-12 bg-gray-200 rounded-md" />
      <div className="h-10 bg-gray-200 rounded-md" />
    </div>
  );
}

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [password, setPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);
  const [isSuccess, setIsSuccess] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const passwordStrength = checkPasswordStrength(password);
  const passwordsMatch = password === confirmPassword;
  const isValid = password && confirmPassword && passwordsMatch && passwordStrength.score >= 3;

  // Show error if no token
  if (!token) {
    return (
      <div className="text-center space-y-4">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
          <AlertCircle className="h-6 w-6 text-red-600" />
        </div>
        <h2 className="text-lg font-semibold">Invalid Reset Link</h2>
        <p className="text-sm text-muted-foreground">
          This password reset link is invalid or has expired. Please request a new one.
        </p>
        <Button asChild className="mt-4 w-full">
          <Link href="/forgot-password">Request New Link</Link>
        </Button>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to reset password");
      }

      setIsSuccess(true);
      setTimeout(() => {
        router.push("/login?reset=true");
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="text-center space-y-4">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
          <CheckCircle2 className="h-6 w-6 text-green-600" />
        </div>
        <h2 className="text-lg font-semibold">Password Reset Complete</h2>
        <p className="text-sm text-muted-foreground">
          Your password has been successfully reset. Redirecting to sign in...
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="flex items-start gap-3 rounded-lg border border-destructive/20 bg-destructive/10 p-4">
          <AlertCircle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
          <p className="text-sm text-destructive">{error}</p>
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="password">New Password</Label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            id="password"
            type="password"
            placeholder="Create a strong password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="pl-10"
            required
            disabled={isLoading}
          />
        </div>
        {password && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className={cn("h-full transition-all", passwordStrength.color)}
                  style={{ width: `${(passwordStrength.score / 4) * 100}%` }}
                />
              </div>
              <span className="text-xs font-medium">{passwordStrength.label}</span>
            </div>
            <ul className="grid grid-cols-2 gap-1">
              {passwordStrength.requirements.map((req, i) => (
                <li
                  key={i}
                  className={cn(
                    "flex items-center gap-1 text-xs",
                    req.met ? "text-green-600" : "text-muted-foreground"
                  )}
                >
                  <Check className={cn("h-3 w-3", !req.met && "opacity-0")} />
                  {req.text}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="confirmPassword">Confirm New Password</Label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            id="confirmPassword"
            type="password"
            placeholder="Confirm your password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className={cn(
              "pl-10",
              confirmPassword && !passwordsMatch && "border-destructive"
            )}
            required
            disabled={isLoading}
          />
        </div>
        {confirmPassword && !passwordsMatch && (
          <p className="text-xs text-destructive">Passwords do not match</p>
        )}
      </div>

      <Button type="submit" className="w-full" size="lg" disabled={!isValid || isLoading}>
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Resetting Password...
          </>
        ) : (
          "Reset Password"
        )}
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        Remember your password?{" "}
        <Link href="/login" className="font-medium text-teal-dark hover:text-teal-dark/80">
          Sign in
        </Link>
      </p>
    </form>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-md space-y-8">
        {/* Logo */}
        <div className="flex flex-col items-center">
          <Image
            src="/tebra-logo.svg"
            alt="Tebra Mental Health"
            width={150}
            height={36}
            priority
          />
          <h1 className="mt-6 text-2xl font-bold text-gray-900">Create new password</h1>
          <p className="mt-2 text-sm text-muted-foreground text-center">
            Enter a new password for your account
          </p>
        </div>

        {/* Form Card */}
        <div className="rounded-xl border bg-white p-8 shadow-sm">
          <Suspense fallback={<ResetPasswordFormSkeleton />}>
            <ResetPasswordForm />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
