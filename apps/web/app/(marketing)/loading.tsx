export default function MarketingLoading() {
  return (
    <div>
      {/* Hero skeleton */}
      <div className="bg-muted/50 py-16 md:py-24">
        <div className="container mx-auto px-4 text-center space-y-4">
          <div className="mx-auto h-6 w-24 animate-pulse rounded bg-muted" />
          <div className="mx-auto h-10 w-80 max-w-full animate-pulse rounded bg-muted" />
          <div className="mx-auto h-5 w-96 max-w-full animate-pulse rounded bg-muted" />
          <div className="flex justify-center gap-4 pt-4">
            <div className="h-10 w-36 animate-pulse rounded bg-muted" />
            <div className="h-10 w-36 animate-pulse rounded bg-muted" />
          </div>
        </div>
      </div>

      {/* Content skeleton */}
      <div className="container mx-auto px-4 py-16 space-y-8">
        <div className="mx-auto h-6 w-48 animate-pulse rounded bg-muted" />
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 max-w-5xl mx-auto">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="rounded-lg border p-6 space-y-3">
              <div className="h-10 w-10 animate-pulse rounded-full bg-muted" />
              <div className="h-4 w-3/4 animate-pulse rounded bg-muted" />
              <div className="h-3 w-full animate-pulse rounded bg-muted" />
              <div className="h-3 w-2/3 animate-pulse rounded bg-muted" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
