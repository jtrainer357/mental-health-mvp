"use client";

import * as React from "react";
import { Search, X, ChevronLeft } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Input } from "@/design-system/components/ui/input";
import { CardWrapper } from "@/design-system/components/ui/card-wrapper";
import { Button } from "@/design-system/components/ui/button";
import { Text } from "@/design-system/components/ui/typography";
import { cn } from "@/design-system/lib/utils";
import { PatientCardFull } from "./PatientCardFull";
import { PatientCardCompact } from "./PatientCardCompact";
import { usePatientRosterStore } from "./use-patient-roster-store";
import type { RosterPatient, PatientViewState } from "./types";
import { ROSTER_WIDTH_CONFIG, ROSTER_ANIMATION_CONFIG, getCardTypeForState } from "./types";

interface PatientRosterProps {
  patients: RosterPatient[];
  selectedPatientId?: string;
  onPatientSelect?: (patient: RosterPatient) => void;
  onMessage?: (patient: RosterPatient) => void;
  onEmail?: (patient: RosterPatient) => void;
  onMore?: (patient: RosterPatient) => void;
  className?: string;
  /** Override view state (for controlled usage) */
  viewState?: PatientViewState;
  /** Show mobile drawer toggle on small screens */
  showMobileToggle?: boolean;
}

/**
 * Responsive Patient Roster Component
 * Adapts to three render modes with smooth Framer Motion animations:
 * - Full (320px): Complete patient cards with all details
 * - Compact (140px): Minimal cards with avatar and name
 * - Hidden (0px): Fully collapsed with animation
 */
