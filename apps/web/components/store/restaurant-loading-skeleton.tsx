import { Skeleton } from "@workspace/ui/components/skeleton";

export function RestaurantLoadingSkeleton() {
  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      <Skeleton className="h-48 w-full rounded-lg" />
      <Skeleton className="h-8 w-64" />
      <Skeleton className="h-4 w-48" />
    </div>
  );
}
