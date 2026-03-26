import { Skeleton } from "@/design-system/components/ui/skeleton";

export default function CommunicationsLoading() {
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

        <main className="px-4 sm:px-6">
          {/* Coming Soon centered skeleton — matches actual page layout */}
          <div className="flex min-h-[calc(100vh-10rem)] flex-col items-center justify-center">
            <div className="flex w-full max-w-3xl flex-col items-center px-4 text-center">
              {/* Icon placeholder */}
              <Skeleton className="mb-10 h-24 w-24 rounded-3xl" />

              {/* Headline */}
              <Skeleton className="mb-4 h-10 w-80" />

              {/* "Coming Soon" text */}
              <Skeleton className="mb-3 h-7 w-40" />

              {/* Description */}
              <Skeleton className="mx-auto mb-12 h-14 w-full max-w-lg" />

              {/* Email input + button */}
              <div className="flex w-full max-w-md flex-col gap-3 sm:flex-row">
                <Skeleton className="h-12 flex-1 rounded-lg" />
                <Skeleton className="h-12 w-32 rounded-lg" />
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
