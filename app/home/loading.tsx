import { Skeleton, PriorityActionCardSkeleton } from "@/design-system/components/ui/skeleton";

export default function HomeLoading() {
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
          <div className="mx-auto flex max-w-[1600px] flex-col gap-4 lg:flex-row lg:gap-2">
            {/* Main Content Area */}
            <div className="border-border/50 bg-card/90 flex min-h-[500px] flex-1 flex-col rounded-xl border p-4 sm:p-6 lg:min-h-0">
              {/* Priority Actions Header */}
              <div className="mb-4 flex items-center justify-between">
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-8 w-24 rounded-full" />
              </div>

              {/* Priority Action Cards */}
              <div className="space-y-3">
                <PriorityActionCardSkeleton />
                <PriorityActionCardSkeleton />
                <PriorityActionCardSkeleton />
                <PriorityActionCardSkeleton />
              </div>
            </div>

            {/* Right Sidebar Widgets - Hidden below lg */}
            <aside className="hidden w-[380px] shrink-0 flex-col gap-2 lg:flex xl:w-[400px] 2xl:w-[440px]">
              {/* Messages Widget Skeleton */}
              <div className="border-border/50 bg-card/90 rounded-xl border p-4">
                <Skeleton className="mb-4 h-5 w-24" />
                <div className="space-y-3">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <Skeleton className="h-10 w-10 shrink-0 rounded-full" />
                      <div className="flex-1">
                        <Skeleton className="mb-1 h-4 w-24" />
                        <Skeleton className="h-3 w-full" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Billing Upsell Widget Skeleton */}
              <div className="border-border/50 bg-card/90 rounded-xl border p-4">
                <Skeleton className="mb-2 h-5 w-32" />
                <Skeleton className="mb-4 h-12 w-full" />
                <Skeleton className="h-9 w-full rounded-full" />
              </div>
            </aside>
          </div>
        </main>
      </div>
    </div>
  );
}
