import { Skeleton, MetricCardSkeleton } from "@/design-system/components/ui/skeleton";

export default function BillingLoading() {
  return (
    <div className="flex h-screen flex-col pb-24 md:pb-0">
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
      <div className="flex min-h-0 flex-1 flex-col md:pl-24">
        {/* Header Search Skeleton */}
        <header className="border-border/50 bg-background/80 sticky top-0 z-30 border-b px-4 py-3 backdrop-blur-sm sm:px-6">
          <div className="mx-auto flex max-w-[1600px] items-center gap-4">
            <Skeleton className="h-10 max-w-md flex-1 rounded-full" />
            <Skeleton className="h-10 w-10 rounded-full" />
          </div>
        </header>

        <main className="flex-1 overflow-y-auto px-4 py-4 sm:px-6 sm:py-6 md:py-8">
          <div className="mx-auto max-w-[1600px] pb-10">
            {/* Upsell Banner Skeleton */}
            <div className="from-muted to-muted/80 mb-8 overflow-hidden rounded-xl bg-gradient-to-r p-4 sm:p-6 md:p-8">
              <div className="flex flex-col items-start gap-4 md:flex-row md:items-center md:justify-between md:gap-6">
                <div className="flex flex-1 items-start gap-4 md:gap-6">
                  <Skeleton className="hidden h-16 w-16 shrink-0 rounded-lg md:block" />
                  <div className="flex-1">
                    <Skeleton className="mb-2 h-4 w-32" />
                    <Skeleton className="mb-2 h-8 w-64" />
                    <Skeleton className="h-4 w-80" />
                  </div>
                </div>
                <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
                  <Skeleton className="h-10 w-28 rounded-lg" />
                  <Skeleton className="h-10 w-32 rounded-lg" />
                </div>
              </div>
            </div>

            {/* Metrics Grid */}
            <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              <MetricCardSkeleton />
              <MetricCardSkeleton />
              <MetricCardSkeleton />
            </div>

            {/* Advanced Billing Features Card */}
            <div className="border-border/50 bg-card/90 rounded-xl border p-6">
              <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <Skeleton className="mb-2 h-6 w-48" />
                  <Skeleton className="h-4 w-72" />
                </div>
                <Skeleton className="h-10 w-48 rounded-lg" />
              </div>

              {/* Feature Grid */}
              <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="border-border bg-card rounded-xl border p-4">
                    <div className="mb-3 flex items-center gap-3">
                      <Skeleton className="h-10 w-10 shrink-0 rounded-lg" />
                      <Skeleton className="h-4 w-32" />
                    </div>
                    <Skeleton className="h-12 w-full" />
                  </div>
                ))}
              </div>

              {/* Financial Performance Section */}
              <div className="border-border bg-card rounded-xl border p-4 sm:p-6">
                <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                  <Skeleton className="h-6 w-40" />
                  <Skeleton className="h-4 w-48" />
                </div>

                {/* Revenue Summary */}
                <div className="mb-6">
                  <Skeleton className="mb-2 h-10 w-36" />
                  <Skeleton className="h-4 w-32" />
                </div>

                {/* Bar Chart */}
                <div className="mb-8 flex h-32 items-end gap-3">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <Skeleton
                      key={i}
                      className="flex-1 rounded-t"
                      style={{ height: `${40 + Math.random() * 60}%` }}
                    />
                  ))}
                </div>

                {/* Circular Progress Indicators */}
                <div className="mb-6 grid grid-cols-1 gap-6 sm:grid-cols-3 sm:gap-4">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="flex flex-col items-center">
                      <Skeleton className="h-24 w-24 rounded-full" />
                      <Skeleton className="mt-2 h-4 w-24" />
                    </div>
                  ))}
                </div>

                {/* Alert Cards */}
                <div className="space-y-3">
                  {Array.from({ length: 2 }).map((_, i) => (
                    <div
                      key={i}
                      className="border-border bg-card flex flex-col gap-3 rounded-lg border p-4 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <Skeleton className="h-10 w-10 shrink-0 rounded-full" />
                        <div>
                          <Skeleton className="mb-1 h-4 w-28" />
                          <Skeleton className="h-3 w-40" />
                        </div>
                      </div>
                      <Skeleton className="h-8 w-24 rounded-lg" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
