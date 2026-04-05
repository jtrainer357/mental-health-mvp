/**
 * Patients Module
 *
 * This module exports the PatientsPage component and related types.
 * The component has been decomposed into the following sub-components:
 * - PatientsPageSkeleton - Loading skeleton states
 * - PatientDetailSkeleton - Detail view loading skeleton
 * - EmptyPatients - Empty state for no patients
 * - DatabaseNotReady - State when database isn't populated
 *
 * Utility functions are in utils.ts:
 * - dbPatientToListItem - Convert DB patient to list format
 * - createPatientDetail - Convert DB data to detail format
 * - dbActionToUiAction - Convert priority action to UI format
 */

export { PatientsPage } from "./patients-page";
export type { PatientsPageProps } from "./types";
