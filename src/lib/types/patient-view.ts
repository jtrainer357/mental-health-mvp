/**
 * Patient View Types
 * Type definitions for the Patient 360 progressive disclosure system
 */

/**
 * View states for progressive disclosure
 * - default: Full patient roster with complete header
 * - summary: Compact roster with minimal header (viewing visit summary)
 * - note: Same as summary layout (viewing full note)
 * - fullView: No roster, ultra-minimal header (immersive view)
 */
export type ViewState = "default" | "summary" | "note" | "fullView";

/**
 * Layout dimensions for each view state
 */
export interface LayoutDimensions {
  /** Width of the patient roster sidebar in pixels */
  rosterWidth: number;
  /** Height of the patient header in pixels */
  headerHeight: number;
  /** Whether the roster is visible */
  rosterVisible: boolean;
  /** Whether the header is in compact mode */
  headerCompact: boolean;
}

/**
 * Layout configuration mapped by view state
 */
export type LayoutConfig = Record<ViewState, LayoutDimensions>;

/**
 * Default layout dimensions for each view state
 */
export const LAYOUT_DIMENSIONS: LayoutConfig = {
  default: {
    rosterWidth: 400,
    headerHeight: 210,
    rosterVisible: true,
    headerCompact: false,
  },
  summary: {
    rosterWidth: 140,
    headerHeight: 110,
    rosterVisible: true,
    headerCompact: true,
  },
  note: {
    rosterWidth: 140,
    headerHeight: 110,
    rosterVisible: true,
    headerCompact: true,
  },
  fullView: {
    rosterWidth: 0,
    headerHeight: 50,
    rosterVisible: false,
    headerCompact: true,
  },
};

/**
 * Transition configuration for Framer Motion
 */
export interface TransitionConfig {
  /** Duration in seconds */
  duration: number;
  /** Easing function or preset */
  ease: readonly [number, number, number, number] | string;
  /** Whether to use spring physics */
  type?: "tween" | "spring";
}

/**
 * Default transition settings for smooth animations
 */
export const DEFAULT_TRANSITION: TransitionConfig = {
  duration: 0.3,
  ease: [0.4, 0, 0.2, 1] as const,
  type: "tween",
};

/**
 * State transition metadata
 */
export interface StateTransition {
  /** Previous state before transition */
  from: ViewState;
  /** Target state after transition */
  to: ViewState;
  /** Timestamp of the transition */
  timestamp: number;
  /** Optional trigger context (e.g., visit ID, note ID) */
  triggerId?: string;
}

/**
 * Scroll position record for each view state
 */
export type ScrollPositions = Record<ViewState, number>;

/**
 * Patient view store state interface
 */
export interface PatientViewState {
  /** Current view state */
  viewState: ViewState;
  /** Previous view state for back navigation */
  previousState: ViewState | null;
  /** History stack for multi-level back navigation */
  stateHistory: ViewState[];
  /** Currently selected visit ID (for summary view) */
  selectedVisitId: string | null;
  /** Currently selected note ID (for note view) */
  selectedNoteId: string | null;
  /** Scroll positions preserved per state */
  scrollPositions: ScrollPositions;
}

/**
 * Patient view store actions interface
 */
export interface PatientViewActions {
  /** Transition to a new view state with optional context ID */
  transitionTo: (state: ViewState, id?: string) => void;
  /** Navigate back to the previous state in history */
  goBack: () => void;
  /** Toggle between current state and fullView */
  toggleFullView: () => void;
  /** Save scroll position for current state */
  saveScrollPosition: (position: number) => void;
  /** Get scroll position for current state */
  getScrollPosition: () => number;
  /** Reset store to initial state */
  reset: () => void;
}

/**
 * Complete patient view store interface
 */
export interface PatientViewStore extends PatientViewState, PatientViewActions {}

/**
 * Hook return type with computed layout values
 */
export interface UsePatientViewStateReturn extends PatientViewStore {
  /** Current layout dimensions based on view state */
  layout: LayoutDimensions;
  /** Transition configuration for animations */
  transition: TransitionConfig;
  /** Whether currently in an expanded view (summary, note, or fullView) */
  isExpanded: boolean;
  /** Whether the roster should show compact cards */
  isRosterCompact: boolean;
  /** Whether we can navigate back */
  canGoBack: boolean;
}

/**
 * Valid transitions between states
 * Defines which state transitions are allowed
 */
export const VALID_TRANSITIONS: Record<ViewState, ViewState[]> = {
  default: ["summary", "note", "fullView"],
  summary: ["default", "note", "fullView"],
  note: ["default", "summary", "fullView"],
  fullView: ["default", "summary", "note"],
};

/**
 * Check if a transition is valid
 */
export function isValidTransition(from: ViewState, to: ViewState): boolean {
  return VALID_TRANSITIONS[from].includes(to);
}
