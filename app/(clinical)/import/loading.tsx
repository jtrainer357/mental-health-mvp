import { Skeleton } from "@/design-system/components/ui/skeleton";

export default function ImportLoading() {
  return (
    <main className="min-h-screen bg-gray-50 py-8">
      <div className="mx-auto max-w-4xl px-4">
        {/* Header */}
        <div className="mb-8 text-center">
          <Skeleton className="mx-auto mb-4 h-8 w-48" />
          <Skeleton className="mx-auto h-4 w-96" />
        </div>

        {/* Progress Steps */}
        <div className="mb-8 flex items-center justify-center gap-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-2">
              <Skeleton className="h-8 w-8 rounded-full" />
              {i < 4 && <Skeleton className="h-0.5 w-12" />}
            </div>
          ))}
        </div>

        {/* Main Card */}
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          {/* Step Title */}
          <Skeleton className="mb-6 h-6 w-40" />

          {/* Upload Area */}
          <div className="mb-6 rounded-lg border-2 border-dashed border-gray-200 p-12">
            <div className="flex flex-col items-center">
              <Skeleton className="mb-4 h-16 w-16 rounded-lg" />
              <Skeleton className="mb-2 h-5 w-48" />
              <Skeleton className="mb-4 h-4 w-72" />
              <Skeleton className="h-10 w-32 rounded-lg" />
            </div>
          </div>

          {/* File List Preview */}
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="flex items-center justify-between rounded-lg border border-gray-200 p-4"
              >
                <div className="flex items-center gap-3">
                  <Skeleton className="h-10 w-10 rounded-lg" />
                  <div>
                    <Skeleton className="mb-1 h-4 w-40" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                </div>
                <Skeleton className="h-8 w-8 rounded-lg" />
              </div>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="mt-8 flex justify-between">
            <Skeleton className="h-10 w-24 rounded-lg" />
            <Skeleton className="h-10 w-32 rounded-lg" />
          </div>
        </div>

        {/* Help Text */}
        <div className="mt-6 text-center">
          <Skeleton className="mx-auto h-4 w-64" />
        </div>
      </div>
    </main>
  );
}
