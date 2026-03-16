export { useKeyboardNav } from "./useKeyboardNav";
export { useSwipeGesture } from "./useSwipeGesture";
export { useScrollDirection } from "./useScrollDirection";
export { useMobileDetect } from "./useMobileDetect";
export { useReducedMotion } from "./useReducedMotion";

export { useToast, toast } from "./useToast";
export type { ToastType, ToastOptions, PromiseToastOptions } from "./useToast";

export { useErrorHandler } from "./useErrorHandler";
export type { ErrorSeverity, ErrorHandlerOptions } from "./useErrorHandler";

// Keyboard Navigation
export { useEscapeKey, useEscapeKeyHandler } from "./useEscapeKey";
export type { UseEscapeKeyOptions } from "./useEscapeKey";

// Patient View State - Progressive Disclosure
export {
  usePatientViewState,
  usePatientViewLayout,
  usePatientViewTransition,
  usePatientViewNavigation,
  usePatientViewScroll,
  usePatientViewContext,
  isViewState,
  getLayoutAnimationVariants,
} from "./usePatientViewState";
export type { ViewState, LayoutDimensions, TransitionConfig } from "./usePatientViewState";
