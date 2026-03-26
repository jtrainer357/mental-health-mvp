# Prototype Audit Fixes — Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix all P0/P1/P2 findings from the 10-agent prototype audit — responsive bugs, design token violations, touch targets, accessibility gaps, and code decomposition.

**Architecture:** Five independent phases that can run in parallel where noted. Each phase produces a working, deployable prototype. Phases 1-3 (P0+P1) are critical; Phases 4-5 (P2) are structural improvements.

**Tech Stack:** Next.js 14+ (App Router), TypeScript strict, Tailwind CSS v4 with OKLCH tokens, Framer Motion, shadcn/ui design system.

**Prototype root:** `/Users/jaytrainer/Documents/Tebra/Tebra Seond Brain/prototype/`

---

## File Map

### Files to modify (by phase)

**Phase 1 — P0 Critical Fixes:**

- `app/home/_components/patient-detail-view/full-note-view.tsx` (purple removal)
- `app/home/_components/dynamic-canvas.tsx` (mobile overflow)
- `app/home/_components/patient-detail-view/clinical-note-view.tsx` (footer + header overflow)
- `design-system/components/ui/schedule-row-card.tsx` (fixed width overflow)
- `app/home/schedule/page.tsx` (broken view switcher)
- `app/home/loading.tsx` (skeleton mismatch)
- `app/home/patients/loading.tsx`
- `app/home/schedule/loading.tsx`
- `app/home/billing/loading.tsx`
- `app/home/marketing/loading.tsx`
- `app/home/communications/loading.tsx`

**Phase 2 — Design Token Sweep:**

- All 6 loading.tsx files (gray → semantic tokens)
- All 6 error.tsx files (red → destructive tokens)
- `app/home/_components/patient-detail-view/full-note-view.tsx` (green/blue/amber → tokens)
- `app/home/_components/patient-detail-view/messages-tab.tsx` (gray → tokens)
- `app/home/_components/patients/empty-states.tsx` (gray → tokens)
- `app/home/_components/patient-roster/PatientCardCompact.tsx` (blue/gray → tokens)
- `app/home/_components/task-progress-section.tsx` (stone → tokens)
- `app/home/_components/tasks-section.tsx` (black → foreground)
- `app/home/_components/left-nav.tsx` (red/gray → tokens)
- `design-system/components/ui/left-nav.tsx` (if any remain)
- `design-system/components/ui/calendar-week-view.tsx` (white/emerald/rgb → tokens)
- `design-system/components/ui/calendar-day-view.tsx` (red → tokens)
- `design-system/components/ui/calendar-event-card.tsx` (emerald → tokens)
- `design-system/components/ui/conversation-card.tsx` (gray → tokens)
- `design-system/components/ui/schedule-row-card.tsx` (gray → tokens)
- `app/home/schedule/page.tsx` (red/gray → tokens)
- `app/home/billing/page.tsx` (gray/red/yellow → tokens)
- `app/home/marketing/page.tsx` (inline only, not test page)

**Phase 3 — Touch Targets + Accessibility:**

- `design-system/components/ui/chat-input.tsx` (button sizes)
- `app/home/_components/patient-detail-view/header-variants/FullDemographics.tsx`
- `app/home/_components/patient-detail-view/header-variants/MinimalDemographics.tsx`
- `app/home/_components/patient-detail-view/header-variants/UltraMinimalHeader.tsx`
- `app/home/_components/patient-detail-view/visit-summary-panel.tsx`
- `app/home/_components/contact-detail-panel.tsx`
- `app/home/_components/priority-actions-section.tsx` (aria labels, preventDefault)
- `app/home/_components/patient-detail-view/clinical-note-view.tsx` (checkbox roles, aria)
- `app/home/_components/patient-detail-view/patient-detail-view.tsx` (focus trap)
- `app/home/billing/page.tsx` (chart accessibility)
- `app/home/marketing/page.tsx` (table caption, button sizes)
- `design-system/components/ui/outstanding-card.tsx` (button size)

**Phase 4 — Shared Extractions:**

- Create: `design-system/lib/animation-constants.ts`
- Create: `design-system/components/ui/trend-indicator.tsx`
- Create: `app/home/_components/shared/page-shell.tsx`
- Create: `app/home/_components/shared/error-state.tsx`
- Create: `app/home/_components/shared/empty-state.tsx`
- Modify: 8+ files to import `smoothEase` from shared module
- Modify: `marketing/page.tsx` + `visit-prep-panel.tsx` to use shared TrendIndicator
- Modify: all 6 page routes to use PageShell
- Modify: `schedule/page.tsx` + `billing/page.tsx` + others to use shared ErrorState/EmptyState
- Delete: `app/home/marketing-test/` directory (dead code)

**Phase 5 — Component Decomposition:**

- `app/home/_components/patient-detail-view/clinical-note-view.tsx` → split into 6 files
- `app/home/_components/priority-actions-section.tsx` → extract hook + deduplicate headers
- `app/home/billing/page.tsx` → extract inline components
- `app/home/schedule/page.tsx` → extract utilities
- `app/home/_components/visit-prep-panel.tsx` → extract data logic
- `app/home/_components/patient-detail-view/patient-detail-view.tsx` → remove dead code

---

## Phase 1: P0 Critical Fixes

> These fix demo-breaking bugs. Run first.

### Task 1.1: Remove Forbidden Purple Colors

**Files:**

- Modify: `app/home/_components/patient-detail-view/full-note-view.tsx:174,184`

- [ ] **Step 1: Find and replace purple classes**

```
Line 174: bg-purple-100 text-purple-700 → bg-primary/10 text-primary
```

