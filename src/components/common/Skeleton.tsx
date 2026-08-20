import React from 'react';

export const Skeleton: React.FC<{ className?: string }> = ({ className = 'h-4 w-full' }) => {
  return (
    <div
      aria-busy="true"
      aria-label="Memuat data"
      className={`bg-slate-200/80 animate-pulse rounded-lg ${className}`}
    />
  );
};

export const CardSkeleton: React.FC = () => (
  <div className="p-5 rounded-2xl glass-card space-y-4">
    <div className="flex items-center justify-between">
      <Skeleton className="h-4 w-28" />
      <Skeleton className="h-8 w-8 rounded-full" />
    </div>
    <Skeleton className="h-8 w-36" />
    <Skeleton className="h-3 w-24" />
  </div>
);

export const TableSkeleton: React.FC<{ rows?: number }> = ({ rows = 5 }) => (
  <div className="w-full space-y-3" aria-busy="true" aria-label="Memuat tabel">
    {Array.from({ length: rows }).map((_, i) => (
      <div key={i} className="flex items-center justify-between p-4 glass-card rounded-xl gap-4">
        <Skeleton className="h-4 w-1/4" />
        <Skeleton className="h-4 w-1/6" />
        <Skeleton className="h-4 w-1/6" />
        <Skeleton className="h-6 w-20 rounded-full" />
      </div>
    ))}
  </div>
);
