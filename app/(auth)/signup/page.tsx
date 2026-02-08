"use client";

import * as React from "react";
import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/design-system/components/ui/button";
import { Input } from "@/design-system/components/ui/input";
import { Label } from "@/design-system/components/ui/label";
import { Checkbox } from "@/design-system/components/ui/checkbox";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/design-system/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/design-system/components/ui/select";
import { Alert, AlertDescription } from "@/design-system/components/ui/alert";
import { AlertCircle, Eye, EyeOff, Loader2, Check, X, ArrowRight, ArrowLeft } from "lucide-react";

// Password requirements
const PASSWORD_REQUIREMENTS = [
  { label: "At least 12 characters", test: (p: string) => p.length >= 12 },
  { label: "One uppercase letter", test: (p: string) => /[A-Z]/.test(p) },
  { label: "One lowercase letter", test: (p: string) => /[a-z]/.test(p) },
  { label: "One number", test: (p: string) => /[0-9]/.test(p) },
  { label: "One special character", test: (p: string) => /[!@#$%^&*(),.?":{}|<>]/.test(p) },
];

// Practice specialties
const SPECIALTIES = [
  "Individual Therapy",
  "Group Practice",
  "Psychiatry",
  "Counseling Center",
  "Substance Abuse",
  "Child/Adolescent",
  "Couples/Family",
];

// US States
const US_STATES = [
  "Alabama", "Alaska", "Arizona", "Arkansas", "California", "Colorado", "Connecticut",
  "Delaware", "Florida", "Georgia", "Hawaii", "Idaho", "Illinois", "Indiana", "Iowa",
  "Kansas", "Kentucky", "Louisiana", "Maine", "Maryland", "Massachusetts", "Michigan",
  "Minnesota", "Mississippi", "Missouri", "Montana", "Nebraska", "Nevada", "New Hampshire",
  "New Jersey", "New Mexico", "New York", "North Carolina", "North Dakota", "Ohio",
  "Oklahoma", "Oregon", "Pennsylvania", "Rhode Island", "South Carolina", "South Dakota",
  "Tennessee", "Texas", "Utah", "Vermont", "Virginia", "Washington", "West Virginia",
  "Wisconsin", "Wyoming",
];

type SignupStep = 1 | 2;
type SignupError = "email_exists" | "network" | "validation" | null;

const ERROR_MESSAGES: Record<Exclude<SignupError, null>, string> = {
  email_exists: "An account with this email already exists.",
  network: "Unable to connect. Please check your internet connection.",
  validation: "Please fix the errors above and try again.",
};

interface FormData {
  // Step 1
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
  // Step 2
  practiceName: string;
  specialty: string;
  state: string;
  // Agreements
  acceptBaa: boolean;
  acceptTerms: boolean;
  acceptPrivacy: boolean;
}

function PasswordStrengthIndicator({ password }: { password: string }) {
  const results = PASSWORD_REQUIREMENTS.map((req) => ({
    ...req,
    passed: req.test(password),
  }));
  const passedCount = results.filter((r) => r.passed).length;
  const strength = passedCount / PASSWORD_REQUIREMENTS.length;

  const getStrengthColor = () => {
    if (strength === 0) return "bg-muted";
    if (strength < 0.4) return "bg-destructive";
    if (strength < 0.8) return "bg-warning";
    return "bg-success";
  };

  const getStrengthLabel = () => {
    if (strength === 0) return "";
    if (strength < 0.4) return "Weak";
    if (strength < 0.8) return "Fair";
    if (strength < 1) return "Good";
    return "Strong";
  };

  return (
    <div className="mt-2 space-y-2">
      {/* Strength bar */}
      <div className="flex items-center gap-2">
        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
          <div
            className={`h-full transition-all duration-300 ${getStrengthColor()}`}
            style={{ width: `${strength * 100}%` }}
          />
        </div>
        <span className="text-xs font-medium text-muted-foreground">
          {getStrengthLabel()}
        </span>
      </div>

      {/* Requirements list */}
      <ul className="grid grid-cols-1 gap-1 text-xs sm:grid-cols-2">
        {results.map((req) => (
          <li
            key={req.label}
            className={`flex items-center gap-1.5 ${
              req.passed ? "text-success" : "text-muted-foreground"
            }`}
          >
            {req.passed ? (
              <Check className="h-3 w-3" />
            ) : (
              <X className="h-3 w-3" />
            )}
            {req.label}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function SignupPage() {
  const router = useRouter();
  const [step, setStep] = useState<SignupStep>(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<SignupError>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [formData, setFormData] = useState<FormData>({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    practiceName: "",
    specialty: "",
    state: "",
    acceptBaa: false,
    acceptTerms: false,
    acceptPrivacy: false,
  });

  const [fieldErrors, setFieldErrors] = useState<Partial<Record<keyof FormData, string>>>({});

  const updateField = <K extends keyof FormData>(field: K, value: FormData[K]) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear field error when user starts typing
    if (fieldErrors[field]) {
      setFieldErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const isPasswordValid = useMemo(() => {
    return PASSWORD_REQUIREMENTS.every((req) => req.test(formData.password));
  }, [formData.password]);

  const validateStep1 = (): boolean => {
    const errors: Partial<Record<keyof FormData, string>> = {};

    if (!formData.fullName.trim()) {
      errors.fullName = "Full name is required";
    }

    if (!formData.email.trim()) {
      errors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = "Please enter a valid email address";
    }

    if (!formData.password) {
      errors.password = "Password is required";
    } else if (!isPasswordValid) {
      errors.password = "Password does not meet all requirements";
    }

    if (!formData.confirmPassword) {
      errors.confirmPassword = "Please confirm your password";
    } else if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = "Passwords do not match";
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateStep2 = (): boolean => {
    const errors: Partial<Record<keyof FormData, string>> = {};

    if (!formData.practiceName.trim()) {
      errors.practiceName = "Practice name is required";
    }

    if (!formData.specialty) {
      errors.specialty = "Please select a specialty";
    }

    if (!formData.state) {
      errors.state = "Please select a state";
    }

    if (!formData.acceptBaa) {
      errors.acceptBaa = "You must accept the BAA to continue";
    }

    if (!formData.acceptTerms) {
      errors.acceptTerms = "You must accept the Terms of Service";
    }

    if (!formData.acceptPrivacy) {
      errors.acceptPrivacy = "You must accept the Privacy Policy";
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleNextStep = () => {
    if (validateStep1()) {
      setStep(2);
      setError(null);
    }
  };

  const handlePrevStep = () => {
    setStep(1);
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!validateStep2()) {
      setError("validation");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: formData.fullName.trim(),
          email: formData.email.toLowerCase().trim(),
          password: formData.password,
          practiceName: formData.practiceName.trim(),
          specialty: formData.specialty,
          state: formData.state,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.error?.includes("exists") || data.error?.includes("duplicate")) {
          setError("email_exists");
        } else {
          setError("network");
        }
        setIsLoading(false);
        return;
      }

      // Success - redirect to home
      router.push("/home");
    } catch {
      setError("network");
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 py-8">
      <div className="w-full max-w-md space-y-8">
        {/* Logo */}
        <div className="flex justify-center">
          <Image
            src="/tebra-logo.svg"
            alt="Tebra Mental Health"
            width={140}
            height={34}
            priority
          />
        </div>

        {/* Signup Card */}
        <Card opacity="solid" className="shadow-lg">
          <CardHeader className="space-y-1 text-center">
            <CardTitle className="text-2xl font-semibold tracking-tight">
              Create your account
            </CardTitle>
            <CardDescription>
              {step === 1 ? "Step 1 of 2: Account details" : "Step 2 of 2: Practice setup"}
            </CardDescription>
            {/* Step indicator */}
            <div className="flex justify-center gap-2 pt-2">
              <div
                className={`h-1.5 w-12 rounded-full ${
                  step >= 1 ? "bg-primary" : "bg-muted"
                }`}
              />
              <div
                className={`h-1.5 w-12 rounded-full ${
                  step >= 2 ? "bg-primary" : "bg-muted"
                }`}
              />
            </div>
          </CardHeader>
          <CardContent>
            {/* Error Alert */}
            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{ERROR_MESSAGES[error]}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={step === 2 ? handleSubmit : (e) => { e.preventDefault(); handleNextStep(); }}>
              {step === 1 ? (
                <div className="space-y-4">
                  {/* Full Name */}
                  <div className="space-y-2">
                    <Label htmlFor="fullName">Full Name</Label>
                    <Input
                      id="fullName"
                      type="text"
                      placeholder="Dr. Jane Smith"
                      value={formData.fullName}
                      onChange={(e) => updateField("fullName", e.target.value)}
                      disabled={isLoading}
                      className={fieldErrors.fullName ? "border-destructive" : ""}
                      autoComplete="name"
                    />
                    {fieldErrors.fullName && (
                      <p className="text-sm text-destructive">{fieldErrors.fullName}</p>
                    )}
                  </div>

                  {/* Email */}
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="you@practice.com"
                      value={formData.email}
                      onChange={(e) => updateField("email", e.target.value)}
                      disabled={isLoading}
                      className={fieldErrors.email ? "border-destructive" : ""}
                      autoComplete="email"
                    />
                    {fieldErrors.email && (
                      <p className="text-sm text-destructive">{fieldErrors.email}</p>
                    )}
                  </div>

                  {/* Password */}
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Create a strong password"
                        value={formData.password}
                        onChange={(e) => updateField("password", e.target.value)}
                        disabled={isLoading}
                        className={`pr-10 ${fieldErrors.password ? "border-destructive" : ""}`}
                        autoComplete="new-password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        aria-label={showPassword ? "Hide password" : "Show password"}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    <PasswordStrengthIndicator password={formData.password} />
                    {fieldErrors.password && (
                      <p className="text-sm text-destructive">{fieldErrors.password}</p>
                    )}
                  </div>

                  {/* Confirm Password */}
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm Password</Label>
                    <div className="relative">
                      <Input
                        id="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="Confirm your password"
                        value={formData.confirmPassword}
                        onChange={(e) => updateField("confirmPassword", e.target.value)}
                        disabled={isLoading}
                        className={`pr-10 ${fieldErrors.confirmPassword ? "border-destructive" : ""}`}
                        autoComplete="new-password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                      >
                        {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    {fieldErrors.confirmPassword && (
                      <p className="text-sm text-destructive">{fieldErrors.confirmPassword}</p>
                    )}
                  </div>

                  {/* Next Button */}
                  <Button type="submit" className="w-full h-12" disabled={isLoading}>
                    Continue
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Practice Name */}
                  <div className="space-y-2">
                    <Label htmlFor="practiceName">Practice Name</Label>
                    <Input
                      id="practiceName"
                      type="text"
                      placeholder="Serenity Mental Health"
                      value={formData.practiceName}
                      onChange={(e) => updateField("practiceName", e.target.value)}
                      disabled={isLoading}
                      className={fieldErrors.practiceName ? "border-destructive" : ""}
                      autoComplete="organization"
                    />
                    {fieldErrors.practiceName && (
                      <p className="text-sm text-destructive">{fieldErrors.practiceName}</p>
                    )}
                  </div>

                  {/* Specialty */}
                  <div className="space-y-2">
                    <Label htmlFor="specialty">Specialty</Label>
                    <Select
                      value={formData.specialty}
                      onValueChange={(value) => updateField("specialty", value)}
                      disabled={isLoading}
                    >
                      <SelectTrigger
                        id="specialty"
                        className={fieldErrors.specialty ? "border-destructive" : ""}
                      >
                        <SelectValue placeholder="Select your specialty" />
                      </SelectTrigger>
                      <SelectContent>
                        {SPECIALTIES.map((specialty) => (
                          <SelectItem key={specialty} value={specialty}>
                            {specialty}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {fieldErrors.specialty && (
                      <p className="text-sm text-destructive">{fieldErrors.specialty}</p>
                    )}
                  </div>

                  {/* State */}
                  <div className="space-y-2">
                    <Label htmlFor="state">State</Label>
                    <Select
                      value={formData.state}
                      onValueChange={(value) => updateField("state", value)}
                      disabled={isLoading}
                    >
                      <SelectTrigger
                        id="state"
                        className={fieldErrors.state ? "border-destructive" : ""}
                      >
                        <SelectValue placeholder="Select your state" />
                      </SelectTrigger>
                      <SelectContent>
                        {US_STATES.map((state) => (
                          <SelectItem key={state} value={state}>
                            {state}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {fieldErrors.state && (
                      <p className="text-sm text-destructive">{fieldErrors.state}</p>
                    )}
                  </div>

                  {/* Legal Agreements */}
                  <div className="space-y-3 pt-2">
                    <div className="flex items-start space-x-2">
                      <Checkbox
                        id="acceptBaa"
                        checked={formData.acceptBaa}
                        onCheckedChange={(checked) => updateField("acceptBaa", checked === true)}
                        disabled={isLoading}
                        className="mt-0.5"
                      />
                      <div>
                        <Label htmlFor="acceptBaa" className="text-sm font-normal cursor-pointer">
                          I accept the{" "}
                          <Link href="/baa" className="text-teal-dark hover:underline" target="_blank">
                            Business Associate Agreement (BAA)
                          </Link>
                        </Label>
                        {fieldErrors.acceptBaa && (
                          <p className="text-sm text-destructive">{fieldErrors.acceptBaa}</p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-start space-x-2">
                      <Checkbox
                        id="acceptTerms"
                        checked={formData.acceptTerms}
                        onCheckedChange={(checked) => updateField("acceptTerms", checked === true)}
                        disabled={isLoading}
                        className="mt-0.5"
                      />
                      <div>
                        <Label htmlFor="acceptTerms" className="text-sm font-normal cursor-pointer">
                          I accept the{" "}
                          <Link href="/terms" className="text-teal-dark hover:underline" target="_blank">
                            Terms of Service
                          </Link>
                        </Label>
                        {fieldErrors.acceptTerms && (
                          <p className="text-sm text-destructive">{fieldErrors.acceptTerms}</p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-start space-x-2">
                      <Checkbox
                        id="acceptPrivacy"
                        checked={formData.acceptPrivacy}
                        onCheckedChange={(checked) => updateField("acceptPrivacy", checked === true)}
                        disabled={isLoading}
                        className="mt-0.5"
                      />
                      <div>
                        <Label htmlFor="acceptPrivacy" className="text-sm font-normal cursor-pointer">
                          I accept the{" "}
                          <Link href="/privacy" className="text-teal-dark hover:underline" target="_blank">
                            Privacy Policy
                          </Link>
                        </Label>
                        {fieldErrors.acceptPrivacy && (
                          <p className="text-sm text-destructive">{fieldErrors.acceptPrivacy}</p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Navigation Buttons */}
                  <div className="flex gap-3 pt-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handlePrevStep}
                      disabled={isLoading}
                      className="flex-1 h-12"
                    >
                      <ArrowLeft className="mr-2 h-4 w-4" />
                      Back
                    </Button>
                    <Button type="submit" className="flex-1 h-12" disabled={isLoading}>
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
                </div>
              )}
            </form>

            {/* Sign In Link */}
            <div className="mt-6 text-center text-sm">
              <span className="text-muted-foreground">Already have an account? </span>
              <Link href="/login" className="font-medium text-teal-dark hover:underline">
                Sign in
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
