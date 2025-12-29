import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface SkeletonCardProps {
  className?: string;
  hasHeader?: boolean;
  lines?: number;
  hasIcon?: boolean;
}

export function SkeletonCard({
  className,
  hasHeader = true,
  lines = 2,
  hasIcon = false,
}: SkeletonCardProps) {
  return (
    <Card className={cn("border-0 shadow-soft", className)}>
      {hasHeader && (
        <CardHeader className="pb-2">
          <div className="flex items-center gap-3">
            {hasIcon && <Skeleton className="w-10 h-10 rounded-full" />}
            <div className="flex-1 space-y-2">
              <Skeleton className="h-5 w-1/3" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          </div>
        </CardHeader>
      )}
      <CardContent className="space-y-3">
        {Array.from({ length: lines }).map((_, i) => (
          <Skeleton
            key={i}
            className={cn("h-4", i === lines - 1 ? "w-2/3" : "w-full")}
          />
        ))}
      </CardContent>
    </Card>
  );
}

export function SkeletonGrid({
  count = 4,
  columns = 2,
}: {
  count?: number;
  columns?: number;
}) {
  return (
    <div
      className={cn(
        "grid gap-4",
        columns === 2 && "grid-cols-2",
        columns === 3 && "grid-cols-3",
        columns === 4 && "grid-cols-4"
      )}
    >
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} hasHeader={false} lines={1} />
      ))}
    </div>
  );
}
