import { Skeleton, PriorityActionCardSkeleton } from "@/design-system/components/ui/skeleton";

export default function HomeLoading() {
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
          <div className="mx-auto flex max-w-[1600px] flex-col gap-4 xl:flex-row xl:gap-2">
            {/* Main Content Area */}
            <div className="flex min-h-[500px] flex-1 flex-col rounded-xl border border-gray-200/50 bg-white/90 p-4 sm:p-6 xl:min-h-0">
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

            {/* Right Sidebar Widgets - Hidden below xl */}
            <aside className="hidden w-[320px] shrink-0 flex-col gap-2 xl:flex xl:w-[320px] 2xl:w-[380px]">
              {/* Messages Widget Skeleton */}
              <div className="rounded-xl border border-gray-200/50 bg-white/90 p-4">
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
              <div className="rounded-xl border border-gray-200/50 bg-white/90 p-4">
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