The PCL-5 badge currently uses purple. Replace with the growth/teal palette used for other clinical measures in the same component.

- [ ] **Step 2: Verify no other purple references**

Run: `grep -rn "purple" app/ design-system/ --include="*.tsx" --include="*.css"`
Expected: Zero results.

- [ ] **Step 3: Commit**

```bash
git add app/home/_components/patient-detail-view/full-note-view.tsx
git commit -m "fix: remove forbidden purple from PCL-5 badge, use primary token"
```

---

### Task 1.2: Fix DynamicCanvas Mobile Overflow

**Files:**

- Modify: `app/home/_components/dynamic-canvas.tsx:88`

- [ ] **Step 1: Read the file and find the negative margin**

Look for the class string containing `-m-6` around line 88.

- [ ] **Step 2: Make the negative margin responsive**

The parent `CardWrapper` applies `p-4 sm:p-6`. The child's negative margin must match:

```
Old: "-m-6 flex flex-col p-6"
New: "-m-4 flex flex-col p-4 sm:-m-6 sm:p-6"
```

- [ ] **Step 3: Commit**

```bash
git add app/home/_components/dynamic-canvas.tsx
git commit -m "fix: responsive negative margins on DynamicCanvas to prevent mobile overflow"
```

---

### Task 1.3: Fix Clinical Note Footer + Header Mobile Overflow

**Files:**

- Modify: `app/home/_components/patient-detail-view/clinical-note-view.tsx`

- [ ] **Step 1: Fix footer button overflow (around line 1068-1087)**

Find the footer flex container. Change it to stack on mobile:

```
Old: "flex items-center justify-between px-6 py-4 ..."
New: "flex flex-col items-stretch gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6 ..."
```

Make buttons `w-full sm:w-auto` so they stack vertically on mobile.

- [ ] **Step 2: Fix header metadata overflow (around line 697-699)**

Find the metadata line with date, type, duration, CPT, and provider concatenated with middots. Add `flex-wrap` to allow wrapping on narrow screens:

```
Add class: "flex flex-wrap items-center gap-1"
```

- [ ] **Step 3: Commit**

```bash
git add app/home/_components/patient-detail-view/clinical-note-view.tsx
git commit -m "fix: clinical note footer and header overflow on mobile"
```

---

### Task 1.4: Fix Schedule Row Card Fixed Width Overflow

**Files:**

- Modify: `design-system/components/ui/schedule-row-card.tsx:98`

- [ ] **Step 1: Make the right section responsive**

Find the `w-[300px]` on the right section (around line 98):

```
Old: "w-[300px] ..."
New: "hidden sm:flex sm:w-[300px] ..."
```

This hides the status/room column on mobile where it causes overflow. The essential info (patient name, time) remains visible in the left section.

- [ ] **Step 2: Commit**

```bash
git add design-system/components/ui/schedule-row-card.tsx
git commit -m "fix: hide schedule row card right section on mobile to prevent overflow"
```

---

### Task 1.5: Fix Broken View Switcher on Schedule

**Files:**

- Modify: `app/home/schedule/page.tsx`

- [ ] **Step 1: Read the CalendarHeader usage to find the viewType prop**

Find where the view type selector dropdown is rendered (around line 135). The simplest demo-safe fix is to hide the dropdown.

- [ ] **Step 2: Remove or hide the view type selector**

Option A (recommended): Pass a prop to hide the selector, or remove the viewType/setViewType from CalendarHeader if the header component supports it.

Option B: If the header always renders the selector, hide it with CSS by wrapping in a `hidden` div.

The key requirement: in demos, users should not see a dropdown that does nothing when clicked.

- [ ] **Step 3: Commit**

```bash
git add app/home/schedule/page.tsx
git commit -m "fix: hide non-functional view type selector from schedule page"
```

---

### Task 1.6: Fix Loading Skeleton Mismatches

**Files:**

- Modify: `app/home/loading.tsx`
- Modify: `app/home/patients/loading.tsx`
- Modify: `app/home/schedule/loading.tsx`
- Modify: `app/home/billing/loading.tsx`
- Modify: `app/home/marketing/loading.tsx`
- Modify: `app/home/communications/loading.tsx`

- [ ] **Step 1: Fix home/loading.tsx**

Read both `app/home/page.tsx` and `app/home/loading.tsx`. Align the skeleton to match the page's exact classes:

Key mismatches to fix:

- Sidebar breakpoint: skeleton uses `xl:flex` → change to `lg:flex` (matching page.tsx)
- Sidebar widths: skeleton uses `w-[320px]` → change to `w-[380px] xl:w-[400px] 2xl:w-[440px]` (matching page.tsx)
- Main layout: skeleton uses `xl:flex-row xl:gap-2` → change to `lg:flex-row lg:gap-2` (matching page.tsx)
- Replace all `border-gray-200` with `border-border`
- Replace all `bg-white/*` with `bg-card/*` or `bg-background/*`

- [ ] **Step 2: Fix each remaining loading.tsx**

For each of the 5 remaining loading files, read its corresponding page.tsx and ensure:

1. Container padding matches (`md:pl-24`)
2. Grid breakpoints match
3. Sidebar visibility breakpoints match
4. All hardcoded gray/white colors use design tokens

Special case — `communications/loading.tsx`: Replace the 3-panel messaging skeleton with a simple centered skeleton matching the "Coming Soon" placeholder layout.

- [ ] **Step 3: Commit**

```bash
git add app/home/loading.tsx app/home/*/loading.tsx
git commit -m "fix: align all loading skeletons with actual page layouts and design tokens"
```

---

## Phase 2: Design Token Sweep

> Systematic replacement of hardcoded Tailwind colors with design system tokens. Can run in parallel with Phase 3.

