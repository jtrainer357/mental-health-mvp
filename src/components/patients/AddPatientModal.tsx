"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { motion, AnimatePresence } from "framer-motion";
import { X, AlertTriangle, Loader2 } from "lucide-react";

import { Button } from "@/design-system/components/ui/button";
import { Input } from "@/design-system/components/ui/input";
import { Label } from "@/design-system/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/design-system/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/design-system/components/ui/alert-dialog";
import { Text, Heading } from "@/design-system/components/ui/typography";
import { cn } from "@/design-system/lib/utils";

import {
  useCreatePatient,
  useCreatePatientForced,
  type CreatePatientData,
  type DuplicatePatientResponse,
} from "@/src/lib/queries/use-patients";
import { DEMO_PRACTICE_ID } from "@/src/lib/utils/demo-date";
import type { Patient } from "@/src/lib/supabase/types";

// ============================================================================
// CONSTANTS
// ============================================================================

const GENDER_OPTIONS = [
  { value: "M", label: "Male" },
  { value: "F", label: "Female" },
  { value: "Non-binary", label: "Non-binary" },
  { value: "Other", label: "Other" },
  { value: "Prefer not to say", label: "Prefer not to say" },
] as const;

const PRONOUNS_OPTIONS = [
  { value: "He/Him", label: "He/Him" },
  { value: "She/Her", label: "She/Her" },
  { value: "They/Them", label: "They/Them" },
  { value: "Other", label: "Other" },
] as const;

// ============================================================================
// FORM TYPES
// ============================================================================

interface PatientFormData {
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  phone: string;
  email: string;
  gender: string;
  pronouns: string;
  addressStreet: string;
  addressCity: string;
  addressState: string;
  addressZip: string;
  insuranceProvider: string;
  insuranceMemberId: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
}

// ============================================================================
// VALIDATION HELPERS
// ============================================================================

function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function isValidPhone(phone: string): boolean {
  const digitsOnly = phone.replace(/\D/g, "");
  return digitsOnly.length >= 10 && digitsOnly.length <= 15;
}

function isValidDateOfBirth(dob: string): boolean {
  if (!dob) return false;
  const date = new Date(dob);
  if (isNaN(date.getTime())) return false;
  return date < new Date();
}