export function PatientRoster({
  patients,
  selectedPatientId,
  onPatientSelect,
  onMessage,
  onEmail,
  onMore,
  className,
  viewState: controlledViewState,
  showMobileToggle = true,
}: PatientRosterProps) {
  const [searchQuery, setSearchQuery] = React.useState("");
  const [mobileDrawerOpen, setMobileDrawerOpen] = React.useState(false);

  // Use controlled state if provided, otherwise use store
  const storeViewState = usePatientRosterStore((state) => state.viewState);
  const viewState = controlledViewState ?? storeViewState;

  const rosterWidth = ROSTER_WIDTH_CONFIG[viewState];
  const isVisible = viewState !== "fullView";
  const cardType = getCardTypeForState(viewState);

  // Filter patients by search
  const filteredPatients = React.useMemo(() => {
    if (!searchQuery) return patients;
    const query = searchQuery.toLowerCase();
    return patients.filter((p) => p.name.toLowerCase().includes(query) || p.phone.includes(query));
  }, [patients, searchQuery]);

  // Handle patient selection
  const handlePatientSelect = React.useCallback(
    (patient: RosterPatient) => {
      onPatientSelect?.(patient);
      // Close mobile drawer on selection
      setMobileDrawerOpen(false);
    },
    [onPatientSelect]
  );

  // Render appropriate card based on state
  const renderPatientCard = React.useCallback(
    (patient: RosterPatient) => {
      const isSelected = selectedPatientId === patient.id;

      if (cardType === "full") {
        return (
          <PatientCardFull
            key={patient.id}
            patient={patient}
            selected={isSelected}
            onSelect={() => handlePatientSelect(patient)}
            onMessage={() => onMessage?.(patient)}
            onEmail={() => onEmail?.(patient)}
            onMore={() => onMore?.(patient)}
          />
        );
      }

      if (cardType === "compact") {
        return (
          <PatientCardCompact
            key={patient.id}
            patient={patient}
            selected={isSelected}
            onSelect={() => handlePatientSelect(patient)}
          />
        );
      }

      return null;
    },
    [cardType, selectedPatientId, handlePatientSelect, onMessage, onEmail, onMore]
  );

  // Mobile drawer toggle button (shown on small screens)
  const MobileToggle = showMobileToggle ? (
    <div className="fixed bottom-4 left-4 z-50 md:hidden">
      <Button
        variant="default"
        size="icon"
        className="h-12 w-12 rounded-full shadow-lg"
        onClick={() => setMobileDrawerOpen(true)}
        aria-label="Open patient roster"
      >
        <ChevronLeft className="h-5 w-5" />
      </Button>
    </div>
  ) : null;

  // Mobile drawer overlay
  const MobileDrawer = (
    <AnimatePresence>
      {mobileDrawerOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="bg-foreground/20 fixed inset-0 z-50 md:hidden"
            onClick={() => setMobileDrawerOpen(false)}
            aria-hidden="true"
          />

          {/* Drawer */}
          <motion.aside
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{
              duration: ROSTER_ANIMATION_CONFIG.duration,
              ease: ROSTER_ANIMATION_CONFIG.ease,
            }}
            className="bg-card fixed inset-y-0 left-0 z-50 w-[320px] max-w-[85vw] shadow-xl md:hidden"
          >
            <div className="flex h-full flex-col">
              {/* Header */}
              <div className="flex items-center justify-between border-b p-4">
                <Text className="font-semibold">Patients</Text>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setMobileDrawerOpen(false)}
                  aria-label="Close patient roster"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>

              {/* Search */}
              <div className="relative p-3">
                <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-6 h-4 w-4 -translate-y-1/2" />
                <Input
                  type="text"
                  placeholder="Search patients..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-popover h-10 rounded-lg pl-10"
                />
              </div>

              {/* Patient List */}
              <div className="flex-1 space-y-2 overflow-y-auto p-3">
                <AnimatePresence mode="popLayout">
                  {filteredPatients.map(renderPatientCard)}
                </AnimatePresence>
                {filteredPatients.length === 0 && (
                  <Text size="sm" muted className="py-8 text-center">
                    No patients found
                  </Text>
                )}
              </div>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );

  // Desktop roster (hidden on mobile, uses animation)
  return (
    <>
      {/* Mobile components */}
      {MobileToggle}
      {MobileDrawer}

      {/* Desktop animated roster */}
      <AnimatePresence mode="wait">
        {isVisible && (
          <motion.aside
            initial={false}
            animate={{
              width: rosterWidth,
              opacity: rosterWidth === 0 ? 0 : 1,
            }}
            exit={{
              width: 0,
              opacity: 0,
            }}
            transition={{
              duration: ROSTER_ANIMATION_CONFIG.duration,
              ease: ROSTER_ANIMATION_CONFIG.ease,
            }}
            style={{ willChange: "width, opacity" }}
            className={cn("hidden shrink-0 overflow-hidden md:block", className)}
          >
            <CardWrapper className="flex h-full flex-col overflow-hidden">
              {/* Search Input - Only show in full mode */}
              <AnimatePresence>
                {cardType === "full" && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                    className="relative mb-3 sm:mb-4"
                  >
                    <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
                    <Input
                      type="text"
                      placeholder="Search patients..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="bg-popover h-9 rounded-lg pl-10 sm:h-10"
                    />
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Patient List */}
              <div
                className={cn(
                  "-mx-3 flex-1 overflow-y-auto px-3 pb-2",
                  cardType === "full" ? "space-y-2" : "space-y-1"
                )}
              >
                <AnimatePresence mode="popLayout">
                  {filteredPatients.map(renderPatientCard)}
                </AnimatePresence>
                {filteredPatients.length === 0 && (
                  <Text size="sm" muted className="py-8 text-center">
                    No patients found
                  </Text>
                )}
              </div>
            </CardWrapper>
          </motion.aside>
        )}
      </AnimatePresence>
    </>
  );
}

/**
 * Controlled PatientRoster that accepts viewState as a prop
 * Use this when you want to control the state externally
 */
export function PatientRosterControlled({
  viewState,
  ...props
}: PatientRosterProps & { viewState: PatientViewState }) {
  return <PatientRoster {...props} viewState={viewState} />;
}