### Task 2.1: Token Replacement Reference

Use this mapping for all replacements in this phase:

| Raw Tailwind                | Design Token Replacement                                          |
| --------------------------- | ----------------------------------------------------------------- |
| `bg-white`                  | `bg-card` or `bg-background`                                      |
| `bg-white/80`               | `bg-card/80`                                                      |
| `border-gray-100`           | `border-border/50`                                                |
| `border-gray-200`           | `border-border`                                                   |
| `border-gray-300`           | `border-border`                                                   |
| `text-gray-200`             | `text-muted-foreground/30`                                        |
| `text-gray-400`             | `text-muted-foreground`                                           |
| `text-gray-500`             | `text-muted-foreground`                                           |
| `text-gray-600`             | `text-muted-foreground`                                           |
| `text-gray-900`             | `text-foreground`                                                 |
| `bg-gray-50`                | `bg-muted/50`                                                     |
| `bg-gray-100`               | `bg-muted`                                                        |
| `bg-gray-200`               | `bg-muted`                                                        |
| `bg-gray-400`               | `bg-muted-foreground`                                             |
| `text-black`                | `text-foreground`                                                 |
| `text-stone-500`            | `text-muted-foreground`                                           |
| `text-stone-600`            | `text-muted-foreground`                                           |
| `border-stone-100`          | `border-border/50`                                                |
| `border-stone-200`          | `border-border`                                                   |
| `border-stone-300`          | `border-border`                                                   |
| `bg-red-50`                 | `bg-destructive/10`                                               |
| `bg-red-100`                | `bg-destructive/10`                                               |
| `text-red-500`              | `text-destructive`                                                |
| `text-red-600`              | `text-destructive`                                                |
| `hover:bg-red-50`           | `hover:bg-destructive/10`                                         |
| `bg-green-100`              | `bg-success/15`                                                   |
| `text-green-700`            | `text-success`                                                    |
| `bg-amber-100`              | `bg-warning/15`                                                   |
| `text-amber-700`            | `text-warning`                                                    |
| `bg-yellow-50`              | `bg-warning/10`                                                   |
| `text-yellow-600`           | `text-warning`                                                    |
| `bg-emerald-500`            | `bg-primary`                                                      |
| `bg-emerald-50`             | `bg-primary/10`                                                   |
| `text-emerald-700`          | `text-primary`                                                    |
| `bg-blue-100`               | `bg-primary/10`                                                   |
| `text-blue-700`             | `text-primary`                                                    |
| `bg-blue-500`               | `bg-primary`                                                      |
| `stroke-gray-300`           | `stroke-border` or use `text-border` with `stroke="currentColor"` |
| `from-gray-200 to-gray-300` | `from-muted to-muted/80`                                          |

### Task 2.2: Sweep Clinical Components

**Files:**

- Modify: `app/home/_components/patient-detail-view/full-note-view.tsx`
- Modify: `app/home/_components/patient-detail-view/messages-tab.tsx`
- Modify: `app/home/_components/patients/empty-states.tsx`
- Modify: `app/home/_components/patient-roster/PatientCardCompact.tsx`

- [ ] **Step 1: Read each file and apply the token mapping from Task 2.1**

For `full-note-view.tsx`, fix these specific instances:

- `bg-green-100 text-green-700` → `bg-success/15 text-success` (signed badge, line ~113)
- `bg-amber-100 text-amber-700` → `bg-warning/15 text-warning` (draft badge)
- `bg-blue-100 text-blue-700` → `bg-primary/10 text-primary` (PHQ-9 badge, line ~174)
- `bg-teal-100 text-teal-700` → keep if using design system teal token, otherwise `bg-primary/10 text-primary`
- `bg-green-100 text-green-700` → `bg-success/15 text-success` (Verified badge, line ~274)
- `text-stone-500` → `text-muted-foreground` (section headers, lines ~167, 209, 221, 233, 245)

For `messages-tab.tsx`, replace all `bg-gray-*`, `text-gray-*`, `border-gray-*`, and `bg-white` instances.

For `empty-states.tsx`, replace `bg-gray-100` → `bg-muted`, `text-gray-400` → `text-muted-foreground`.

For `PatientCardCompact.tsx`, replace `bg-blue-500` → `bg-primary`, `bg-gray-400` → `bg-muted-foreground`.

- [ ] **Step 2: Commit**

```bash
git add app/home/_components/patient-detail-view/full-note-view.tsx \
       app/home/_components/patient-detail-view/messages-tab.tsx \
       app/home/_components/patients/empty-states.tsx \
       app/home/_components/patient-roster/PatientCardCompact.tsx
git commit -m "fix: replace hardcoded colors with design tokens in clinical components"
```

---

### Task 2.3: Sweep Navigation + Home Components

**Files:**

- Modify: `app/home/_components/task-progress-section.tsx`
- Modify: `app/home/_components/tasks-section.tsx`
- Modify: `app/home/_components/left-nav.tsx`

- [ ] **Step 1: Apply token mapping**

For `task-progress-section.tsx`: Replace all `stone-*` tokens per the mapping table.

For `tasks-section.tsx` (line ~33): Replace `text-black` → `text-foreground`. Replace raw `<h2>` with `<Heading level={2}>` if the Heading component is imported, or just fix the color token.

For `left-nav.tsx` (the app-level one, not design-system): Replace `text-red-600` → `text-destructive`, `hover:bg-red-50` → `hover:bg-destructive/10`, `text-gray-900` → `text-foreground`, `text-gray-500` → `text-muted-foreground`.

- [ ] **Step 2: Commit**

