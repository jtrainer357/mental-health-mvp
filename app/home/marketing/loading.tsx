import {
  Skeleton,
  MetricCardSkeleton,
  TableRowSkeleton,
} from "@/design-system/components/ui/skeleton";

export default function MarketingLoading() {
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
            <div className="from-muted to-muted/80 mb-8 overflow-hidden rounded-xl bg-gradient-to-r p-8">
              <div className="flex flex-col items-start gap-6 md:flex-row md:items-center md:justify-between">
                <div className="flex flex-1 items-start gap-6">
                  <Skeleton className="hidden h-16 w-16 shrink-0 rounded-lg md:block" />
                  <div className="flex-1">
                    <Skeleton className="mb-2 h-4 w-32" />
                    <Skeleton className="mb-2 h-8 w-80" />
                    <Skeleton className="h-4 w-96" />
                  </div>
                </div>
                <div className="flex flex-col gap-3 sm:flex-row">
                  <Skeleton className="h-10 w-28 rounded-lg" />
                  <Skeleton className="h-10 w-32 rounded-lg" />
                </div>
              </div>
            </div>

            {/* Metrics Grid */}
            <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
              {/* Review Score Card */}
              <div className="border-border/50 bg-card/90 rounded-xl border p-6">
                <Skeleton className="mb-2 h-4 w-24" />
                <div className="mb-2 flex items-baseline gap-2">
                  <Skeleton className="h-8 w-12" />
                  <div className="flex gap-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Skeleton key={i} className="h-5 w-5 rounded-sm" />
                    ))}
                  </div>
                </div>
                <Skeleton className="h-4 w-20" />
              </div>
              <MetricCardSkeleton />
              <MetricCardSkeleton />
              <MetricCardSkeleton />
            </div>

            {/* Competitive Landscape */}
            <div className="border-border/50 bg-card/90 mb-8 rounded-xl border p-6">
              <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <Skeleton className="mb-2 h-6 w-64" />
                  <Skeleton className="h-4 w-80" />
                </div>
                <Skeleton className="h-10 w-48 rounded-lg" />
              </div>

              {/* Warning Banner */}
              <div className="bg-muted mb-6 flex items-start gap-3 rounded-lg p-4">
                <Skeleton className="h-5 w-5 shrink-0 rounded-sm" />
                <div className="flex-1">
                  <Skeleton className="mb-1 h-4 w-64" />
                  <Skeleton className="h-3 w-full max-w-md" />
                </div>
              </div>

              {/* Table */}
              <div className="overflow-x-auto">
                <div className="mb-3 flex gap-4 px-2">
                  <Skeleton className="h-3 w-32" />
                  <Skeleton className="h-3 w-12" />
                  <Skeleton className="h-3 w-12" />
                  <Skeleton className="h-3 w-12" />
                  <Skeleton className="ml-auto h-3 w-16" />
                </div>
                {Array.from({ length: 6 }).map((_, i) => (
                  <TableRowSkeleton key={i} columns={5} />
                ))}
              </div>

              {/* Footer Stats */}
              <div className="border-border mt-6 grid grid-cols-1 gap-4 border-t pt-6 sm:grid-cols-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="text-center">
                    <Skeleton className="mx-auto mb-1 h-8 w-16" />
                    <Skeleton className="mx-auto h-3 w-28" />
                  </div>
                ))}
              </div>
            </div>

            {/* Additional Info Cards */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 3 }).map((_, cardIndex) => (
                <div
                  key={cardIndex}
                  className="border-border/50 bg-card/90 flex flex-col rounded-xl border p-6"
                >
                  <Skeleton className="mb-4 h-5 w-32" />
                  <div className="flex-1 space-y-4">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <div key={i} className="border-muted border-b pb-3 last:border-0">
                        <div className="mb-1 flex items-center justify-between">
                          <Skeleton className="h-4 w-20" />
                          <Skeleton className="h-3 w-16" />
                        </div>
                        <div className="flex gap-1">
                          {Array.from({ length: 5 }).map((_, j) => (
                            <Skeleton key={j} className="h-4 w-4 rounded-sm" />
                          ))}
                        </div>
                        <Skeleton className="mt-1 h-3 w-48" />
                      </div>
                    ))}
                  </div>
                  <div className="mt-auto flex justify-center pt-4">
                    <Skeleton className="h-8 w-24 rounded-lg" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
