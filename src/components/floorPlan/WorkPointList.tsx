import { clsx } from 'clsx';
import { Calendar } from 'lucide-react';
import { format } from 'date-fns';
import type { WorkPoint } from '../../types/floorPlan';

interface WorkPointListProps {
  workPoints: WorkPoint[];
  selectedPointId: string | null;
  onSelectPoint: (wp: WorkPoint) => void;
}

const statusDot = {
  planned: 'bg-blue-400',
  'in-progress': 'bg-yolk-500',
  completed: 'bg-emerald-500',
};

export default function WorkPointList({ workPoints, selectedPointId, onSelectPoint }: WorkPointListProps) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-concrete-800">
      <h3 className="font-display text-lg font-semibold text-slate-900 dark:text-white">
        Work Points ({workPoints.length})
      </h3>
      {workPoints.length === 0 ? (
        <p className="mt-3 text-sm text-slate-400">No work points on this floor plan yet.</p>
      ) : (
        <div className="mt-3 space-y-2">
          {workPoints.map(wp => (
            <button
              key={wp.id}
              onClick={() => onSelectPoint(wp)}
              className={clsx(
                'flex w-full items-center gap-3 rounded-lg border p-2.5 text-left transition-colors',
                selectedPointId === wp.id
                  ? 'border-yolk-300 bg-yolk-50 dark:border-yolk-700 dark:bg-yolk-900/20'
                  : 'border-slate-100 hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800'
              )}
            >
              <span className={clsx('h-3 w-3 shrink-0 rounded-full', statusDot[wp.status])} />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-slate-900 dark:text-white">{wp.title}</p>
                <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                  <span>{wp.room}</span>
                  {wp.dueDate && (
                    <>
                      <span>·</span>
                      <span className="flex items-center gap-1">
                        <Calendar size={10} />
                        {format(new Date(wp.dueDate), 'MMM d')}
                      </span>
                    </>
                  )}
                </div>
              </div>
              {wp.images.length > 0 && (
                <span className="rounded-full bg-slate-100 px-1.5 py-0.5 text-[10px] font-medium text-slate-500 dark:bg-slate-700 dark:text-slate-400">
                  {wp.images.length} 📷
                </span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