```bash
git add app/home/_components/task-progress-section.tsx \
       app/home/_components/tasks-section.tsx \
       app/home/_components/left-nav.tsx
git commit -m "fix: replace hardcoded colors with design tokens in nav and home components"
```

---

### Task 2.4: Sweep Design System Calendar Components

**Files:**

- Modify: `design-system/components/ui/calendar-week-view.tsx`
- Modify: `design-system/components/ui/calendar-day-view.tsx`
- Modify: `design-system/components/ui/calendar-event-card.tsx`
- Modify: `design-system/components/ui/schedule-row-card.tsx`
- Modify: `design-system/components/ui/conversation-card.tsx`

- [ ] **Step 1: Apply token mapping**

For `calendar-week-view.tsx`:

- `bg-white/80` → `bg-card/80` (line ~83)
- `bg-white/40` → `bg-card/40` (line ~112)
- Lines 179-183: The Framer Motion animation uses hardcoded `rgb(16 185 129)`. Replace with CSS variable reference. Read the computed value from `--color-primary` at runtime:
  ```tsx
  // Get CSS variable value for animation
  const primaryColor =
    typeof window !== "undefined"
      ? getComputedStyle(document.documentElement).getPropertyValue("--color-primary").trim()
      : "0.6 0.15 165";
  ```
  Or simpler: use Tailwind classes for the border/shadow via className toggling instead of Framer Motion inline styles.

For `calendar-day-view.tsx`: `text-red-500` → `text-destructive` (line ~130, noon label).

For `calendar-event-card.tsx`: `bg-emerald-500` → `bg-primary` (line ~138, notification dot).

For `schedule-row-card.tsx`: `border-gray-300` → `border-border` (line ~111).

For `conversation-card.tsx`: `bg-gray-100 text-gray-600` → `bg-muted text-muted-foreground` (line ~71, channel badge).

- [ ] **Step 2: Commit**

```bash
git add design-system/components/ui/calendar-week-view.tsx \
       design-system/components/ui/calendar-day-view.tsx \
       design-system/components/ui/calendar-event-card.tsx \
       design-system/components/ui/schedule-row-card.tsx \
       design-system/components/ui/conversation-card.tsx
git commit -m "fix: replace hardcoded colors with design tokens in calendar and messaging components"
```

---

### Task 2.5: Sweep Page-Level Token Violations

**Files:**

- Modify: `app/home/schedule/page.tsx`
- Modify: `app/home/billing/page.tsx`
- Modify: `app/home/marketing/page.tsx`

- [ ] **Step 1: Apply token mapping to each page**

For `schedule/page.tsx`:

- `bg-red-100 text-red-600` → `bg-destructive/10 text-destructive` (error state, lines ~320-321)
- `bg-gray-100 text-gray-400` → `bg-muted text-muted-foreground` (empty state, lines ~339-340)

For `billing/page.tsx`:

- `stroke-gray-300` → use `text-border` with `stroke="currentColor"` (line ~125)
- `text-gray-200` → `text-muted-foreground/30` (line ~138)
- `bg-red-100 text-red-600` → `bg-destructive/10 text-destructive` (lines ~290-291)
- `bg-red-50 text-red-500` → `bg-destructive/10 text-destructive` (lines ~461-462)
- `bg-yellow-50 text-yellow-600` → `bg-warning/10 text-warning` (lines ~478-479)

For `marketing/page.tsx`: Fix only the main page (not marketing-test which will be deleted in Phase 4). No specific hardcoded color instances noted in the main marketing page beyond what's covered by component-level fixes.

- [ ] **Step 2: Commit**

```bash
git add app/home/schedule/page.tsx app/home/billing/page.tsx app/home/marketing/page.tsx
git commit -m "fix: replace hardcoded colors with design tokens in schedule, billing, marketing pages"
```

---

## Phase 3: Touch Targets + Accessibility

> Fix interactive element sizes and ARIA attributes. Can run in parallel with Phase 2.

### Task 3.1: Fix Touch Targets on Chat Input

**Files:**

- Modify: `design-system/components/ui/chat-input.tsx`

- [ ] **Step 1: Read the file and fix all undersized buttons**

- Input container: `h-10` → `h-11` (line ~63)
- Paperclip button: `h-9 w-9` → `h-11 w-11` (line ~82)
- Image button: `h-9 w-9` → `h-11 w-11` (line ~92)
- Smile button: `h-9 w-9` → `h-11 w-11` (line ~112)
- Send button: add `h-11` (line ~122)
- Remove the responsive `sm:h-11 sm:w-11` overrides since they're now redundant.

- [ ] **Step 2: Commit**

```bash
git add design-system/components/ui/chat-input.tsx
git commit -m "fix: increase chat input button touch targets to 44px minimum"
```

---

### Task 3.2: Fix Touch Targets on Patient Header Variants

**Files:**

- Modify: `app/home/_components/patient-detail-view/header-variants/FullDemographics.tsx`
- Modify: `app/home/_components/patient-detail-view/header-variants/MinimalDemographics.tsx`
- Modify: `app/home/_components/patient-detail-view/header-variants/UltraMinimalHeader.tsx`
- Modify: `app/home/_components/patient-detail-view/visit-summary-panel.tsx`
- Modify: `app/home/_components/contact-detail-panel.tsx`
- Modify: `design-system/components/ui/outstanding-card.tsx`

- [ ] **Step 1: Fix each file**

For `FullDemographics.tsx` (lines ~179-212): Change action buttons from `h-9 w-9` → `h-11 w-11`.

For `MinimalDemographics.tsx`:

- Back button (line ~108): `h-9 w-9` → `h-11 w-11`
- More options button (line ~166): `h-8 w-8` → `h-11 w-11`

