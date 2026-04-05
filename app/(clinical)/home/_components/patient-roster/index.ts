/**
 * Patient Roster Components
 * Responsive patient list with three render modes and Framer Motion animations
 */

// Main roster component
export { PatientRoster, PatientRosterControlled } from "./PatientRoster";

// Card variants
export { PatientCardFull } from "./PatientCardFull";
export { PatientCardCompact, PatientCardCompactHorizontal } from "./PatientCardCompact";

// Store and hooks
export {
  usePatientRosterStore,
  useRosterWidth,
  useRosterVisible,
} from "./use-patient-roster-store";

// Types
export type {
  PatientViewState,
  CardRenderType,
  RosterPatient,
  PatientCardBaseProps,
  PatientRosterState,
} from "./types";

export { ROSTER_WIDTH_CONFIG, ROSTER_ANIMATION_CONFIG, getCardTypeForState } from "./types";
