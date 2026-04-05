"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { Button } from "@/design-system/components/ui/button";
import { Input } from "@/design-system/components/ui/input";
import { Label } from "@/design-system/components/ui/label";
import { Loader2, Lock, AlertCircle } from "lucide-react";
import { Suspense } from "react";

function DemoAuthForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/home";

  const [password, setPassword] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const res = await fetch("/api/demo-auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      if (res.ok) {
        router.push(callbackUrl);
        router.refresh();
      } else {
        setError("Invalid password. Please try again.");
      }
    } catch {
      setError("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="border-destructive/20 bg-destructive/10 flex items-start gap-3 rounded-lg border p-4">
          <AlertCircle className="text-destructive mt-0.5 h-5 w-5 shrink-0" />
          <p className="text-destructive text-sm">{error}</p>
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="password">Demo Password</Label>
        <div className="relative">
          <Lock className="text-muted-foreground absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2" />
          <Input
            id="password"
            type="password"
            placeholder="Enter demo password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="pl-10"
            required
            autoFocus
            disabled={isLoading}
          />
        </div>
      </div>

      <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Verifying...
          </>
        ) : (
          "Enter Demo"
        )}
      </Button>
    </form>
  );
}

export default function DemoAuthPage() {
  return (
    <div className="from-backbone-1 to-growth-1/10 flex min-h-screen flex-col items-center justify-center bg-gradient-to-br via-white px-4 py-12">
      <div className="w-full max-w-md space-y-8">
        <div className="flex flex-col items-center">
          <Image src="/tebra-logo.svg" alt="Tebra Mental Health" width={150} height={36} priority />
          <h1 className="mt-6 text-2xl font-bold text-gray-900">Demo Access</h1>
          <p className="text-muted-foreground mt-2 text-center text-sm">
            This is a private demo. Please enter the password to continue.
          </p>
        </div>

        <div className="rounded-xl border bg-white p-8 shadow-sm">
          <Suspense
            fallback={
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
              </div>
            }
          >
            <DemoAuthForm />
          </Suspense>
        </div>

        <p className="text-muted-foreground text-center text-xs">
          Contact your administrator if you need access credentials.
        </p>
      </div>
    </div>
  );
}
