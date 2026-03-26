"use client";

import * as React from "react";
import { Search } from "lucide-react";
import { Input } from "@/design-system/components/ui/input";
import { CardWrapper } from "@/design-system/components/ui/card-wrapper";
import { PatientListCard, PatientStatus } from "@/design-system/components/ui/patient-list-card";
import { Text } from "@/design-system/components/ui/typography";
import { cn } from "@/design-system/lib/utils";

export interface Patient {
  id: string;
  name: string;
  age: number;
  dob: string;
  phone: string;
  lastActivity: string;
  status: PatientStatus;
  avatarSrc?: string;
}

interface PatientListSidebarProps {
  patients: Patient[];
  selectedPatientId?: string;
  onPatientSelect?: (patient: Patient) => void;
  activeFilter?: string;
  compact?: boolean;
  className?: string;
}

export function PatientListSidebar({
  patients,
  selectedPatientId,
  onPatientSelect,
  activeFilter = "all",
  compact = false,
  className,
}: PatientListSidebarProps) {
  const [searchQuery, setSearchQuery] = React.useState("");
  const listRef = React.useRef<HTMLDivElement>(null);
  const hasScrolled = React.useRef(false);

  // Auto-scroll to selected patient when first loaded
  React.useEffect(() => {
    if (selectedPatientId && listRef.current && !hasScrolled.current) {
      hasScrolled.current = true;
      requestAnimationFrame(() => {
        const el = listRef.current?.querySelector(`[data-patient-id="${selectedPatientId}"]`);
        if (el) {
          el.scrollIntoView({ block: "center", behavior: "smooth" });
        }
      });
    }
  }, [selectedPatientId]);

  const filteredPatients = React.useMemo(() => {
    let filtered = patients;

    // Filter by tab
    if (activeFilter === "active") {
      filtered = filtered.filter((p) => p.status === "ACTIVE");
    } else if (activeFilter === "new") {
      filtered = filtered.filter((p) => p.status === "NEW");
    } else if (activeFilter === "inactive") {
      filtered = filtered.filter((p) => p.status === "INACTIVE");
    }

    // Filter by search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (p) => p.name.toLowerCase().includes(query) || p.phone.includes(query)
      );
    }

    return filtered;
  }, [patients, activeFilter, searchQuery]);

  return (
    <CardWrapper
      className={cn("border-border/70 flex min-h-0 flex-1 flex-col overflow-hidden", className)}
    >
      {/* Search Input */}
      <div className="relative mb-3 sm:mb-4">
        <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
        <Input
          type="text"
          placeholder="Search patients..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="bg-popover h-9 rounded-lg pl-10 sm:h-10"
        />
      </div>

      {/* Patient List */}
      <div
        ref={listRef}
        className={cn(
          "-mx-3 flex-1 overflow-y-auto px-3 pb-2",
          compact ? "space-y-1" : "space-y-2"
        )}
      >
        {filteredPatients.map((patient) => (
          <div key={patient.id} data-patient-id={patient.id}>
            <PatientListCard
              name={patient.name}
              age={patient.age}
              dob={patient.dob}
              phone={patient.phone}
              lastActivity={patient.lastActivity}
              status={patient.status}
              avatarSrc={patient.avatarSrc}
              selected={selectedPatientId === patient.id}
              compact={compact}
              onSelect={() => onPatientSelect?.(patient)}
            />
          </div>
        ))}
        {filteredPatients.length === 0 && (
          <Text size="sm" muted className="py-8 text-center">
            No patients found
          </Text>
        )}
      </div>
    </CardWrapper>
  );
}

export type { PatientListSidebarProps };