For `UltraMinimalHeader.tsx`:

- Back button (line ~82): `h-8 w-8` → `h-11 w-11`
- Close button (line ~128): `h-8 w-8` → `h-11 w-11`

For `visit-summary-panel.tsx` (line ~164): Back button `h-10 w-10` → `h-11 w-11`.

For `contact-detail-panel.tsx` (line ~136): Close button mobile size `h-9 w-9` → `h-11 w-11`.

For `outstanding-card.tsx` (line ~41): Button `h-7` → `h-9` minimum (or `h-11` if space allows).

- [ ] **Step 2: Also fix marketing page CTA buttons**

In `app/home/marketing/page.tsx`:

- Lines ~472, 506, 550: Change `size="sm"` to `size="default"` on "Learn More" buttons.
- Lines ~234-242, 303: Add `min-h-[44px]` or `size="lg"` to upsell banner buttons.

In `app/home/billing/page.tsx`:

- Lines ~265-272, 365, 471, 488: Same pattern — ensure all CTA buttons are `min-h-[44px]`.

- [ ] **Step 3: Commit**

```bash
git add app/home/_components/patient-detail-view/header-variants/ \
       app/home/_components/patient-detail-view/visit-summary-panel.tsx \
       app/home/_components/contact-detail-panel.tsx \
       design-system/components/ui/outstanding-card.tsx \
       app/home/marketing/page.tsx \
       app/home/billing/page.tsx
git commit -m "fix: increase all interactive touch targets to 44px minimum"
```

---

### Task 3.3: Fix Critical Accessibility Gaps

**Files:**

- Modify: `app/home/_components/patient-detail-view/clinical-note-view.tsx`
- Modify: `app/home/_components/priority-actions-section.tsx`
- Modify: `app/home/_components/contact-detail-panel.tsx`

- [ ] **Step 1: Fix clinical-note-view.tsx accessibility**

Checkbox buttons (around line 1018-1030): Add to each motion.button:

```tsx
role="checkbox"
aria-checked={action.checked}
aria-label={`Mark ${action.title} as ${action.checked ? 'incomplete' : 'complete'}`}
```

Full-view toggle button (around line 716-734): Add:

```tsx
aria-label={isFullView ? "Exit full view" : "Enter full view"}
```

Note type Select (around line 810): Add to SelectTrigger:

```tsx
aria-label="Note format"
```

DAP sections: Add to each motion.section:

```tsx
aria-label={section.title}
```

- [ ] **Step 2: Fix priority-actions-section.tsx accessibility**

Clickable divs (around lines 773, 815): Add descriptive aria-labels:

```tsx
aria-label={`View actions for ${patientName}`}
```

Space key handlers (around line 779, 822): Add `e.preventDefault()` before the action call when `e.key === " "`.

Non-functional "Complete All Actions" buttons (around line 108, 756): Add `aria-disabled="true"` and style as disabled.

- [ ] **Step 3: Fix contact-detail-panel.tsx tab bar**

The tab bar (lines ~113-131) has buttons that look like tabs but lack ARIA semantics. Since only "Info" is functional, disable the other two:

```tsx
<button disabled className="... opacity-50 cursor-not-allowed" aria-disabled="true">
  Viewed pages
</button>
<button disabled className="... opacity-50 cursor-not-allowed" aria-disabled="true">
  Notes
</button>
```

- [ ] **Step 4: Fix billing chart accessibility**

In `app/home/billing/page.tsx`:

- CircularProgress SVG: Add `role="progressbar"` `aria-valuenow={percentage}` `aria-valuemin={0}` `aria-valuemax={100}` `aria-label="Collections Rate"`.
- BarChart: Add `role="img"` `aria-label="Monthly revenue trend"`.

- [ ] **Step 5: Commit**

```bash
git add app/home/_components/patient-detail-view/clinical-note-view.tsx \
       app/home/_components/priority-actions-section.tsx \
       app/home/_components/contact-detail-panel.tsx \
       app/home/billing/page.tsx
git commit -m "fix: add ARIA roles, labels, and keyboard support to interactive elements"
```

---

### Task 3.4: Add Focus Trap to Full View Overlay

**Files:**

- Modify: `app/home/_components/patient-detail-view/patient-detail-view.tsx`

- [ ] **Step 1: Add keyboard escape handler and focus management**

Find the fullView overlay (around line 408-414). Add an `onKeyDown` handler for Escape:

```tsx
onKeyDown={(e) => {
  if (e.key === "Escape") {
    e.preventDefault();
    goBack();
  }
}}
tabIndex={-1}
ref={fullViewRef}
```

Add a `useEffect` to focus the overlay container when it opens:

```tsx
const fullViewRef = React.useRef<HTMLDivElement>(null);
React.useEffect(() => {
  if (isFullView && fullViewRef.current) {
    fullViewRef.current.focus();
  }
}, [isFullView]);
```

- [ ] **Step 2: Commit**

```bash
git add app/home/_components/patient-detail-view/patient-detail-view.tsx
git commit -m "fix: add keyboard escape and focus management to clinical note full view"
```

---

## Phase 4: Shared Extractions

> Extract duplicated patterns into shared modules. Depends on Phases 1-3 being complete.

### Task 4.1: Extract Shared Animation Constants

**Files:**

- Create: `design-system/lib/animation-constants.ts`
- Modify: 8+ files that define `smoothEase`

- [ ] **Step 1: Create the shared module**

