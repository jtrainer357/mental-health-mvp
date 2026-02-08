"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { Loader2, Check, X, Pencil } from "lucide-react";
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
import { Text } from "@/design-system/components/ui/typography";
import { cn } from "@/design-system/lib/utils";
import { useUpdatePatient, type UpdatePatientData } from "@/src/lib/queries/use-patients";
import { DEMO_PRACTICE_ID } from "@/src/lib/utils/demo-date";
import type { Patient } from "@/src/lib/supabase/types";
import { toast } from "sonner";

export interface EditPatientDemographicsProps {
  patient: Patient;
  practiceId?: string;
  onUpdate?: (patient: Patient) => void;
  className?: string;
}

interface FormData {
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  phone: string;
  email: string;
  gender: string;
  addressStreet: string;
  addressCity: string;
  addressState: string;
  addressZip: string;
}

/**
 * Format phone number as (XXX) XXX-XXXX
 */
function formatPhoneNumber(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 10);
  if (digits.length === 0) return "";
  if (digits.length <= 3) return `(${digits}`;
  if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
  return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
}

/**
 * Parse phone from database format (digits only) to display format
 */
function parsePhone(phone: string | null): string {
  if (!phone) return "";
  return formatPhoneNumber(phone);
}

export function EditPatientDemographics({
  patient,
  practiceId = DEMO_PRACTICE_ID,
  onUpdate,
  className,
}: EditPatientDemographicsProps) {
  const [isEditing, setIsEditing] = React.useState(false);
  const updatePatient = useUpdatePatient();

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
    reset,
    setValue,
    watch,
  } = useForm<FormData>({
    defaultValues: {
      firstName: patient.first_name || "",
      lastName: patient.last_name || "",
      dateOfBirth: patient.date_of_birth || "",
      phone: parsePhone(patient.phone_mobile),
      email: patient.email || "",
      gender: patient.gender || "",
      addressStreet: patient.address_street || "",
      addressCity: patient.address_city || "",
      addressState: patient.address_state || "",
      addressZip: patient.address_zip || "",
    },
  });

  const phoneValue = watch("phone");

  // Format phone on change
  React.useEffect(() => {
    const formatted = formatPhoneNumber(phoneValue || "");
    if (formatted !== phoneValue) {
      setValue("phone", formatted);
    }
  }, [phoneValue, setValue]);

  // Reset form when patient changes
  React.useEffect(() => {
    reset({
      firstName: patient.first_name || "",
      lastName: patient.last_name || "",
      dateOfBirth: patient.date_of_birth || "",
      phone: parsePhone(patient.phone_mobile),
      email: patient.email || "",
      gender: patient.gender || "",
      addressStreet: patient.address_street || "",
      addressCity: patient.address_city || "",
      addressState: patient.address_state || "",
      addressZip: patient.address_zip || "",
    });
  }, [patient, reset]);

  const handleCancel = () => {
    reset();
    setIsEditing(false);
  };

  const onSubmit = async (data: FormData) => {
    const updateData: UpdatePatientData = {};

    // Only include changed fields
    if (data.firstName !== patient.first_name) updateData.firstName = data.firstName.trim();
    if (data.lastName !== patient.last_name) updateData.lastName = data.lastName.trim();
    if (data.dateOfBirth !== patient.date_of_birth) updateData.dateOfBirth = data.dateOfBirth;
    if (data.phone.replace(/\D/g, "") !== patient.phone_mobile)
      updateData.phone = data.phone.replace(/\D/g, "");
    if (data.email.toLowerCase().trim() !== patient.email)
      updateData.email = data.email.toLowerCase().trim();
    if (data.gender !== patient.gender)
      updateData.gender = data.gender as UpdatePatientData["gender"];
    if (data.addressStreet !== patient.address_street) updateData.addressStreet = data.addressStreet;
    if (data.addressCity !== patient.address_city) updateData.addressCity = data.addressCity;
    if (data.addressState !== patient.address_state) updateData.addressState = data.addressState;
    if (data.addressZip !== patient.address_zip) updateData.addressZip = data.addressZip;

    // If nothing changed, just close
    if (Object.keys(updateData).length === 0) {
      setIsEditing(false);
      return;
    }

    try {
      const updatedPatient = await updatePatient.mutateAsync({
        patientId: patient.id,
        practiceId,
        data: updateData,
      });
      onUpdate?.(updatedPatient);
      setIsEditing(false);
      toast.success("Patient demographics updated");
    } catch (error) {
      console.error("Failed to update patient:", error);
      toast.error("Failed to update patient demographics");
    }
  };

  if (!isEditing) {
    return (
      <div className={cn("relative", className)}>
        <Button
          variant="ghost"
          size="sm"
          className="absolute -top-1 right-0 h-8 gap-1.5"
          onClick={() => setIsEditing(true)}
        >
          <Pencil className="h-3.5 w-3.5" />
          Edit
        </Button>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Text size="xs" muted className="uppercase tracking-wide">
              Name
            </Text>
            <Text className="mt-1">
              {patient.first_name} {patient.last_name}
            </Text>
          </div>
          <div>
            <Text size="xs" muted className="uppercase tracking-wide">
              Date of Birth
            </Text>
            <Text className="mt-1">{patient.date_of_birth}</Text>
          </div>
          <div>
            <Text size="xs" muted className="uppercase tracking-wide">
              Phone
            </Text>
            <Text className="mt-1">{parsePhone(patient.phone_mobile) || "—"}</Text>
          </div>
          <div>
            <Text size="xs" muted className="uppercase tracking-wide">
              Email
            </Text>
            <Text className="mt-1">{patient.email || "—"}</Text>
          </div>
          <div>
            <Text size="xs" muted className="uppercase tracking-wide">
              Gender
            </Text>
            <Text className="mt-1">{patient.gender || "—"}</Text>
          </div>
          <div>
            <Text size="xs" muted className="uppercase tracking-wide">
              Address
            </Text>
            <Text className="mt-1">
              {patient.address_street ? (
                <>
                  {patient.address_street}
                  <br />
                  {patient.address_city}, {patient.address_state} {patient.address_zip}
                </>
              ) : (
                "—"
              )}
            </Text>
          </div>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className={cn("space-y-4", className)}>
      <div className="flex items-center justify-between">
        <Text weight="medium">Edit Demographics</Text>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleCancel}
            disabled={updatePatient.isPending}
            className="h-8 gap-1.5"
          >
            <X className="h-3.5 w-3.5" />
            Cancel
          </Button>
          <Button
            type="submit"
            size="sm"
            disabled={updatePatient.isPending || !isDirty}
            className="h-8 gap-1.5"
          >
            {updatePatient.isPending ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Check className="h-3.5 w-3.5" />
                Save
              </>
            )}
          </Button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="firstName">
            First Name <span className="text-destructive">*</span>
          </Label>
          <Input
            id="firstName"
            {...register("firstName", { required: "First name is required" })}
            className={cn("min-h-[44px]", errors.firstName && "border-destructive")}
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
            className={cn("min-h-[44px]", errors.lastName && "border-destructive")}
          />
          {errors.lastName && (
            <Text size="xs" className="text-destructive">
              {errors.lastName.message}
            </Text>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="dateOfBirth">
            Date of Birth <span className="text-destructive">*</span>
          </Label>
          <Input
            id="dateOfBirth"
            type="date"
            {...register("dateOfBirth", { required: "Date of birth is required" })}
            className={cn("min-h-[44px]", errors.dateOfBirth && "border-destructive")}
          />
          {errors.dateOfBirth && (
            <Text size="xs" className="text-destructive">
              {errors.dateOfBirth.message}
            </Text>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="gender">Gender</Label>
          <Select
            defaultValue={patient.gender || ""}
            onValueChange={(val) => setValue("gender", val, { shouldDirty: true })}
          >
            <SelectTrigger className="min-h-[44px]">
              <SelectValue placeholder="Select gender" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="M">Male</SelectItem>
              <SelectItem value="F">Female</SelectItem>
              <SelectItem value="Non-binary">Non-binary</SelectItem>
              <SelectItem value="Other">Other</SelectItem>
              <SelectItem value="Prefer not to say">Prefer not to say</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone">Phone</Label>
          <Input
            id="phone"
            type="tel"
            {...register("phone", {
              pattern: {
                value: /^\(\d{3}\) \d{3}-\d{4}$|^$/,
                message: "Invalid phone format",
              },
            })}
            placeholder="(555) 123-4567"
            className={cn("min-h-[44px]", errors.phone && "border-destructive")}
          />
          {errors.phone && (
            <Text size="xs" className="text-destructive">
              {errors.phone.message}
            </Text>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            {...register("email", {
              pattern: {
                value: /^[^\s@]+@[^\s@]+\.[^\s@]+$|^$/,
                message: "Invalid email format",
              },
            })}
            placeholder="patient@email.com"
            className={cn("min-h-[44px]", errors.email && "border-destructive")}
          />
          {errors.email && (
            <Text size="xs" className="text-destructive">
              {errors.email.message}
            </Text>
          )}
        </div>
      </div>

      <div className="space-y-4 pt-2">
        <Text weight="medium" size="sm">
          Address
        </Text>

        <div className="space-y-2">
          <Label htmlFor="addressStreet">Street</Label>
          <Input id="addressStreet" {...register("addressStreet")} className="min-h-[44px]" />
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="addressCity">City</Label>
            <Input id="addressCity" {...register("addressCity")} className="min-h-[44px]" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="addressState">State</Label>
            <Input
              id="addressState"
              {...register("addressState")}
              maxLength={2}
              placeholder="CA"
              className="min-h-[44px]"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="addressZip">ZIP</Label>
            <Input
              id="addressZip"
              {...register("addressZip")}
              maxLength={10}
              placeholder="12345"
              className="min-h-[44px]"
            />
          </div>
        </div>
      </div>
    </form>
  );
}
