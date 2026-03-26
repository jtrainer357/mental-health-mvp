import { Skeleton, ConversationCardSkeleton } from "@/design-system/components/ui/skeleton";

export default function CommunicationsLoading() {
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
          <div className="mx-auto flex max-w-[1800px] flex-col">
            <div className="flex h-full flex-col gap-4 lg:flex-row">
              {/* Conversations List */}
              <div className="w-full rounded-xl border border-gray-200/50 bg-white/90 p-4 lg:w-80">
                {/* Search */}
                <Skeleton className="mb-4 h-10 w-full rounded-lg" />

                {/* Filter Tabs */}
                <div className="mb-4 flex gap-2">
                  <Skeleton className="h-8 w-16 rounded-full" />
                  <Skeleton className="h-8 w-20 rounded-full" />
                  <Skeleton className="h-8 w-20 rounded-full" />
                </div>

                {/* Conversation Cards */}
                <div className="space-y-2">
                  {Array.from({ length: 8 }).map((_, i) => (
                    <ConversationCardSkeleton key={i} />
                  ))}
                </div>
              </div>

              {/* Message Thread */}
              <div className="flex flex-1 flex-col rounded-xl border border-gray-200/50 bg-white/90">
                {/* Thread Header */}
                <div className="border-b border-gray-200 p-4">
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-10 w-10 shrink-0 rounded-full" />
                    <div className="flex-1">
                      <Skeleton className="mb-1 h-5 w-32" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                    <Skeleton className="h-8 w-8 rounded-lg" />
                  </div>
                </div>

                {/* Messages Area */}
                <div className="flex-1 space-y-4 p-4">
                  {/* Incoming message */}
                  <div className="flex gap-3">
                    <Skeleton className="h-8 w-8 shrink-0 rounded-full" />
                    <Skeleton className="h-20 w-2/3 rounded-lg" />
                  </div>
                  {/* Outgoing message */}
                  <div className="flex justify-end">
                    <Skeleton className="h-16 w-1/2 rounded-lg" />
                  </div>
                  {/* Incoming message */}
                  <div className="flex gap-3">
                    <Skeleton className="h-8 w-8 shrink-0 rounded-full" />
                    <Skeleton className="h-24 w-3/5 rounded-lg" />
                  </div>
                </div>

                {/* Message Input */}
                <div className="border-t border-gray-200 p-4">
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-10 flex-1 rounded-lg" />
                    <Skeleton className="h-10 w-10 rounded-lg" />
                  </div>
                </div>
              </div>

              {/* AI Suggested Replies (Desktop) */}
              <div className="hidden w-72 flex-col gap-3 xl:flex">
                <div className="rounded-xl border border-gray-200/50 bg-white/90 p-4">
                  <Skeleton className="mb-3 h-5 w-28" />
                  <div className="space-y-2">
                    <Skeleton className="h-16 w-full rounded-lg" />
                    <Skeleton className="h-16 w-full rounded-lg" />
                    <Skeleton className="h-16 w-full rounded-lg" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
