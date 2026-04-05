import { Skeleton, PatientCardSkeleton } from "@/design-system/components/ui/skeleton";

export default function PatientsLoading() {
  return (
    <div className="min-h-screen pb-24 md:pb-0">
      {/* Left Nav Skeleton */}
      <div className="border-border bg-background/95 fixed bottom-0 z-40 flex w-full items-center justify-around border-t px-4 py-2 backdrop-blur-sm md:top-0 md:left-0 md:h-screen md:w-20 md:flex-col md:items-center md:justify-start md:gap-6 md:border-t-0 md:border-r md:px-0 md:py-8">
        <Skeleton className="hidden h-8 w-20 md:block" />
        <div className="flex w-full items-center justify-around md:mt-8 md:flex-col md:gap-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-10 w-10 rounded-lg md:h-12 md:w-24" />
          ))}
        </div>
      </div>

      {/* Main Content Wrapper */}
      <div className="md:pl-24">
        {/* Header Search Skeleton */}
        <header className="border-border/50 bg-background/80 sticky top-0 z-30 border-b px-4 py-3 backdrop-blur-sm sm:px-6">
          <div className="mx-auto flex max-w-[1600px] items-center gap-4">
            <Skeleton className="h-10 max-w-md flex-1 rounded-full" />
            <Skeleton className="h-10 w-10 rounded-full" />
          </div>
        </header>

        <main className="px-4 py-4 sm:px-6 sm:py-6 md:py-8">
          <div className="mx-auto max-w-[1600px]">
            <div className="flex h-full flex-col gap-4 lg:flex-row">
              {/* Patient List Sidebar */}
              <div className="border-border/50 bg-card/90 w-full rounded-xl border p-4 lg:w-80">
                {/* Search */}
                <Skeleton className="mb-4 h-10 w-full rounded-lg" />

                {/* Filter Tabs */}
                <div className="mb-4 flex gap-2">
                  <Skeleton className="h-8 w-16 rounded-full" />
                  <Skeleton className="h-8 w-20 rounded-full" />
                  <Skeleton className="h-8 w-16 rounded-full" />
                </div>

                {/* Patient Cards */}
                <div className="space-y-3">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <PatientCardSkeleton key={i} />
                  ))}
                </div>
              </div>

              {/* Patient Detail Panel */}
              <div className="border-border/50 bg-card/90 flex-1 rounded-xl border p-4 lg:p-6">
                {/* Patient Header */}
                <div className="mb-6 flex items-start gap-4">
                  <Skeleton className="h-16 w-16 shrink-0 rounded-full" />
                  <div className="flex-1">
                    <Skeleton className="mb-2 h-6 w-40" />
                    <Skeleton className="mb-1 h-4 w-32" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                  <Skeleton className="h-8 w-20 rounded-full" />
                </div>

                {/* Tabs */}
                <div className="border-border mb-6 flex gap-2 border-b pb-2">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <Skeleton key={i} className="h-8 w-20 rounded-md" />
                  ))}
                </div>

                {/* Content Area */}
                <div className="space-y-4">
                  <Skeleton className="h-32 w-full rounded-lg" />
                  <Skeleton className="h-24 w-full rounded-lg" />
                  <Skeleton className="h-40 w-full rounded-lg" />
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
