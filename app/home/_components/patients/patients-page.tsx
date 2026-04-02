"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { useMobileDetect } from "@/src/hooks/useMobileDetect";
import { MobileNavStack } from "@/design-system/components/ui/mobile";
import { Plus } from "lucide-react";
import { Button } from "@/design-system/components/ui/button";
import { FilterTabs } from "@/design-system/components/ui/filter-tabs";
import { PatientListSidebar } from "../patient-list-sidebar";
import { PatientDetailView } from "../patient-detail-view";
import { AddPatientModal } from "@/src/components/patients/AddPatientModal";
import { usePatientViewState } from "@/src/hooks/usePatientViewState";
import {
  getPatients,
  getPatientDetails as getPatientDetailsQuery,
  getPatientVisitSummaries,
} from "@/src/lib/queries/patients";
import { getPatientPriorityActions } from "@/src/lib/queries/priority-actions";
import { isDatabasePopulated } from "@/src/lib/queries/practice";
import type { DbPatient, Patient, PatientDetail, PatientsPageProps } from "./types";
import { patientFilterTabs } from "./types";
import { dbPatientToListItem, createPatientDetail, dbActionToUiAction } from "./utils";
import { PatientsPageSkeleton, PatientDetailSkeleton } from "./loading-skeleton";
import { EmptyPatients, DatabaseNotReady } from "./empty-states";
import type { Patient as DbPatientType } from "@/src/lib/supabase/types";

