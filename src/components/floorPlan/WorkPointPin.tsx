import { clsx } from 'clsx';
import type { WorkPoint } from '../../types/floorPlan';

interface WorkPointPinProps {
  workPoint: WorkPoint;
  isSelected: boolean;
  isHovered: boolean;
  scale: number;
  onClick: (e: React.MouseEvent) => void;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
}

const statusColors = {
  planned: 'bg-blue-400 ring-blue-200 dark:ring-blue-800',
  'in-progress': 'bg-yolk-500 ring-yolk-200 dark:ring-yolk-800',
  completed: 'bg-emerald-500 ring-emerald-200 dark:ring-emerald-800',
};

export default function WorkPointPin({
  workPoint,
  isSelected,
  isHovered,
  scale,
  onClick,
  onMouseEnter,
  onMouseLeave,
}: WorkPointPinProps) {
  const inverseScale = 1 / Math.max(scale, 0.5);

  return (
    <button
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      className="absolute z-10 -translate-x-1/2 -translate-y-1/2"
      style={{
        left: `${workPoint.xPercent}%`,
        top: `${workPoint.yPercent}%`,
        transform: `translate(-50%, -50%) scale(${inverseScale})`,
      }}
    >
      <div
        className={clsx(
          'flex h-7 w-7 items-center justify-center rounded-full border-2 border-white shadow-lg transition-all',
          statusColors[workPoint.status],
          isSelected && 'ring-4 scale-125',
          !isSelected && 'hover:scale-110'
        )}
      >
        <span className="text-[10px] font-bold text-white">
          {workPoint.status === 'completed' ? '✓' : workPoint.status === 'in-progress' ? '⚡' : '•'}
        </span>
      </div>

      {isHovered && (
        <div
          className="absolute bottom-full left-1/2 mb-2 -translate-x-1/2 whitespace-nowrap rounded-lg bg-slate-900 px-3 py-1.5 text-xs text-white shadow-lg dark:bg-slate-700"
        >
          {workPoint.title}
          <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-900 dark:border-t-slate-700" />
        </div>
      )}
    </button>
  );
}
