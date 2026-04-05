/**
 * Patient Roster Types
 * Shared types for the responsive patient roster components
 */

import type { PatientStatus } from "@/design-system/components/ui/patient-list-card";

/**
 * View state for the patient roster
 * Controls the rendering mode of the roster
 */
export type PatientViewState = "default" | "summary" | "note" | "fullView";

/**
 * Roster width configuration by view state
 */
export const ROSTER_WIDTH_CONFIG: Record<PatientViewState, number> = {
  default: 320,
  summary: 140,
  note: 260,
  fullView: 0,
} as const;

/**
 * Card type to render based on view state
 */
export type CardRenderType = "full" | "compact" | "hidden";

/**
 * Get the card type based on view state
 */
export function getCardTypeForState(state: PatientViewState): CardRenderType {
  switch (state) {
    case "default":
      return "full";
    case "summary":
    case "note":
      return "compact";
    case "fullView":
      return "hidden";
  }
}

/**
 * Patient data structure for roster display
 */
export interface RosterPatient {
  id: string;
  name: string;
  firstName: string;
  lastName: string;
  age: number;
  dob: string;
  phone: string;
  lastActivity: string;
  status: PatientStatus;
  avatarSrc?: string;
}

/**
 * Common props for patient cards
 */
export interface PatientCardBaseProps {
  patient: RosterPatient;
  selected?: boolean;
  onSelect?: () => void;
  className?: string;
}

/**
 * Patient roster store state interface
 * This will be provided by Agent Alpha's store
 */
export interface PatientRosterState {
  viewState: PatientViewState;
  selectedPatientId: string | null;
  setViewState: (state: PatientViewState) => void;
  setSelectedPatientId: (id: string | null) => void;
}

/**
 * Animation configuration
 */
export const ROSTER_ANIMATION_CONFIG = {
  duration: 0.3,
  ease: "easeInOut" as const,
} as const;