```tsx
// design-system/lib/animation-constants.ts

/** Standard smooth easing curve used across all Framer Motion animations */
export const smoothEase: [number, number, number, number] = [0.25, 0.1, 0.25, 1.0];

/** Exponential ease-out for dramatic transitions */
export const expoOut: [number, number, number, number] = [0.16, 1, 0.3, 1];

/** Subtle overshoot for playful micro-interactions */
export const subtleOvershoot: [number, number, number, number] = [0.34, 1.56, 0.64, 1];

/** Standard stagger delay for list item animations */
export const STAGGER_DELAY = 0.05;
```

- [ ] **Step 2: Find all files that define smoothEase and update imports**

Run: `grep -rn "smoothEase" app/ design-system/ --include="*.tsx" --include="*.ts"`

For each file found, remove the local `const smoothEase = ...` and add:

```tsx
import { smoothEase } from "@/design-system/lib/animation-constants";
```

Do the same for `expoOut` and `subtleOvershoot` if they appear.

- [ ] **Step 3: Commit**

```bash
git add design-system/lib/animation-constants.ts
git add -A  # all modified files
git commit -m "refactor: extract shared animation constants to design system"
```

---

### Task 4.2: Extract Shared TrendIndicator Component

**Files:**

- Create: `design-system/components/ui/trend-indicator.tsx`
- Modify: `app/home/marketing/page.tsx` (remove inline TrendIcon)
- Modify: `app/home/_components/visit-prep-panel.tsx` (remove inline TrendIcon)

- [ ] **Step 1: Create the shared component**

```tsx
// design-system/components/ui/trend-indicator.tsx
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { cn } from "@/design-system/lib/utils";

type TrendDirection = "up" | "down" | "flat" | "improving" | "worsening" | "stable";

interface TrendIndicatorProps {
  direction: TrendDirection;
  className?: string;
}

const normalizeDirection = (d: TrendDirection): "up" | "down" | "flat" => {
  if (d === "improving") return "up";
  if (d === "worsening") return "down";
  if (d === "stable") return "flat";
  return d;
};

export function TrendIndicator({ direction, className }: TrendIndicatorProps) {
  const normalized = normalizeDirection(direction);
  const Icon = normalized === "up" ? TrendingUp : normalized === "down" ? TrendingDown : Minus;
  const color =
    normalized === "up"
      ? "text-success"
      : normalized === "down"
        ? "text-destructive"
        : "text-muted-foreground";
  return <Icon className={cn("h-4 w-4", color, className)} />;
}
```

- [ ] **Step 2: Replace inline TrendIcon in both files**

Import from the design system and remove local definitions.

- [ ] **Step 3: Commit**

```bash
git add design-system/components/ui/trend-indicator.tsx \
       app/home/marketing/page.tsx \
       app/home/_components/visit-prep-panel.tsx
git commit -m "refactor: extract shared TrendIndicator to design system"
```

---

### Task 4.3: Extract PageShell Layout Component

**Files:**

- Create: `app/home/_components/shared/page-shell.tsx`
- Modify: All 6 page routes under `app/home/`

- [ ] **Step 1: Create the PageShell component**

Read any page (e.g., `app/home/page.tsx`) to capture the exact wrapper pattern:

- `div.min-h-screen.pb-24.md:pb-0`
- `AnimatedBackground`
- `LeftNav activePage={...}`
- `div.md:pl-24`
- `HeaderSearch`
- `main#main-content role="main" className="px-4 py-4 sm:px-6 sm:py-6 md:py-8"`
- `PageTransition`
- `div.mx-auto.max-w-[1600px]`

```tsx
// app/home/_components/shared/page-shell.tsx
"use client";
import { AnimatedBackground } from "@/design-system/components/ui/animated-background";
import { PageTransition } from "@/design-system/components/ui/page-transition";
import { LeftNav } from "../left-nav";
import { HeaderSearch } from "../header-search";

type ActivePage = "home" | "patients" | "schedule" | "messages" | "billing" | "marketing";

interface PageShellProps {
  activePage: ActivePage;
  children: React.ReactNode;
  maxWidth?: string;
}

export function PageShell({ activePage, children, maxWidth = "max-w-[1600px]" }: PageShellProps) {
  return (
    <div className="min-h-screen pb-24 md:pb-0">
      <AnimatedBackground />
      <LeftNav activePage={activePage} />
      <div className="md:pl-24">
        <HeaderSearch />
        <main
          id="main-content"
          role="main"
          aria-label="Dashboard content"
          className="px-4 py-4 sm:px-6 sm:py-6 md:py-8"
        >
          <PageTransition>
            <div className={`mx-auto ${maxWidth}`}>{children}</div>
          </PageTransition>
        </main>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Refactor each page to use PageShell**

For each of the 6 pages (home, patients, schedule, communications, billing, marketing), replace the wrapper boilerplate with `<PageShell activePage="...">`. Read each page first to check for any page-specific wrapper variations.

- [ ] **Step 3: Commit**

```bash
git add app/home/_components/shared/page-shell.tsx
git add app/home/page.tsx app/home/patients/page.tsx app/home/schedule/page.tsx \
       app/home/communications/page.tsx app/home/billing/page.tsx app/home/marketing/page.tsx
git commit -m "refactor: extract shared PageShell layout, deduplicate across 6 pages"
```

---

### Task 4.4: Extract Shared ErrorState and EmptyState

**Files:**

- Create: `app/home/_components/shared/error-state.tsx`
- Create: `app/home/_components/shared/empty-state.tsx`
- Modify: `app/home/schedule/page.tsx`
- Modify: `app/home/billing/page.tsx`
- Modify: any other pages with inline error/empty states

- [ ] **Step 1: Create ErrorState component**

```tsx
// app/home/_components/shared/error-state.tsx
import { AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "@/design-system/components/ui/button";

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
}

