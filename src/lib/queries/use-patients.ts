/**
 * Patient React Query Hooks
 * Provides cached data fetching for patient-related queries
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { patientKeys } from "./keys";
import {
  getPatients,
  getPatientById,
  getPatientAppointments,
  getPatientOutcomeMeasures,
  getPatientMessages,
  getPatientInvoices,
  getPatientDetails,
  searchPatients,
  getHighRiskPatients,
  getPatientVisitSummaries,
} from "./patients";
import { getPatientPriorityActions, completeAllPatientActions } from "./priority-actions";
import { DEMO_PRACTICE_ID } from "@/src/lib/utils/demo-date";

/**
 * Hook to fetch all patients for a practice
 */
export function usePatients(practiceId: string = DEMO_PRACTICE_ID) {
  return useQuery({
    queryKey: patientKeys.list(practiceId),
    queryFn: () => getPatients(practiceId),
  });
}

/**
 * Hook to fetch a single patient by ID
 */
export function usePatient(patientId: string, practiceId: string = DEMO_PRACTICE_ID) {
  return useQuery({
    queryKey: patientKeys.detail(patientId),
    queryFn: () => getPatientById(patientId, practiceId),
    enabled: !!patientId,
  });
}

/**
 * Hook to fetch complete patient details with all related data
 */
export function usePatientDetails(patientId: string) {
  return useQuery({
    queryKey: patientKeys.detail(patientId),
    queryFn: () => getPatientDetails(patientId),
    enabled: !!patientId,
  });
}

/**
 * Hook to fetch patient appointments
 */
export function usePatientAppointments(patientId: string, practiceId: string = DEMO_PRACTICE_ID) {
  return useQuery({
    queryKey: patientKeys.appointments(patientId),
    queryFn: () => getPatientAppointments(patientId, practiceId),
    enabled: !!patientId,
  });
}

/**
 * Hook to fetch patient outcome measures
 */
export function usePatientOutcomeMeasures(
  patientId: string,
  practiceId: string = DEMO_PRACTICE_ID
) {
  return useQuery({
    queryKey: patientKeys.outcomeMeasures(patientId),
    queryFn: () => getPatientOutcomeMeasures(patientId, practiceId),
    enabled: !!patientId,
  });
}

/**
 * Hook to fetch patient messages
 */
export function usePatientMessages(patientId: string, practiceId: string = DEMO_PRACTICE_ID) {
  return useQuery({
    queryKey: patientKeys.messages(patientId),
    queryFn: () => getPatientMessages(patientId, practiceId),
    enabled: !!patientId,
  });
}

/**
 * Hook to fetch patient invoices
 */
export function usePatientInvoices(patientId: string, practiceId: string = DEMO_PRACTICE_ID) {
  return useQuery({
    queryKey: patientKeys.invoices(patientId),
    queryFn: () => getPatientInvoices(patientId, practiceId),
    enabled: !!patientId,
  });
}

/**
 * Hook to fetch patient visit summaries
 */
export function usePatientVisitSummaries(patientId: string, practiceId: string = DEMO_PRACTICE_ID) {
  return useQuery({
    queryKey: patientKeys.visitSummaries(patientId),
    queryFn: () => getPatientVisitSummaries(patientId, practiceId),
    enabled: !!patientId,
  });
}

/**
 * Hook to fetch patient priority actions
 */
export function usePatientPriorityActions(
  patientId: string,
  practiceId: string = DEMO_PRACTICE_ID
) {
  return useQuery({
    queryKey: patientKeys.priorityActions(patientId),
    queryFn: () => getPatientPriorityActions(patientId, practiceId),
    enabled: !!patientId,
  });
}

/**
 * Hook to search patients by name
 */
export function usePatientSearch(query: string, practiceId: string = DEMO_PRACTICE_ID) {
  return useQuery({
    queryKey: patientKeys.search(query, practiceId),
    queryFn: () => searchPatients(query, practiceId),
    enabled: query.length >= 2, // Only search with 2+ characters
  });
}

