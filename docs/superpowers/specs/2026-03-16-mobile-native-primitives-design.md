# Mobile-Native Primitives Design Spec

> **Date:** 2026-03-16
> **Status:** Approved
> **Scope:** 5 components + 3 hooks for native mobile behaviors (<1024px)

## Overview

Extract and build reusable mobile-native primitives that give the app iOS/Android-like feel on mobile and tablet viewports. All primitives are mobile-only (<1024px) and become no-ops or passthroughs on desktop.

## File Locations

- **Components:** `design-system/components/ui/mobile/`
- **Hooks:** `src/hooks/`
- **Exports:** Each component/hook is a standalone file with named exports

## Dependencies

- `framer-motion` (already installed) — animations
- No new dependencies required

---

## Hooks

### `useMobileDetect` — `src/hooks/useMobileDetect.ts`

Replaces inline `useIsMobileView()` in patients-page.tsx.

```typescript
interface MobileDetectResult {
  isMobile: boolean; // <768px
  isTablet: boolean; // 768–1023px
  isDesktop: boolean; // >=1024px
  isTouchDevice: boolean; // <1024px (mobile OR tablet)
}

function useMobileDetect(): MobileDetectResult;
```

**Implementation:** Uses `window.matchMedia` listeners for `(max-width: 767px)` and `(min-width: 768px) and (max-width: 1023px)`. SSR-safe with `false` defaults. Cleans up listeners on unmount.

### `useScrollDirection` — `src/hooks/useScrollDirection.ts`

```typescript
interface ScrollDirectionOptions {
  threshold?: number; // px before direction change registers (default: 5)
  targetRef?: RefObject<HTMLElement>; // scroll container (default: window)
}

function useScrollDirection(options?: ScrollDirectionOptions): "up" | "down" | null;
```

**Implementation:** Attaches scroll listener to target (window or ref). Tracks `lastScrollY`. Only updates direction when delta exceeds threshold. Returns `null` until first scroll. Uses `passive: true` for performance.

### `useSwipeGesture` — `src/hooks/useSwipeGesture.ts`

```typescript
interface SwipeGestureOptions {
  threshold?: number; // px to qualify as swipe (default: 50)
  edgeZone?: number; // restrict to left N px (default: undefined = full width)
  direction?: "horizontal" | "vertical" | "both"; // lock axis (default: "both")
  onSwipe?: (direction: "left" | "right" | "up" | "down") => void;
}

interface SwipeGestureResult {
  ref: RefObject<HTMLElement>;
  swiping: boolean;
  direction: "left" | "right" | "up" | "down" | null;
  distance: number; // px from start
  velocity: number; // px/ms
  progress: number; // 0–1 based on threshold
}

function useSwipeGesture(options?: SwipeGestureOptions): SwipeGestureResult;
```

**Implementation:** Touch event handlers (touchstart/touchmove/touchend) on the ref element. Direction lock after 10px of movement. Velocity calculated from last 3 touch positions over time. Edge zone check on touchstart x-coordinate. No external gesture library.

---

## Components

### `MobileNavStack` — `design-system/components/ui/mobile/mobile-nav-stack.tsx`

Generic push/pop container extracted from patients-page.tsx.

```typescript
interface MobileNavStackProps {
  showDetail: boolean;
  onBack?: () => void;
  listView: ReactNode;
  detailView: ReactNode;
  enableSwipeBack?: boolean; // default: true
  className?: string;
}
```

**Behavior:**

- `showDetail=false`: shows `listView` with slide-from-left enter animation
- `showDetail=true`: shows `detailView` with slide-from-right enter animation
- Uses `AnimatePresence mode="wait"` with the exact easing from patients-page.tsx: `[0.25, 0.1, 0.25, 1.0]`, duration 0.25s
- When `enableSwipeBack=true`, wraps `detailView` with `SwipeBack` that calls `onBack`
- Desktop: renders nothing (consumers handle their own desktop layout)

**Refactor:** patients-page.tsx replaces lines 212–281 with:

```tsx
<MobileNavStack
  showDetail={mobileShowDetail}
  onBack={handleBackToRoster}
  listView={/* roster content */}
  detailView={/* detail content */}
/>
```

### `BottomSheet` — `design-system/components/ui/mobile/bottom-sheet.tsx`

Drag-to-dismiss modal sheet for contextual actions.

