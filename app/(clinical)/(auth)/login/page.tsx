"use client";

import * as React from "react";
import { Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { Button } from "@/design-system/components/ui/button";
import { Input } from "@/design-system/components/ui/input";
import { Label } from "@/design-system/components/ui/label";
import { Checkbox } from "@/design-system/components/ui/checkbox";
import { Loader2, Mail, Lock, AlertCircle } from "lucide-react";

function LoginFormSkeleton() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="h-12 rounded-md bg-gray-200" />
      <div className="h-12 rounded-md bg-gray-200" />
      <div className="h-10 rounded-md bg-gray-200" />
    </div>
  );
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/home";
  const error = searchParams.get("error");
  const reason = searchParams.get("reason");

  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [rememberMe, setRememberMe] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const [formError, setFormError] = React.useState<string | null>(null);

  const getErrorMessage = (errorCode: string | null): string | null => {
    if (!errorCode) return null;
    const messages: Record<string, string> = {
      CredentialsSignin: "Invalid email or password.",
      SessionRequired: "Please sign in to continue.",
      default: "An error occurred. Please try again.",
    };
    return messages[errorCode] ?? messages.default ?? null;
  };

  const getReasonMessage = (reasonCode: string | null): string | null => {
    if (reasonCode === "timeout") return "Your session has expired. Please sign in again.";
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setIsLoading(true);
    try {
      const result = await signIn("credentials", { email, password, redirect: false, callbackUrl });
      if (result?.error) setFormError(getErrorMessage(result.error));
      else if (result?.ok) router.push(callbackUrl);
    } catch {
      setFormError("An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  const displayError = formError || getErrorMessage(error) || getReasonMessage(reason);

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {displayError && (
        <div className="border-destructive/20 bg-destructive/10 flex items-start gap-3 rounded-lg border p-4">
          <AlertCircle className="text-destructive mt-0.5 h-5 w-5 shrink-0" />
          <p className="text-destructive text-sm">{displayError}</p>
        </div>
      )}
      <div className="space-y-2">
        <Label htmlFor="email">Email Address</Label>
        <div className="relative">
          <Mail className="text-muted-foreground absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2" />
          <Input
            id="email"
            type="email"
            placeholder="provider@practice.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="pl-10"
            required
            autoComplete="email"
            disabled={isLoading}
          />
        </div>
      </div>
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="password">Password</Label>
          <Link
            href="/forgot-password"
            className="text-teal-dark hover:text-teal-dark/80 text-sm font-medium"
          >
            Forgot password?
          </Link>
        </div>
        <div className="relative">
          <Lock className="text-muted-foreground absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2" />
          <Input
            id="password"
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="pl-10"
            required
            autoComplete="current-password"
            disabled={isLoading}
          />
        </div>
      </div>
      <div className="flex items-center space-x-2">
        <Checkbox
          id="remember"
          checked={rememberMe}
          onCheckedChange={(checked) => setRememberMe(checked as boolean)}
          disabled={isLoading}
        />
        <Label htmlFor="remember" className="cursor-pointer text-sm font-normal">
          Remember me for 30 days
        </Label>
      </div>
      <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Signing in...
          </>
        ) : (
          "Sign In"
        )}
      </Button>
      <p className="text-muted-foreground text-center text-sm">
        Don&apos;t have an account?{" "}
        <Link href="/signup" className="text-teal-dark hover:text-teal-dark/80 font-medium">
          Create account
        </Link>
      </p>
    </form>
  );
}

export default function LoginPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-md space-y-8">
        <div className="flex flex-col items-center">
          <Image src="/tebra-logo.svg" alt="Tebra Mental Health" width={150} height={36} priority />
          <h1 className="mt-6 text-2xl font-bold text-gray-900">Welcome back</h1>
          <p className="text-muted-foreground mt-2 text-sm">
            Sign in to your practice management account
          </p>
        </div>
        <div className="rounded-xl border bg-white p-8 shadow-sm">
          <Suspense fallback={<LoginFormSkeleton />}>
            <LoginForm />
          </Suspense>
        </div>
        <div className="text-muted-foreground flex justify-center gap-4 text-xs">
          <Link href="/terms" className="hover:text-teal-dark">
            Terms
          </Link>
          <span>|</span>
          <Link href="/privacy" className="hover:text-teal-dark">
            Privacy
          </Link>
          <span>|</span>
          <Link href="/baa" className="hover:text-teal-dark">
            BAA
          </Link>
        </div>
      </div>
    </div>
  );
}
