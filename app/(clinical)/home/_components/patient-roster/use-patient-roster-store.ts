/**
 * Patient Roster Store Hooks
 *
 * Connects PatientRoster to the main patient-view-store for
 * coordinated progressive disclosure animations
 */

"use client";

import { useViewState } from "@/src/lib/stores/patient-view-store";
import type { PatientViewState } from "./types";
import { ROSTER_WIDTH_CONFIG } from "./types";

/**
 * Hook to get the current view state from the main store
 * Used by PatientRoster to coordinate animations with PatientDetailView
 */
export function usePatientRosterViewState(): PatientViewState {
  return useViewState();
}

/**
 * Hook to get roster width based on current view state
 */
export function useRosterWidth(): number {
  const viewState = useViewState();
  return ROSTER_WIDTH_CONFIG[viewState];
}

/**
 * Hook to check if roster should be visible
 */
export function useRosterVisible(): boolean {
  const viewState = useViewState();
  return viewState !== "fullView";
}

/**
 * Legacy store interface for backwards compatibility
 * Components using usePatientRosterStore should migrate to usePatientRosterViewState
 */
export const usePatientRosterStore = <T>(
  selector: (state: { viewState: PatientViewState; selectedPatientId: null }) => T
): T => {
  const viewState = useViewState();
  // Return a compatible state shape for components expecting the old interface
  return selector({ viewState, selectedPatientId: null });
};
