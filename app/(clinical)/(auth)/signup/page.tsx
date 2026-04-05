"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Button } from "@/design-system/components/ui/button";
import { Input } from "@/design-system/components/ui/input";
import { Label } from "@/design-system/components/ui/label";
import { Checkbox } from "@/design-system/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/design-system/components/ui/select";
import {
  Loader2,
  Mail,
  Lock,
  User,
  Building2,
  Phone,
  MapPin,
  Check,
  AlertCircle,
} from "lucide-react";
import { cn } from "@/design-system/lib/utils";

const US_STATES = [
  { value: "CA", label: "California" },
  { value: "NY", label: "New York" },
  { value: "TX", label: "Texas" },
  { value: "FL", label: "Florida" },
  { value: "IL", label: "Illinois" },
  { value: "PA", label: "Pennsylvania" },
  { value: "OH", label: "Ohio" },
  { value: "GA", label: "Georgia" },
  { value: "NC", label: "North Carolina" },
  { value: "MI", label: "Michigan" },
];
const SPECIALTIES = [
  { value: "psychiatry", label: "Psychiatry" },
  { value: "psychology", label: "Psychology" },
  { value: "counseling", label: "Counseling" },
  { value: "clinical_social_work", label: "Clinical Social Work" },
  { value: "marriage_family", label: "Marriage & Family Therapy" },
];

function checkPasswordStrength(password: string) {
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
  return { score, label: labels[score], color: colors[score], requirements };
}

type Step = 1 | 2;