```typescript
interface BottomSheetProps {
  open: boolean;
  onClose: () => void;
  snapPoints?: number[]; // fractions 0–1 (default: [0.5, 0.9])
  initialSnap?: number; // index into snapPoints (default: 0)
  title?: string;
  children: ReactNode;
}
```

**Behavior:**

- Renders portal with backdrop (black/40%, click to close)
- Sheet slides up from bottom with spring animation (stiffness: 400, damping: 30)
- Drag handle at top (40px wide, 4px tall, rounded, synapse-3 color)
- Dragging down: if velocity > 500px/s OR position < 25% of viewport, dismiss
- Dragging up/down between snap points: snaps to nearest
- Body scroll locked when open
- Rounded top corners (16px)
- Max height: 90vh
- Background: `bg-backbone-1`

### `PullToRefresh` — `design-system/components/ui/mobile/pull-to-refresh.tsx`

Overscroll-triggered refresh wrapper.

```typescript
interface PullToRefreshProps {
  onRefresh: () => Promise<void>;
  children: ReactNode;
  disabled?: boolean;
  className?: string;
}
```

**Behavior:**

- Wraps children in a scrollable container
- Pull down from top: rubber-band overscroll effect via CSS transform (diminishing returns past 60px)
- Spinner appears at 40px pull, activates at 60px
- Spinner: circular, growth-2 color, 24px, uses CSS animation (not Framer Motion for perf)
- While refreshing: spinner stays visible, children shift down 48px
- After `onRefresh()` resolves: spring back to normal position
- Only activates when scroll position is at top (scrollTop <= 0)
- Touch-only (no mouse drag)

### `CollapsibleHeader` — `design-system/components/ui/mobile/collapsible-header.tsx`

iOS-style large title that collapses on scroll.

```typescript
interface CollapsibleHeaderProps {
  title: string;
  collapsedTitle?: string; // defaults to title
  actions?: ReactNode; // right-side action buttons
  children: ReactNode; // scrollable content below
  className?: string;
}
```

**Behavior:**

- Large state: 80px height, title in 24px font weight 700, synapse-7 color
- Collapsed state: 48px height, title in 16px font weight 600
- Uses `useScrollDirection`: collapse on scroll down, expand on scroll up (only when near top, within 100px of scrollTop=0)
- Height and font size animate with Framer Motion spring (stiffness: 300, damping: 25)
- Actions slot positioned right-aligned, vertically centered in both states
- Header has `bg-backbone-1` background with subtle bottom border (`border-synapse-2`)
- Sticky positioning (`position: sticky, top: 0, z-index: 10`)

### `SwipeBack` — `design-system/components/ui/mobile/swipe-back.tsx`

Edge swipe to go back, iOS-style.

```typescript
interface SwipeBackProps {
  onBack: () => void;
  enabled?: boolean; // default: true
  children: ReactNode;
}
```

**Behavior:**

- Uses `useSwipeGesture` with `edgeZone: 20`, `direction: "horizontal"`
- During swipe: children translate right following finger (1:1 up to 50%, then 0.5:1)
- Subtle shadow on left edge during swipe (grows with progress)
- Trigger: distance > 100px OR velocity > 0.5px/ms
- On trigger: animate children fully right, call `onBack`
- On cancel: spring back to x=0
- Visual indicator: 8px semi-circle on left edge, synapse-3, appears at 20px swipe distance

---

## Integration Order

1. **Hooks first:** `useMobileDetect` → `useScrollDirection` → `useSwipeGesture`
2. **Independent components:** `SwipeBack` (uses `useSwipeGesture`) → `MobileNavStack` (uses `SwipeBack`)
3. **Refactor patients-page.tsx:** Replace inline code with `MobileNavStack` + `useMobileDetect`
4. **Remaining components:** `BottomSheet` → `PullToRefresh` → `CollapsibleHeader`

## Testing Strategy

- Each hook gets a unit test file in `src/hooks/__tests__/`
- Each component gets a unit test file in `design-system/components/ui/mobile/__tests__/`
- Manual testing at 375px (iPhone SE) and 768px (iPad) viewports
- Verify `npm run build` passes after each component

## Design System Compliance

- All colors use Tebra tokens (growth, vitality, backbone, synapse)
- No hardcoded hex values
- No purple
- Touch targets minimum 44px
- Mobile-first CSS
- TypeScript strict, zero `any` types
