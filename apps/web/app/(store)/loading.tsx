export default function StoreLoading() {
  return (
    <div className="space-y-8">
      {/* Hero skeleton */}
      <div className="bg-muted/50 py-16 md:py-24">
        <div className="container mx-auto px-4 text-center space-y-4">
          <div className="mx-auto h-8 w-64 animate-pulse rounded bg-muted" />
          <div className="mx-auto h-5 w-96 max-w-full animate-pulse rounded bg-muted" />
          <div className="mx-auto h-10 w-40 animate-pulse rounded bg-muted" />
        </div>
      </div>

      {/* Category bar skeleton */}
      <div className="container mx-auto space-y-8 px-4 pb-12">
        <div className="flex gap-4 overflow-hidden">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex flex-col items-center gap-2">
              <div className="h-16 w-16 animate-pulse rounded-full bg-muted" />
              <div className="h-3 w-14 animate-pulse rounded bg-muted" />
            </div>
          ))}
        </div>

        {/* Card grid skeleton */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="rounded-lg border">
              <div className="h-40 animate-pulse rounded-t-lg bg-muted" />
              <div className="space-y-2 p-4">
                <div className="h-4 w-3/4 animate-pulse rounded bg-muted" />
                <div className="h-3 w-1/2 animate-pulse rounded bg-muted" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