export default function SignupPage() {
  const router = useRouter();
  const [step, setStep] = React.useState<Step>(1);
  const [isLoading, setIsLoading] = React.useState(false);
  const [formError, setFormError] = React.useState<string | null>(null);
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [firstName, setFirstName] = React.useState("");
  const [lastName, setLastName] = React.useState("");
  const [phone, setPhone] = React.useState("");
  const [practiceName, setPracticeName] = React.useState("");
  const [specialty, setSpecialty] = React.useState("");
  const [state, setState] = React.useState("");
  const [npi, setNpi] = React.useState("");
  const [acceptedTerms, setAcceptedTerms] = React.useState(false);
  const [acceptedBaa, setAcceptedBaa] = React.useState(false);

  const passwordStrength = checkPasswordStrength(password);
  const passwordsMatch = password === confirmPassword;
  const isStep1Valid =
    email &&
    password &&
    confirmPassword &&
    firstName &&
    lastName &&
    passwordsMatch &&
    passwordStrength.score >= 3;
  const isStep2Valid = practiceName && specialty && state && acceptedTerms && acceptedBaa;

  const handleStep1Submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isStep1Valid) setStep(2);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isStep2Valid) return;
    setIsLoading(true);
    setFormError(null);
    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          password,
          firstName,
          lastName,
          phone,
          practiceName,
          specialty,
          state,
          npi,
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to create account");
      router.push("/login?registered=true");
    } catch (error) {
      setFormError(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg space-y-8">
        <div className="flex flex-col items-center">
          <Image src="/tebra-logo.svg" alt="Tebra Mental Health" width={150} height={36} priority />
          <h1 className="mt-6 text-2xl font-bold text-gray-900">Create your account</h1>
          <p className="text-muted-foreground mt-2 text-sm">Get started with Tebra Mental Health</p>
        </div>
        <div className="flex items-center justify-center gap-4">
          <div className="flex items-center gap-2">
            <div
              className={cn(
                "flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium",
                step >= 1 ? "bg-teal-dark text-white" : "bg-gray-200 text-gray-500"
              )}
            >
              {step > 1 ? <Check className="h-4 w-4" /> : "1"}
            </div>
            <span className="text-sm font-medium">Account</span>
          </div>
          <div className="h-px w-12 bg-gray-300" />
          <div className="flex items-center gap-2">
            <div
              className={cn(
                "flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium",
                step >= 2 ? "bg-teal-dark text-white" : "bg-gray-200 text-gray-500"
              )}
            >
              2
            </div>
            <span className="text-sm font-medium">Practice</span>
          </div>
        </div>
        <div className="rounded-xl border bg-white p-8 shadow-sm">
          {formError && (
            <div className="border-destructive/20 bg-destructive/10 mb-6 flex items-start gap-3 rounded-lg border p-4">
              <AlertCircle className="text-destructive mt-0.5 h-5 w-5 shrink-0" />
              <p className="text-destructive text-sm">{formError}</p>
            </div>
          )}
          {step === 1 && (
            <form onSubmit={handleStep1Submit} className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <div className="relative">
                    <User className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
                    <Input
                      id="firstName"
                      placeholder="Jane"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    placeholder="Doe"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <div className="relative">
                  <Mail className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="provider@practice.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number (Optional)</Label>
                <div className="relative">
                  <Phone className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="(555) 123-4567"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="Create a strong password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
                {password && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-gray-200">
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
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <div className="relative">
                  <Lock className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
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
                  />
                </div>
                {confirmPassword && !passwordsMatch && (
                  <p className="text-destructive text-xs">Passwords do not match</p>
                )}
              </div>
              <Button type="submit" className="w-full" size="lg" disabled={!isStep1Valid}>
                Continue to Practice Setup
              </Button>
            </form>
          )}
          {step === 2 && (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="practiceName">Practice Name</Label>
                <div className="relative">
                  <Building2 className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
                  <Input
                    id="practiceName"
                    placeholder="Mental Health Associates"
                    value={practiceName}
                    onChange={(e) => setPracticeName(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="specialty">Primary Specialty</Label>
                <Select value={specialty} onValueChange={setSpecialty}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select your specialty" />
                  </SelectTrigger>
                  <SelectContent>
                    {SPECIALTIES.map((s) => (
                      <SelectItem key={s.value} value={s.value}>
                        {s.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="state">Practice State</Label>
                <div className="relative">
                  <MapPin className="text-muted-foreground absolute top-1/2 left-3 z-10 h-4 w-4 -translate-y-1/2" />
                  <Select value={state} onValueChange={setState}>
                    <SelectTrigger className="pl-10">
                      <SelectValue placeholder="Select state" />
                    </SelectTrigger>
                    <SelectContent>
                      {US_STATES.map((s) => (
                        <SelectItem key={s.value} value={s.value}>
                          {s.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="npi">NPI Number (Optional)</Label>
                <Input
                  id="npi"
                  placeholder="1234567890"
                  value={npi}
                  onChange={(e) => setNpi(e.target.value)}
                  maxLength={10}
                />
                <p className="text-muted-foreground text-xs">
                  10-digit National Provider Identifier
                </p>
              </div>
              <div className="space-y-3 pt-2">
                <div className="flex items-start space-x-3">
                  <Checkbox
                    id="terms"
                    checked={acceptedTerms}
                    onCheckedChange={(checked) => setAcceptedTerms(checked as boolean)}
                  />
                  <Label htmlFor="terms" className="text-sm leading-snug font-normal">
                    I agree to the{" "}
                    <Link href="/terms" className="text-teal-dark hover:underline" target="_blank">
                      Terms of Service
                    </Link>{" "}
                    and{" "}
                    <Link
                      href="/privacy"
                      className="text-teal-dark hover:underline"
                      target="_blank"
                    >
                      Privacy Policy
                    </Link>
                  </Label>
                </div>
                <div className="flex items-start space-x-3">
                  <Checkbox
                    id="baa"
                    checked={acceptedBaa}
                    onCheckedChange={(checked) => setAcceptedBaa(checked as boolean)}
                  />
                  <Label htmlFor="baa" className="text-sm leading-snug font-normal">
                    I agree to the{" "}
                    <Link href="/baa" className="text-teal-dark hover:underline" target="_blank">
                      Business Associate Agreement
                    </Link>
                  </Label>
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => setStep(1)}
                  disabled={isLoading}
                >
                  Back
                </Button>
                <Button type="submit" className="flex-1" disabled={!isStep2Valid || isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    "Create Account"
                  )}
                </Button>
              </div>
            </form>
          )}
        </div>
        <p className="text-muted-foreground text-center text-sm">
          Already have an account?{" "}
          <Link href="/login" className="text-teal-dark hover:text-teal-dark/80 font-medium">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