export function PatientsPage({
  initialPatientId,
  initialPatientName,
  initialTab,
  startSession,
}: PatientsPageProps) {
  const [loading, setLoading] = React.useState(true);
  const [dbReady, setDbReady] = React.useState<boolean | null>(null);
  const [patients, setPatients] = React.useState<DbPatient[]>([]);
  const [selectedPatient, setSelectedPatient] = React.useState<Patient | null>(null);
  const [patientDetails, setPatientDetails] = React.useState<PatientDetail | null>(null);
  const [detailLoading, setDetailLoading] = React.useState(false);
  const [activeFilter, setActiveFilter] = React.useState("today");
  const [addPatientOpen, setAddPatientOpen] = React.useState(false);
  // Mobile: show roster or detail (push/pop navigation)
  const [mobileShowDetail, setMobileShowDetail] = React.useState(false);
  const { isTouchDevice } = useMobileDetect();

  // Get progressive disclosure state for dynamic layout
  const { layout, transition, isRosterCompact } = usePatientViewState();

  // Stabilize props for useEffect dependencies
  const patientIdKey = initialPatientId ?? "";
  const patientNameKey = initialPatientName ?? "";

  // Load initial patients list
  React.useEffect(() => {
    async function loadPatients() {
      try {
        setLoading(true);

        // Check if database is populated
        const populated = await isDatabasePopulated();
        setDbReady(populated);

        if (!populated) {
          setLoading(false);
          return;
        }

        // Load patients list
        const patientsData = await getPatients();
        setPatients(patientsData);

        // Select patient from URL param (by ID or name), or default to first patient
        let targetPatient: DbPatient | undefined;

        if (patientNameKey) {
          // Search by name (case-insensitive, fuzzy)
          const searchName = patientNameKey.toLowerCase();
          // Try exact match first
          targetPatient = patientsData.find((p) => {
            const fullName = `${p.first_name} ${p.last_name}`.toLowerCase();
            return fullName === searchName;
          });
          // Try starts-with match for partial names
          if (!targetPatient) {
            targetPatient = patientsData.find((p) => {
              const fullName = `${p.first_name} ${p.last_name}`.toLowerCase();
              return fullName.startsWith(searchName);
            });
          }
          // Try first name only match
          if (!targetPatient) {
            targetPatient = patientsData.find((p) => {
              return p.first_name.toLowerCase() === searchName;
            });
          }
        } else if (patientIdKey) {
          targetPatient = patientsData.find((p) => p.id === patientIdKey);
        }

        if (targetPatient) {
          setSelectedPatient(dbPatientToListItem(targetPatient));
        } else if (patientsData.length > 0 && patientsData[0]) {
          setSelectedPatient(dbPatientToListItem(patientsData[0]));
        }
      } catch {
        // Error loading patients
      } finally {
        setLoading(false);
      }
    }

    void loadPatients();
  }, [patientIdKey, patientNameKey]);

  // Load selected patient details
  React.useEffect(() => {
    if (!selectedPatient || !dbReady) return;

    const patientId = selectedPatient.id;
    let cancelled = false;

    async function loadPatientDetails() {
      try {
        setDetailLoading(true);

        // Fetch patient details, priority actions, and visit summaries in parallel
        const [details, priorityActions, visitSummaries] = await Promise.all([
          getPatientDetailsQuery(patientId),
          getPatientPriorityActions(patientId),
          getPatientVisitSummaries(patientId),
        ]);

        if (cancelled) return;

        if (details) {
          const detailData = createPatientDetail(
            details.patient,
            details.appointments,
            details.invoices,
            visitSummaries,
            details.messages,
            details.outcomeMeasures,
            details.reviews
          );
          // Add priority actions to the detail data
          detailData.prioritizedActions = priorityActions.map(dbActionToUiAction);
          setPatientDetails(detailData);
        }
      } catch (err: unknown) {
        console.error("[PatientsPage] Error loading patient details:", err);
        if (!cancelled) {
          setPatientDetails(null);
        }
      } finally {
        if (!cancelled) setDetailLoading(false);
      }
    }

    void loadPatientDetails();
    return () => {
      cancelled = true;
    };
  }, [selectedPatient, dbReady]);

  const handlePatientSelect = (patient: Patient) => {
    setSelectedPatient(patient);
    if (isTouchDevice) {
      setMobileShowDetail(true);
    }
  };

  const handleBackToRoster = () => {
    setMobileShowDetail(false);
  };

  const handlePatientCreated = (newPatient: DbPatientType) => {
    // DbPatientType and DbPatient are the same type (Patient from supabase/types)
    // Just add to list and select
    setPatients((prev) => [newPatient, ...prev]);
    setSelectedPatient(dbPatientToListItem(newPatient));
  };

  // Convert patients for list
  const patientListItems = patients.map(dbPatientToListItem);

  // Loading state with skeleton
  if (loading) {
    return <PatientsPageSkeleton />;
  }

  // Empty state (no patients after loading)
  if (patientListItems.length === 0 && dbReady) {
    return <EmptyPatients activeFilter={activeFilter} onFilterChange={setActiveFilter} />;
  }

  // Database not ready state
  if (dbReady === false) {
    return <DatabaseNotReady />;
  }

  // Mobile/tablet: single-view push/pop navigation
  if (isTouchDevice) {
    return (
      <>
        <MobileNavStack
          showDetail={mobileShowDetail}
          onBack={handleBackToRoster}
          listView={
            <>
              <div className="mb-3 flex items-center justify-between">
                <FilterTabs
                  tabs={patientFilterTabs}
                  activeTab={activeFilter}
                  onTabChange={setActiveFilter}
                />
                <Button
                  onClick={() => setAddPatientOpen(true)}
                  size="sm"
                  className="gap-1.5 text-sm"
                >
                  <Plus className="h-4 w-4" />
                  Add
                </Button>
              </div>
              <PatientListSidebar
                patients={patientListItems}
                selectedPatientId={selectedPatient?.id}
                onPatientSelect={handlePatientSelect}
                activeFilter={activeFilter}
                compact={false}
                className="min-h-0 flex-1"
              />
            </>
          }
          detailView={
            detailLoading ? (
              <PatientDetailSkeleton />
            ) : (
              <PatientDetailView
                patient={patientDetails}
                className="min-h-0 flex-1"
                initialTab={initialTab}
                startSession={startSession}
                onBackToRoster={handleBackToRoster}
              />
            )
          }
        />

        <AddPatientModal
          open={addPatientOpen}
          onOpenChange={setAddPatientOpen}
          onPatientCreated={handlePatientCreated}
        />
      </>
    );
  }

  // Desktop: two-column layout with animated widths
  return (
    <>
      <div className="flex flex-col">
        {/* Main Content - Flex layout with animated widths */}
        <div className="flex gap-2">
          {/* Patient List Column - Animated width, sticky scroll */}
          <motion.div
            className="sticky top-0 flex max-h-screen flex-col self-start overflow-hidden"
            animate={{
              width: layout.rosterVisible ? layout.rosterWidth : 0,
              opacity: layout.rosterVisible ? 1 : 0,
            }}
            transition={{
              duration: transition.duration,
              ease: transition.ease as [number, number, number, number],
            }}
            style={{ minWidth: layout.rosterVisible ? layout.rosterWidth : 0 }}
          >
            {/* Filter Tabs - hidden when compact */}
            {!isRosterCompact && (
              <div className="mb-4 flex items-center justify-between">
                <FilterTabs
                  tabs={patientFilterTabs}
                  activeTab={activeFilter}
                  onTabChange={setActiveFilter}
                />
              </div>
            )}
            <PatientListSidebar
              patients={patientListItems}
              selectedPatientId={selectedPatient?.id}
              onPatientSelect={handlePatientSelect}
              activeFilter={activeFilter}
              compact={isRosterCompact}
              className="min-h-0 flex-1"
            />
          </motion.div>

          {/* Patient Detail Column - Takes remaining space, dictates page height */}
          <div className="flex flex-1 flex-col">
            {/* Add Patient Button - hidden when compact */}
            {!isRosterCompact && (
              <div className="mb-4 flex min-h-[52px] items-end justify-end">
                <Button
                  onClick={() => setAddPatientOpen(true)}
                  className="gap-1.5 text-sm sm:gap-2 sm:text-base"
                >
                  <Plus className="h-4 w-4" />
                  Add Patient
                </Button>
              </div>
            )}
            {detailLoading ? (
              <PatientDetailSkeleton />
            ) : (
              <PatientDetailView
                patient={patientDetails}
                className="min-h-0 flex-1"
                initialTab={initialTab}
                startSession={startSession}
              />
            )}
          </div>
        </div>
      </div>

      {/* Add Patient Modal */}
      <AddPatientModal
        open={addPatientOpen}
        onOpenChange={setAddPatientOpen}
        onPatientCreated={handlePatientCreated}
      />
    </>
  );
}
