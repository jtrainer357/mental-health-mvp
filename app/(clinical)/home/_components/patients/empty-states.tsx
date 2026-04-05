"use client";

import Link from "next/link";
import { ChevronDown, Database, Users } from "lucide-react";
import { CardWrapper } from "@/design-system/components/ui/card-wrapper";
import { Button } from "@/design-system/components/ui/button";
import { FilterTabs } from "@/design-system/components/ui/filter-tabs";
import { Text } from "@/design-system/components/ui/typography";
import { patientFilterTabs } from "./types";

interface EmptyPatientsProps {
  activeFilter: string;
  onFilterChange: (filter: string) => void;
}

export function EmptyPatients({ activeFilter, onFilterChange }: EmptyPatientsProps) {
  return (
    <div className="flex h-full flex-col">
      <div className="grid min-h-0 flex-1 grid-cols-1 gap-2 lg:grid-cols-12">
        <div className="flex min-h-0 flex-col lg:col-span-5 xl:col-span-4">
          <div className="mb-4 flex items-center justify-between">
            <FilterTabs
              tabs={patientFilterTabs}
              activeTab={activeFilter}
              onTabChange={onFilterChange}
            />
          </div>
          <CardWrapper className="flex flex-1 flex-col items-center justify-center">
            <div className="bg-muted mb-4 flex h-14 w-14 items-center justify-center rounded-full">
              <Users className="text-muted-foreground h-7 w-7" />
            </div>
            <Text size="sm" className="mb-1 font-semibold">
              No Patients Found
            </Text>
            <Text size="xs" muted className="mb-4 text-center">
              {activeFilter !== "all"
                ? `No ${activeFilter} patients in your practice.`
                : "Add your first patient to get started."}
            </Text>
            <Button size="sm">Add Patient</Button>
          </CardWrapper>
        </div>
        <div className="flex min-h-0 flex-col lg:col-span-7 xl:col-span-8">
          <div className="mb-4 flex items-center justify-end">
            <Button className="gap-1.5 text-sm sm:gap-2 sm:text-base">
              Add Patient
              <ChevronDown className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            </Button>
          </div>
          <CardWrapper className="flex flex-1 items-center justify-center">
            <Text muted>Select a patient to view details</Text>
          </CardWrapper>
        </div>
      </div>
    </div>
  );
}

export function DatabaseNotReady() {
  return (
    <div className="flex h-full items-center justify-center">
      <div className="border-muted-foreground/30 bg-muted/20 flex flex-col items-center justify-center rounded-lg border border-dashed p-12">
        <Database className="text-muted-foreground/50 h-12 w-12" />
        <Text size="sm" muted className="mt-4 text-center">
          No patient data imported yet.
        </Text>
        <Text size="xs" muted className="mt-1 max-w-sm text-center">
          Run the import wizard to populate the database with patient data.
        </Text>
        <Link href="/import" prefetch={true} className="mt-4">
          <Button variant="default" size="sm">
            Start Import
          </Button>
        </Link>
      </div>
    </div>
  );
}