function formatPhoneInput(value: string): string {
  const digits = value.replace(/\D/g, "");
  if (digits.length <= 3) return digits;
  if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
  return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6, 10)}`;
}

// ============================================================================
// COMPONENT PROPS
// ============================================================================

export interface AddPatientModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPatientCreated?: (patient: Patient) => void;
  practiceId?: string;
}

// ============================================================================
// COMPONENT
// ============================================================================

export function AddPatientModal({
  open,
  onOpenChange,
  onPatientCreated,
  practiceId = DEMO_PRACTICE_ID,
}: AddPatientModalProps) {
  const [duplicateWarning, setDuplicateWarning] = React.useState<DuplicatePatientResponse | null>(
    null
  );
  const [pendingData, setPendingData] = React.useState<CreatePatientData | null>(null);

  const createPatient = useCreatePatient();
  const createPatientForced = useCreatePatientForced();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<PatientFormData>({
    defaultValues: {
      firstName: "",
      lastName: "",
      dateOfBirth: "",
      phone: "",
      email: "",
      gender: "",
      pronouns: "",
      addressStreet: "",
      addressCity: "",
      addressState: "",
      addressZip: "",
      insuranceProvider: "",
      insuranceMemberId: "",
      emergencyContactName: "",
      emergencyContactPhone: "",
    },
  });

  const phoneValue = watch("phone");
  const emergencyPhoneValue = watch("emergencyContactPhone");

  // Format phone on change
  React.useEffect(() => {
    const formatted = formatPhoneInput(phoneValue);
    if (formatted !== phoneValue) {
      setValue("phone", formatted);
    }
  }, [phoneValue, setValue]);

  React.useEffect(() => {
    const formatted = formatPhoneInput(emergencyPhoneValue);
    if (formatted !== emergencyPhoneValue) {
      setValue("emergencyContactPhone", formatted);
    }
  }, [emergencyPhoneValue, setValue]);

  const handleClose = () => {
    reset();
    setDuplicateWarning(null);
    setPendingData(null);
    onOpenChange(false);
  };

  const handleFormSubmit = async (formData: PatientFormData) => {
    const data: CreatePatientData = {
      firstName: formData.firstName.trim(),
      lastName: formData.lastName.trim(),
      dateOfBirth: formData.dateOfBirth,
      phone: formData.phone,
      email: formData.email.toLowerCase().trim(),
      gender: formData.gender as CreatePatientData["gender"],
      pronouns: formData.pronouns as CreatePatientData["pronouns"],
      addressStreet: formData.addressStreet,
      addressCity: formData.addressCity,
      addressState: formData.addressState,
      addressZip: formData.addressZip,
      insuranceProvider: formData.insuranceProvider,
      insuranceMemberId: formData.insuranceMemberId,
      emergencyContactName: formData.emergencyContactName,
      emergencyContactPhone: formData.emergencyContactPhone,
      practiceId,
    };

    try {
      const result = await createPatient.mutateAsync(data);

      if (result.duplicate) {
        setDuplicateWarning(result.duplicate);
        setPendingData(data);
        return;
      }

      if (result.patient) {
        onPatientCreated?.(result.patient);
        handleClose();
      }
    } catch (error) {
      console.error("Failed to create patient:", error);
    }
  };

  const handleConfirmDuplicate = async () => {
    if (!pendingData) return;

    try {
      const patient = await createPatientForced.mutateAsync(pendingData);
      onPatientCreated?.(patient);
      handleClose();
    } catch (error) {
      console.error("Failed to create patient:", error);
    }
  };

  const isLoading =
    createPatient.isPending || createPatientForced.isPending || isSubmitting;

  return (
    <>
      {/* Slide-out modal using Framer Motion */}
      <AnimatePresence>
        {open && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-50 bg-black/50"
              onClick={handleClose}
              aria-hidden="true"
            />

            {/* Slide-out panel */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="bg-background fixed inset-y-0 right-0 z-50 flex w-full max-w-lg flex-col shadow-xl"
              role="dialog"
              aria-modal="true"
              aria-labelledby="add-patient-title"
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b px-6 py-4">
                <Heading level={3} id="add-patient-title">
                  Add New Patient
                </Heading>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleClose}
                  className="h-11 w-11 rounded-full"
                  aria-label="Close"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>

              {/* Form */}
              <form
                onSubmit={handleSubmit(handleFormSubmit)}
                className="flex flex-1 flex-col overflow-hidden"
              >
                <div className="flex-1 space-y-6 overflow-y-auto px-6 py-6">
                  {/* Required Fields Section */}
                  <div className="space-y-4">
                    <Text size="sm" className="font-medium text-foreground-strong">
                      Required Information
                    </Text>

                    {/* Name Row */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="firstName">
                          First Name <span className="text-destructive">*</span>
                        </Label>
                        <Input
                          id="firstName"
                          {...register("firstName", { required: "First name is required" })}
                          className={cn(errors.firstName && "border-destructive")}
                          autoComplete="given-name"
                        />
                        {errors.firstName && (
                          <Text size="xs" className="text-destructive">
                            {errors.firstName.message}
                          </Text>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="lastName">
                          Last Name <span className="text-destructive">*</span>
                        </Label>
                        <Input
                          id="lastName"
                          {...register("lastName", { required: "Last name is required" })}
                          className={cn(errors.lastName && "border-destructive")}
                          autoComplete="family-name"
                        />
                        {errors.lastName && (
                          <Text size="xs" className="text-destructive">
                            {errors.lastName.message}
                          </Text>
                        )}
                      </div>
                    </div>

                    {/* DOB */}
                    <div className="space-y-2">
                      <Label htmlFor="dateOfBirth">
                        Date of Birth <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="dateOfBirth"
                        type="date"
                        {...register("dateOfBirth", {
                          required: "Date of birth is required",
                          validate: (value) =>
                            isValidDateOfBirth(value) || "Date of birth cannot be in the future",
                        })}
                        className={cn(errors.dateOfBirth && "border-destructive")}
                        max={new Date().toISOString().split("T")[0]}
                      />
                      {errors.dateOfBirth && (
                        <Text size="xs" className="text-destructive">
                          {errors.dateOfBirth.message}
                        </Text>
                      )}
                    </div>

                    {/* Phone */}
                    <div className="space-y-2">
                      <Label htmlFor="phone">
                        Phone <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="phone"
                        type="tel"
                        {...register("phone", {
                          required: "Phone number is required",
                          validate: (value) =>
                            isValidPhone(value) || "Please enter a valid phone number",
                        })}
                        className={cn(errors.phone && "border-destructive")}
                        placeholder="(555) 123-4567"
                        autoComplete="tel"
                      />
                      {errors.phone && (
                        <Text size="xs" className="text-destructive">
                          {errors.phone.message}
                        </Text>
                      )}
                    </div>

                    {/* Email */}
                    <div className="space-y-2">
                      <Label htmlFor="email">
                        Email <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        {...register("email", {
                          required: "Email is required",
                          validate: (value) =>
                            isValidEmail(value) || "Please enter a valid email address",
                        })}
                        className={cn(errors.email && "border-destructive")}
                        placeholder="patient@example.com"
                        autoComplete="email"
                      />
                      {errors.email && (
                        <Text size="xs" className="text-destructive">
                          {errors.email.message}
                        </Text>
                      )}
                    </div>
                  </div>

                  {/* Optional Fields Section */}
                  <div className="space-y-4">
                    <Text size="sm" className="font-medium text-foreground-strong">
                      Demographics
                    </Text>

                    {/* Gender & Pronouns Row */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="gender">Gender</Label>
                        <Select onValueChange={(value) => setValue("gender", value)}>
                          <SelectTrigger id="gender">
                            <SelectValue placeholder="Select..." />
                          </SelectTrigger>
                          <SelectContent>
                            {GENDER_OPTIONS.map((option) => (
                              <SelectItem key={option.value} value={option.value}>
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="pronouns">Pronouns</Label>
                        <Select onValueChange={(value) => setValue("pronouns", value)}>
                          <SelectTrigger id="pronouns">
                            <SelectValue placeholder="Select..." />
                          </SelectTrigger>
                          <SelectContent>
                            {PRONOUNS_OPTIONS.map((option) => (
                              <SelectItem key={option.value} value={option.value}>
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>

                  {/* Address Section */}
                  <div className="space-y-4">
                    <Text size="sm" className="font-medium text-foreground-strong">
                      Address
                    </Text>

                    <div className="space-y-2">
                      <Label htmlFor="addressStreet">Street Address</Label>
                      <Input
                        id="addressStreet"
                        {...register("addressStreet")}
                        placeholder="123 Main St"
                        autoComplete="street-address"
                      />
                    </div>

                    <div className="grid grid-cols-6 gap-4">
                      <div className="col-span-3 space-y-2">
                        <Label htmlFor="addressCity">City</Label>
                        <Input
                          id="addressCity"
                          {...register("addressCity")}
                          autoComplete="address-level2"
                        />
                      </div>
                      <div className="col-span-1 space-y-2">
                        <Label htmlFor="addressState">State</Label>
                        <Input
                          id="addressState"
                          {...register("addressState")}
                          maxLength={2}
                          placeholder="PA"
                          autoComplete="address-level1"
                        />
                      </div>
                      <div className="col-span-2 space-y-2">
                        <Label htmlFor="addressZip">ZIP</Label>
                        <Input
                          id="addressZip"
                          {...register("addressZip")}
                          placeholder="12345"
                          autoComplete="postal-code"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Insurance Section */}
                  <div className="space-y-4">
                    <Text size="sm" className="font-medium text-foreground-strong">
                      Insurance
                    </Text>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="insuranceProvider">Provider</Label>
                        <Input
                          id="insuranceProvider"
                          {...register("insuranceProvider")}
                          placeholder="Blue Cross Blue Shield"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="insuranceMemberId">Member ID</Label>
                        <Input
                          id="insuranceMemberId"
                          {...register("insuranceMemberId")}
                          placeholder="ABC123456789"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Emergency Contact Section */}
                  <div className="space-y-4">
                    <Text size="sm" className="font-medium text-foreground-strong">
                      Emergency Contact
                    </Text>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="emergencyContactName">Name</Label>
                        <Input
                          id="emergencyContactName"
                          {...register("emergencyContactName")}
                          placeholder="Jane Doe"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="emergencyContactPhone">Phone</Label>
                        <Input
                          id="emergencyContactPhone"
                          type="tel"
                          {...register("emergencyContactPhone")}
                          placeholder="(555) 987-6543"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-end gap-3 border-t px-6 py-4">
                  <Button type="button" variant="outline" onClick={handleClose} disabled={isLoading}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isLoading} className="min-w-[120px]">
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      "Add Patient"
                    )}
                  </Button>
                </div>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Duplicate Warning Dialog */}
      <AlertDialog open={!!duplicateWarning} onOpenChange={() => setDuplicateWarning(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <div className="mb-2 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              <AlertDialogTitle>Possible Duplicate Patient</AlertDialogTitle>
            </div>
            <AlertDialogDescription asChild>
              <div className="space-y-2">
                <Text>{duplicateWarning?.message}</Text>
                <Text size="sm" muted>
                  Do you want to create a new patient record anyway?
                </Text>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDuplicateWarning(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDuplicate}
              disabled={createPatientForced.isPending}
            >
              {createPatientForced.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create Anyway"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

export default AddPatientModal;