/**
 * Hook to fetch high-risk patients
 */
export function useHighRiskPatients(practiceId: string = DEMO_PRACTICE_ID) {
  return useQuery({
    queryKey: patientKeys.highRisk(practiceId),
    queryFn: () => getHighRiskPatients(practiceId),
  });
}

/**
 * Mutation hook to complete all patient actions
 */
export function useCompleteAllPatientActions() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      patientId,
      practiceId = DEMO_PRACTICE_ID,
    }: {
      patientId: string;
      practiceId?: string;
    }) => completeAllPatientActions(patientId, practiceId),
    onSuccess: (_, { patientId }) => {
      // Invalidate the patient's priority actions
      queryClient.invalidateQueries({ queryKey: patientKeys.priorityActions(patientId) });
      // Also invalidate the main priority actions list
      queryClient.invalidateQueries({ queryKey: ["priority-actions"] });
    },
  });
}

// ============================================================================
// PATIENT MUTATION TYPES
// ============================================================================

export interface CreatePatientData {
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  phone: string;
  email: string;
  gender?: "M" | "F" | "Non-binary" | "Other" | "Prefer not to say";
  pronouns?: "He/Him" | "She/Her" | "They/Them" | "Other";
  addressStreet?: string;
  addressCity?: string;
  addressState?: string;
  addressZip?: string;
  insuranceProvider?: string;
  insuranceMemberId?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  practiceId: string;
}

export interface UpdatePatientData {
  firstName?: string;
  lastName?: string;
  dateOfBirth?: string;
  phone?: string;
  email?: string;
  gender?: "M" | "F" | "Non-binary" | "Other" | "Prefer not to say";
  pronouns?: "He/Him" | "She/Her" | "They/Them" | "Other";
  addressStreet?: string;
  addressCity?: string;
  addressState?: string;
  addressZip?: string;
  insuranceProvider?: string;
  insuranceMemberId?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
}

export type PatientStatus = "Active" | "Inactive" | "Discharged" | "New";

export interface UpdatePatientStatusData {
  status: PatientStatus;
  reason?: string;
}

export interface DuplicatePatientResponse {
  error: "duplicate_found";
  message: string;
  existingPatient: {
    id: string;
    first_name: string;
    last_name: string;
    date_of_birth: string;
  };
}

// ============================================================================
// PATIENT MUTATION API FUNCTIONS
// ============================================================================

async function createPatientApi(data: CreatePatientData): Promise<{
  patient?: Patient;
  duplicate?: DuplicatePatientResponse;
}> {
  const response = await fetch("/api/patients", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  const result = await response.json();

  if (response.status === 409) {
    return { duplicate: result as DuplicatePatientResponse };
  }

  if (!response.ok) {
    throw new Error(result.error || "Failed to create patient");
  }

  return { patient: result.patient };
}

async function createPatientForcedApi(data: CreatePatientData): Promise<Patient> {
  const response = await fetch("/api/patients?force=true", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...data, force: true }),
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.error || "Failed to create patient");
  }

  return result.patient;
}

