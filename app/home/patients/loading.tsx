import { Skeleton, PatientCardSkeleton } from "@/design-system/components/ui/skeleton";

export default function PatientsLoading() {
  return (
    <div className="min-h-screen pb-24 lg:pb-0">
      {/* Left Nav Skeleton */}
      <div className="fixed bottom-0 z-40 flex w-full items-center justify-around border-t border-gray-200 bg-white/95 px-4 py-2 backdrop-blur-sm lg:top-0 lg:left-0 lg:h-screen lg:w-36 lg:flex-col lg:items-center lg:justify-start lg:gap-6 lg:border-t-0 lg:border-r lg:px-0 lg:py-8">
        <Skeleton className="hidden h-8 w-20 lg:block" />
        <div className="flex w-full items-center justify-around lg:mt-8 lg:flex-col lg:gap-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-10 w-10 rounded-lg lg:h-12 lg:w-24" />
          ))}
        </div>
      </div>

      {/* Main Content Wrapper */}
      <div className="lg:pl-36">
        {/* Header Search Skeleton */}
        <header className="sticky top-0 z-30 border-b border-gray-200/50 bg-white/80 px-4 py-3 backdrop-blur-sm sm:px-6">
          <div className="mx-auto flex max-w-[1600px] items-center gap-4">
            <Skeleton className="h-10 max-w-md flex-1 rounded-full" />
            <Skeleton className="h-10 w-10 rounded-full" />
          </div>
        </header>

        <main className="px-4 py-4 sm:px-6 sm:py-6 md:py-8">
          <div className="mx-auto max-w-[1600px]">
            <div className="flex h-full flex-col gap-4 lg:flex-row">
              {/* Patient List Sidebar */}
              <div className="w-full rounded-xl border border-gray-200/50 bg-white/90 p-4 lg:w-80">
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
              <div className="flex-1 rounded-xl border border-gray-200/50 bg-white/90 p-4 lg:p-6">
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
                <div className="mb-6 flex gap-2 border-b border-gray-200 pb-2">
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
