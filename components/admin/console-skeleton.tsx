export function ConsoleSkeleton({ lines = 4 }: { lines?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: lines }).map((_, index) => (
        <div
          key={index}
          className="h-3 animate-pulse rounded-full bg-surface-elevated"
          style={{ width: `${70 - index * 8}%` }}
        />
      ))}
    </div>
  );
}
