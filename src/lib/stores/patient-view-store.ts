/**
 * Patient View Store
 * Zustand store for managing Patient 360 progressive disclosure state
 */

import { create } from "zustand";
import { useShallow } from "zustand/react/shallow";
import type { ViewState, PatientViewStore, ScrollPositions } from "@/src/lib/types/patient-view";
import { isValidTransition } from "@/src/lib/types/patient-view";

/**
 * Initial scroll positions for all states
 */
const initialScrollPositions: ScrollPositions = {
  default: 0,
  summary: 0,
  note: 0,
  fullView: 0,
};

/**
 * Maximum history stack size to prevent memory issues
 */
const MAX_HISTORY_SIZE = 10;

/**
 * Patient View Store
 * Manages view state, navigation history, and scroll positions
 * for the Patient 360 progressive disclosure system
 */
export const usePatientViewStore = create<PatientViewStore>()((set, get) => ({
  // Initial state
  viewState: "default" as ViewState,
  previousState: null,
  stateHistory: [],
  selectedVisitId: null,
  selectedNoteId: null,
  scrollPositions: { ...initialScrollPositions },

  /**
   * Transition to a new view state
   */
  transitionTo: (state: ViewState, id?: string) => {
    const { viewState: currentState, stateHistory, scrollPositions } = get();

    if (currentState === state && !id) {
      return;
    }

    if (!isValidTransition(currentState, state)) {
      console.warn(`Invalid state transition: ${currentState} -> ${state}`);
      return;
    }

    const newHistory = [...stateHistory, currentState].slice(-MAX_HISTORY_SIZE);

    const idUpdates: { selectedVisitId: string | null; selectedNoteId: string | null } = {
      selectedVisitId: get().selectedVisitId,
      selectedNoteId: get().selectedNoteId,
    };

    if (state === "summary" && id) {
      idUpdates.selectedVisitId = id;
    } else if ((state === "note" || state === "fullView") && id) {
      idUpdates.selectedVisitId = id;
      idUpdates.selectedNoteId = id;
    }

    if (state === "default") {
      idUpdates.selectedVisitId = null;
      idUpdates.selectedNoteId = null;
    }

    set({
      viewState: state,
      previousState: currentState,
      stateHistory: newHistory,
      ...idUpdates,
      scrollPositions: {
        ...scrollPositions,
        [state]: 0,
      },
    });
  },

  /**
   * Navigate back to the previous state in history
   */
  goBack: () => {
    const { stateHistory, viewState: currentState } = get();

    if (stateHistory.length === 0) {
      if (currentState !== "default") {
        set({
          viewState: "default",
          previousState: currentState,
          stateHistory: [],
          selectedVisitId: null,
          selectedNoteId: null,
        });
      }
      return;
    }

    const newHistory = [...stateHistory];
    const previousState = newHistory.pop() ?? "default";

    const idUpdates: { selectedVisitId: string | null; selectedNoteId: string | null } = {
      selectedVisitId: get().selectedVisitId,
      selectedNoteId: get().selectedNoteId,
    };

    if (previousState === "default") {
      idUpdates.selectedVisitId = null;
      idUpdates.selectedNoteId = null;
    } else if (previousState === "summary") {
      idUpdates.selectedNoteId = null;
    }

    set({
      viewState: previousState,
      previousState: currentState,
      stateHistory: newHistory,
      ...idUpdates,
    });
  },

  /**
   * Toggle between current state and fullView
   */
  toggleFullView: () => {
    const { viewState: currentState } = get();

    if (currentState === "fullView") {
      get().goBack();
    } else {
      get().transitionTo("fullView");
    }
  },

  /**
   * Save scroll position for current state
   */
  saveScrollPosition: (position: number) => {
    const { viewState, scrollPositions } = get();

    set({
      scrollPositions: {
        ...scrollPositions,
        [viewState]: position,
      },
    });
  },

  /**
   * Get scroll position for current state
   */
  getScrollPosition: () => {
    const { viewState, scrollPositions } = get();
    return scrollPositions[viewState];
  },

  /**
   * Reset store to initial state
   */
  reset: () => {
    set({
      viewState: "default",
      previousState: null,
      stateHistory: [],
      selectedVisitId: null,
      selectedNoteId: null,
      scrollPositions: { ...initialScrollPositions },
    });
  },
}));

/**
 * Hook for hydration - now just returns true since no persistence
 */
export const usePatientViewHydration = () => true;

// ============================================================================
// Selector Hooks
// ============================================================================

/**
 * Get current view state only
 */
export const useViewState = () => usePatientViewStore((state) => state.viewState);

/**
 * Get navigation-related state and actions
 */
export const usePatientViewNavigation = () =>
  usePatientViewStore(
    useShallow((state) => ({
      viewState: state.viewState,
      previousState: state.previousState,
      canGoBack: state.stateHistory.length > 0 || state.viewState !== "default",
      transitionTo: state.transitionTo,
      goBack: state.goBack,
      toggleFullView: state.toggleFullView,
    }))
  );

/**
 * Get selected IDs for visit/note context
 */
export const useSelectedIds = () =>
  usePatientViewStore(
    useShallow((state) => ({
      selectedVisitId: state.selectedVisitId,
      selectedNoteId: state.selectedNoteId,
    }))
  );

/**
 * Get scroll position utilities
 */
export const useScrollPosition = () =>
  usePatientViewStore(
    useShallow((state) => ({
      saveScrollPosition: state.saveScrollPosition,
      getScrollPosition: state.getScrollPosition,
      currentPosition: state.scrollPositions[state.viewState],
    }))
  );

/**
 * Check if in expanded view (not default)
 */
export const useIsExpanded = () => usePatientViewStore((state) => state.viewState !== "default");

/**
 * Check if roster should be compact
 */
export const useIsRosterCompact = () =>
  usePatientViewStore(
    (state) =>
      state.viewState === "summary" || state.viewState === "note" || state.viewState === "fullView"
  );

/**
 * Get reset function for clearing state
 */
export const usePatientViewReset = () => usePatientViewStore((state) => state.reset);
