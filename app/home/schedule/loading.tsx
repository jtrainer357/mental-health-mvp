import { Skeleton } from "@/design-system/components/ui/skeleton";

export default function ScheduleLoading() {
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
          <div className="mx-auto flex max-w-[1600px] flex-col">
            {/* Filter tabs and button */}
            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex gap-2">
                <Skeleton className="h-9 w-32 rounded-full" />
                <Skeleton className="h-9 w-24 rounded-full" />
                <Skeleton className="h-9 w-24 rounded-full" />
              </div>
              <Skeleton className="h-10 w-36 rounded-lg" />
            </div>

            {/* Calendar Card */}
            <div className="border-border/50 bg-card/90 flex flex-1 flex-col overflow-hidden rounded-xl border p-4 sm:p-6">
              {/* Calendar Header */}
              <div className="mb-6 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Skeleton className="h-9 w-9 rounded-full" />
                  <Skeleton className="h-6 w-48" />
                  <Skeleton className="h-9 w-9 rounded-full" />
                </div>
                <div className="flex gap-2">
                  <Skeleton className="h-9 w-20 rounded-full" />
                  <Skeleton className="h-9 w-20 rounded-full" />
                </div>
              </div>

              {/* Week Day Headers */}
              <div className="mb-2 hidden grid-cols-7 gap-1 lg:grid">
                {Array.from({ length: 7 }).map((_, i) => (
                  <Skeleton key={i} className="h-8" />
                ))}
              </div>

              {/* Calendar Grid */}
              <div className="flex-1">
                {/* Time slots and events grid */}
                <div className="hidden lg:grid lg:grid-cols-7 lg:gap-1">
                  {Array.from({ length: 7 }).map((_, dayIndex) => (
                    <div key={dayIndex} className="space-y-1">
                      {Array.from({ length: 8 }).map((_, slotIndex) => (
                        <Skeleton key={slotIndex} className="h-12 rounded-lg" />
                      ))}
                    </div>
                  ))}
                </div>

                {/* Mobile: Day view */}
                <div className="lg:hidden">
                  <div className="mb-4 flex gap-1 overflow-x-auto pb-2">
                    {Array.from({ length: 7 }).map((_, i) => (
                      <Skeleton key={i} className="h-16 w-12 shrink-0 rounded-lg" />
                    ))}
                  </div>
                  <div className="space-y-2">
                    {Array.from({ length: 6 }).map((_, i) => (
                      <Skeleton key={i} className="h-16 w-full rounded-lg" />
                    ))}
                  </div>
                </div>
              </div>

              {/* Calendar connect buttons */}
              <div className="mt-4 flex flex-wrap gap-2">
                <Skeleton className="h-8 w-32 rounded-lg" />
                <Skeleton className="h-8 w-32 rounded-lg" />
                <Skeleton className="h-8 w-32 rounded-lg" />
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