async function updatePatientApi(
  patientId: string,
  practiceId: string,
  data: UpdatePatientData
): Promise<Patient> {
  const response = await fetch(`/api/patients/${patientId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...data, practiceId }),
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.error || "Failed to update patient");
  }

  return result.patient;
}

async function updatePatientStatusApi(
  patientId: string,
  practiceId: string,
  data: UpdatePatientStatusData
): Promise<Patient> {
  const response = await fetch(`/api/patients/${patientId}/status`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...data, practiceId }),
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.error || "Failed to update patient status");
  }

  return result.patient;
}

async function archivePatientApi(patientId: string, practiceId: string): Promise<void> {
  const response = await fetch(`/api/patients/${patientId}`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ practiceId }),
  });

  if (!response.ok) {
    const result = await response.json();
    throw new Error(result.error || "Failed to archive patient");
  }
}

// ============================================================================
// PATIENT MUTATION HOOKS
// ============================================================================

import type { Patient } from "@/src/lib/supabase/types";

/**
 * Mutation hook to create a new patient
 * Returns duplicate info if a matching patient exists
 */
export function useCreatePatient() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreatePatientData) => createPatientApi(data),
    onSuccess: (result, variables) => {
      if (result.patient) {
        // Invalidate the patient list to refetch
        queryClient.invalidateQueries({ queryKey: patientKeys.list(variables.practiceId) });
      }
    },
  });
}

/**
 * Mutation hook to create a patient even if duplicate exists
 */
export function useCreatePatientForced() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreatePatientData) => createPatientForcedApi(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: patientKeys.list(variables.practiceId) });
    },
  });
}

/**
 * Mutation hook to update patient demographics
 * Uses optimistic updates for instant UI feedback
 */
export function useUpdatePatient() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      patientId,
      practiceId = DEMO_PRACTICE_ID,
      data,
    }: {
      patientId: string;
      practiceId?: string;
      data: UpdatePatientData;
    }) => updatePatientApi(patientId, practiceId, data),
    onMutate: async ({ patientId, data }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: patientKeys.detail(patientId) });

      // Snapshot previous value
      const previousPatient = queryClient.getQueryData<Patient>(patientKeys.detail(patientId));

      // Optimistically update
      if (previousPatient) {
        queryClient.setQueryData<Patient>(patientKeys.detail(patientId), {
          ...previousPatient,
          first_name: data.firstName ?? previousPatient.first_name,
          last_name: data.lastName ?? previousPatient.last_name,
          date_of_birth: data.dateOfBirth ?? previousPatient.date_of_birth,
          phone_mobile: data.phone ?? previousPatient.phone_mobile,
          email: data.email ?? previousPatient.email,
          gender: data.gender ?? previousPatient.gender,
          address_street: data.addressStreet ?? previousPatient.address_street,
          address_city: data.addressCity ?? previousPatient.address_city,
          address_state: data.addressState ?? previousPatient.address_state,
          address_zip: data.addressZip ?? previousPatient.address_zip,
          insurance_provider: data.insuranceProvider ?? previousPatient.insurance_provider,
          insurance_member_id: data.insuranceMemberId ?? previousPatient.insurance_member_id,
          updated_at: new Date().toISOString(),
        });
      }

      return { previousPatient };
    },
    onError: (_, { patientId }, context) => {
      // Rollback on error
      if (context?.previousPatient) {
        queryClient.setQueryData(patientKeys.detail(patientId), context.previousPatient);
      }
    },
    onSettled: (_, __, { patientId, practiceId }) => {
      // Refetch to ensure consistency
      queryClient.invalidateQueries({ queryKey: patientKeys.detail(patientId) });
      queryClient.invalidateQueries({ queryKey: patientKeys.list(practiceId || DEMO_PRACTICE_ID) });
    },
  });
}

/**
 * Mutation hook to update patient status
 */
export function useUpdatePatientStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      patientId,
      practiceId = DEMO_PRACTICE_ID,
      data,
    }: {
      patientId: string;
      practiceId?: string;
      data: UpdatePatientStatusData;
    }) => updatePatientStatusApi(patientId, practiceId, data),
    onSuccess: (_, { patientId, practiceId }) => {
      queryClient.invalidateQueries({ queryKey: patientKeys.detail(patientId) });
      queryClient.invalidateQueries({ queryKey: patientKeys.list(practiceId || DEMO_PRACTICE_ID) });
    },
  });
}

/**
 * Mutation hook to archive (soft delete) a patient
 */
export function useArchivePatient() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      patientId,
      practiceId = DEMO_PRACTICE_ID,
    }: {
      patientId: string;
      practiceId?: string;
    }) => archivePatientApi(patientId, practiceId),
    onSuccess: (_, { patientId, practiceId }) => {
      // Remove from cache and refetch list
      queryClient.removeQueries({ queryKey: patientKeys.detail(patientId) });
      queryClient.invalidateQueries({ queryKey: patientKeys.list(practiceId || DEMO_PRACTICE_ID) });
    },
  });
}
