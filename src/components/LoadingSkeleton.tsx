import { clsx } from 'clsx';

interface LoadingSkeletonProps {
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular';
  width?: string | number;
  height?: string | number;
  count?: number;
}

export default function LoadingSkeleton({
  className,
  variant = 'text',
  width,
  height,
  count = 1,
}: LoadingSkeletonProps) {
  const baseClasses = 'animate-pulse bg-slate-200 dark:bg-concrete-700';

  const variantClasses = {
    text: 'h-4 rounded',
    circular: 'rounded-full',
    rectangular: 'rounded-lg',
  };

  const skeletonClasses = clsx(
    baseClasses,
    variantClasses[variant],
    className
  );

  const style = {
    width: width || (variant === 'text' ? '100%' : undefined),
    height: height || (variant === 'text' ? undefined : '100%'),
  };

  if (count === 1) {
    return <div className={skeletonClasses} style={style} />;
  }

  return (
    <div className="space-y-2">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className={skeletonClasses} style={style} />
      ))}
    </div>
  );
}

// Preset loading components
export function CardSkeleton() {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-concrete-900">
      <div className="flex items-start gap-4">
        <LoadingSkeleton variant="circular" width={48} height={48} />
        <div className="flex-1 space-y-3">
          <LoadingSkeleton width="60%" />
          <LoadingSkeleton width="40%" />
          <LoadingSkeleton width="80%" />
        </div>
      </div>
    </div>
  );
}

export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex gap-4">
          <LoadingSkeleton width={40} height={40} variant="rectangular" />
          <div className="flex-1 space-y-2">
            <LoadingSkeleton width="30%" />
            <LoadingSkeleton width="50%" />
          </div>
        </div>
      ))}
    </div>
  );
}
