"use client";

import { PatientCardSkeleton, Skeleton } from "@/design-system/components/ui/skeleton";
import { CardWrapper } from "@/design-system/components/ui/card-wrapper";

export function PatientsPageSkeleton() {
  return (
    <div className="flex h-full flex-col">
      <div className="grid min-h-0 flex-1 grid-cols-1 gap-2 lg:grid-cols-12">
        {/* Patient List Column Skeleton */}
        <div className="flex min-h-0 flex-col lg:col-span-5 xl:col-span-4">
          <div className="mb-4 flex items-center gap-2">
            <Skeleton className="h-9 w-24 rounded-full" />
            <Skeleton className="h-9 w-16 rounded-full" />
            <Skeleton className="h-9 w-14 rounded-full" />
          </div>
          <CardWrapper className="flex-1 p-4">
            <Skeleton className="mb-4 h-10 w-full rounded-lg" />
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <PatientCardSkeleton key={i} />
              ))}
            </div>
          </CardWrapper>
        </div>
        {/* Patient Detail Column Skeleton */}
        <div className="flex min-h-0 flex-col lg:col-span-7 xl:col-span-8">
          <div className="mb-4 flex justify-end">
            <Skeleton className="h-10 w-32 rounded-full" />
          </div>
          <CardWrapper className="flex-1 p-6">
            <div className="mb-6 flex items-center gap-4">
              <Skeleton className="h-20 w-20 rounded-full" />
              <div className="flex-1">
                <Skeleton className="mb-2 h-7 w-48" />
                <Skeleton className="mb-2 h-4 w-32" />
                <Skeleton className="h-4 w-24" />
              </div>
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-20 rounded-lg" />
              ))}
            </div>
            <Skeleton className="mt-6 h-8 w-full" />
            <div className="mt-4 space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-16 rounded-lg" />
              ))}
            </div>
          </CardWrapper>
        </div>
      </div>
    </div>
  );
}

export function PatientDetailSkeleton() {
  return (
    <CardWrapper className="min-h-0 flex-1 p-6">
      <div className="mb-6 flex items-center gap-4">
        <Skeleton className="h-20 w-20 rounded-full" />
        <div className="flex-1">
          <Skeleton className="mb-2 h-7 w-48" />
          <Skeleton className="mb-2 h-4 w-32" />
          <Skeleton className="h-4 w-24" />
        </div>
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-20 rounded-lg" />
        ))}
      </div>
      <Skeleton className="mt-6 h-10 w-full rounded-lg" />
      <div className="mt-4 space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-16 rounded-lg" />
        ))}
      </div>
    </CardWrapper>
  );
}