export function ErrorState({
  title = "Something went wrong",
  message = "Please try again or contact support if the issue persists.",
  onRetry,
}: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="bg-destructive/10 mb-4 flex h-12 w-12 items-center justify-center rounded-full">
        <AlertTriangle className="text-destructive h-6 w-6" />
      </div>
      <h3 className="text-foreground mb-2 text-lg font-semibold">{title}</h3>
      <p className="text-muted-foreground mb-4 max-w-sm text-sm">{message}</p>
      {onRetry && (
        <Button variant="outline" onClick={onRetry}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Try Again
        </Button>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Create EmptyState component**

```tsx
// app/home/_components/shared/empty-state.tsx
import { LucideIcon } from "lucide-react";
import { Button } from "@/design-system/components/ui/button";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({ icon: Icon, title, message, actionLabel, onAction }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="bg-muted mb-4 flex h-12 w-12 items-center justify-center rounded-full">
        <Icon className="text-muted-foreground h-6 w-6" />
      </div>
      <h3 className="text-foreground mb-2 text-lg font-semibold">{title}</h3>
      <p className="text-muted-foreground mb-4 max-w-sm text-sm">{message}</p>
      {actionLabel && onAction && <Button onClick={onAction}>{actionLabel}</Button>}
    </div>
  );
}
```

- [ ] **Step 3: Replace inline error/empty states in schedule + billing pages**

- [ ] **Step 4: Commit**

```bash
git add app/home/_components/shared/error-state.tsx \
       app/home/_components/shared/empty-state.tsx \
       app/home/schedule/page.tsx \
       app/home/billing/page.tsx
git commit -m "refactor: extract shared ErrorState and EmptyState components"
```

---

### Task 4.5: Delete Dead Code (marketing-test)

**Files:**

- Delete: `app/home/marketing-test/` directory

- [ ] **Step 1: Verify marketing-test is not linked from anywhere**

Run: `grep -rn "marketing-test" app/ design-system/ --include="*.tsx" --include="*.ts"`

If no imports or links reference it (besides its own files), it is safe to delete.

- [ ] **Step 2: Delete the directory**

```bash
rm -rf app/home/marketing-test/
```

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "chore: remove dead marketing-test page (759 lines of unused code)"
```

---

## Phase 5: Component Decomposition

> Break down the mega-files. Depends on Phases 1-4 being complete.

### Task 5.1: Decompose clinical-note-view.tsx

**Files:**

- Modify: `app/home/_components/patient-detail-view/clinical-note-view.tsx`
- Create: `app/home/_components/patient-detail-view/clinical-note-sidebar.tsx`
- Create: `app/home/_components/patient-detail-view/clinical-note-header.tsx`
- Create: `app/home/_components/patient-detail-view/dap-section.tsx`
- Create: `app/home/_components/patient-detail-view/cpt-approval-card.tsx`
- Create: `app/home/_components/patient-detail-view/extracted-actions-card.tsx`
- Create: `app/home/_components/patient-detail-view/clinical-note-footer.tsx`

- [ ] **Step 1: Read the full file and identify the 6 extraction boundaries**

The boundaries (from the audit):

1. Patient context sidebar (lines ~415-659)
2. Clinical note header (lines ~663-737)
3. DAP section component (lines ~782-879, used in a loop)
4. CPT approval card (lines ~890-981)
5. Extracted actions card (lines ~983-1061)
6. Note footer (lines ~1069-1088)

- [ ] **Step 2: Extract each sub-component into its own file**

For each extraction:

- Move the JSX and any local state/handlers it needs
- Define a clear props interface
- Import back into clinical-note-view.tsx

Start with the simplest (footer), work up to the most complex (sidebar).

- [ ] **Step 3: Remove dead code**

- Remove unused `AnimatePresence` import
- Remove unused `StatusBadge` component (lines ~242-266)
- Remove unused `SectionStatus` type if StatusBadge is removed

- [ ] **Step 4: Verify the page still renders correctly**

Run: `npm run build`
Expected: 0 TypeScript errors, build passes.

- [ ] **Step 5: Commit**

```bash
git add app/home/_components/patient-detail-view/
git commit -m "refactor: decompose clinical-note-view into 6 focused sub-components"
```

---

### Task 5.2: Decompose priority-actions-section.tsx

**Files:**

- Modify: `app/home/_components/priority-actions-section.tsx`
- Create: `app/home/_components/hooks/use-priority-actions.ts`

- [ ] **Step 1: Extract usePriorityActions hook**

Move all 8 useState calls, the loadData callback, the useEffect, and the data-fetching/merging/sorting logic into a custom hook:

```tsx
export function usePriorityActions() {
  // All state variables
  // loadData callback
  // useEffect for loading
  // handleRunAnalysis
  // Return: { actions, allActions, todayAppts, loading, scanning, scanResult, error, dbReady, loadData, handleRunAnalysis }
}
```

- [ ] **Step 2: Deduplicate the 6x header block**

Extract a `SectionHeader` component that all render paths share:

```tsx
function SectionHeader({ subtitle, action }: { subtitle?: React.ReactNode; action?: React.ReactNode }) {
  return (
    <div className="flex items-center gap-4 ...">
      <Image src="/heart-logo.svg" ... />
      <div>
        <Heading level={2}>Today's Actions</Heading>
        {subtitle}
      </div>
      {action}
    </div>
  );
}
```

- [ ] **Step 3: Move utility functions to a separate file**

Move `getActionDescription`, `formatTimeAgo`, `unifiedActionToContext`, `appointmentToContext`, and other pure functions to `app/home/_components/utils/priority-action-utils.ts`.

- [ ] **Step 4: Verify build**

Run: `npm run build`

- [ ] **Step 5: Commit**

```bash
git add app/home/_components/priority-actions-section.tsx \
       app/home/_components/hooks/use-priority-actions.ts \
       app/home/_components/utils/priority-action-utils.ts
git commit -m "refactor: extract usePriorityActions hook and deduplicate headers"
```

---

### Task 5.3: Extract Billing Page Inline Components

**Files:**

- Modify: `app/home/billing/page.tsx`
- Create: `design-system/components/ui/circular-progress.tsx`
- Create: `app/home/billing/_components/metric-card.tsx`

- [ ] **Step 1: Extract CircularProgress to design system**

Move the CircularProgress component (~54 lines) to `design-system/components/ui/circular-progress.tsx`. Add `role="progressbar"` and ARIA attributes (already planned in Phase 3).

- [ ] **Step 2: Extract MetricCard to billing components**

Move MetricCard (~63 lines) to `app/home/billing/_components/metric-card.tsx`.

- [ ] **Step 3: Update imports in billing/page.tsx**

- [ ] **Step 4: Commit**

```bash
git add design-system/components/ui/circular-progress.tsx \
       app/home/billing/_components/metric-card.tsx \
       app/home/billing/page.tsx
git commit -m "refactor: extract CircularProgress and MetricCard from billing page"
```

---

### Task 5.4: Extract Visit Prep Data Logic

**Files:**

- Modify: `app/home/_components/visit-prep-panel.tsx`
- Create: `src/lib/data/visit-prep.ts`

- [ ] **Step 1: Move data logic to utility module**

Move these from visit-prep-panel.tsx to `src/lib/data/visit-prep.ts`:

- `PrepData` interface
- `therapyMap` object
- `referralSources` array
- `goalsByDx` object
- `buildPrepData()` function

- [ ] **Step 2: Update visit-prep-panel.tsx imports**

The component file should import `buildPrepData` and `PrepData` from `@/src/lib/data/visit-prep`.

- [ ] **Step 3: Commit**

```bash
git add src/lib/data/visit-prep.ts app/home/_components/visit-prep-panel.tsx
git commit -m "refactor: extract visit prep data logic to dedicated utility module"
```

---

### Task 5.5: Clean Up patient-detail-view.tsx Dead Code

**Files:**

- Modify: `app/home/_components/patient-detail-view/patient-detail-view.tsx`

- [ ] **Step 1: Remove dead code**

- Delete `_viewVariants` (lines ~35-56) — unused animation config
- Delete `_direction` state and its useEffect (lines ~126, 131-142) — set but never read
- Remove `MessagesTab` import (line ~23) — never rendered
- Remove `ReviewsTab` import (line ~24) — never rendered

- [ ] **Step 2: Fix prop mutation**

Line ~191: `patient.recentActivity.unshift(blankSessionActivity)` mutates a prop. Replace with:

```tsx
const activityWithBlank = [blankSessionActivity, ...patient.recentActivity];
```

And pass `activityWithBlank` to the child component instead.

- [ ] **Step 3: Extract duplicated AnimatedTabContent wrapper**

The four TabsContent blocks repeat the same motion.div animation. Extract:

```tsx
function AnimatedTabContent({ children, key }: { children: React.ReactNode; key: string }) {
  return (
    <motion.div
      key={key}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: smoothEase }}
    >
      {children}
    </motion.div>
  );
}
```

- [ ] **Step 4: Verify build**

Run: `npm run build`

- [ ] **Step 5: Commit**

```bash
git add app/home/_components/patient-detail-view/patient-detail-view.tsx
git commit -m "refactor: remove dead code and fix prop mutation in patient-detail-view"
```

---

### Task 5.6: Export Shared Type

**Files:**

- Modify: `app/home/_components/patient-detail-view/clinical-note-view.tsx`
- Modify: `app/home/_components/patient-detail-view/visit-summary-panel.tsx`
- Modify: `app/home/_components/patient-detail-view/patient-detail-view.tsx`
- Modify: `app/home/_components/patient-detail-view/full-note-view.tsx`

- [ ] **Step 1: Add SelectedActivity export to types**

Find where `PatientDetail` is defined (likely `src/lib/data/types.ts` or `app/home/_components/patient-detail-view/types.ts`). Add:

```tsx
export type SelectedActivity = PatientDetail["recentActivity"][number];
```

- [ ] **Step 2: Update all 4 files to import from the shared location**

Remove the local `type SelectedActivity = ...` from each file and replace with an import.

- [ ] **Step 3: Commit**

```bash
git add src/lib/data/types.ts \
       app/home/_components/patient-detail-view/clinical-note-view.tsx \
       app/home/_components/patient-detail-view/visit-summary-panel.tsx \
       app/home/_components/patient-detail-view/patient-detail-view.tsx \
       app/home/_components/patient-detail-view/full-note-view.tsx
git commit -m "refactor: export SelectedActivity type from shared types, deduplicate across 4 files"
```

---

## Final Verification

### Task 6.1: Full Build + Deploy

- [ ] **Step 1: Run full build**

```bash
npm run build
```

Expected: 0 errors, all routes generated.

- [ ] **Step 2: Run lint**

```bash
npm run lint
```

- [ ] **Step 3: Visual spot-check at 3 breakpoints**

Open `localhost:3000/home` and check at:

- 375px (mobile)
- 768px (tablet)
- 1280px (desktop)

Verify: no horizontal scroll, no overflow, no purple, no layout jumps on load.

- [ ] **Step 4: Push to GitHub and deploy to Vercel**

```bash
git push
npx vercel --prod --yes
```

- [ ] **Step 5: Smoke test production URL**

Open the Vercel URL and verify the same 3 breakpoints.
