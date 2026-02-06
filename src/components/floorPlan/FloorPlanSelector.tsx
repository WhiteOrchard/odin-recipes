import { Plus } from 'lucide-react';
import { clsx } from 'clsx';
import type { Property } from '../../types';
import type { FloorPlan } from '../../types/floorPlan';

interface FloorPlanSelectorProps {
  properties: Property[];
  selectedPropertyId: string;
  onPropertyChange: (propertyId: string) => void;
  floorPlans: FloorPlan[];
  selectedPlanId: string | null;
  onPlanChange: (planId: string) => void;
  onAddPlan: () => void;
}

export default function FloorPlanSelector({
  properties,
  selectedPropertyId,
  onPropertyChange,
  floorPlans,
  selectedPlanId,
  onPlanChange,
  onAddPlan,
}: FloorPlanSelectorProps) {
  return (
    <div className="space-y-3">
      {/* Property selector */}
      <div className="flex items-center gap-3">
        <label htmlFor="property-select" className="text-sm font-medium text-slate-600 dark:text-slate-400">
          Property:
        </label>
        <select
          id="property-select"
          value={selectedPropertyId}
          onChange={(e) => onPropertyChange(e.target.value)}
          className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-900 outline-none focus:border-yolk-400 dark:border-slate-600 dark:bg-concrete-800 dark:text-white"
        >
          {properties.map(p => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>
      </div>

      {/* Floor plan tabs */}
      <div className="flex flex-wrap items-center gap-2">
        {floorPlans.map(fp => (
          <button
            key={fp.id}
            onClick={() => onPlanChange(fp.id)}
            className={clsx(
              'rounded-lg border px-4 py-2 text-sm font-medium transition-colors',
              selectedPlanId === fp.id
                ? 'border-yolk-400 bg-yolk-50 text-yolk-700 dark:border-yolk-600 dark:bg-yolk-900/30 dark:text-yolk-400'
                : 'border-slate-200 text-slate-600 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-800'
            )}
          >
            {fp.name} - {fp.floor}
          </button>
        ))}
        <button
          onClick={onAddPlan}
          className="flex items-center gap-1.5 rounded-lg border border-dashed border-slate-300 px-3 py-2 text-sm font-medium text-slate-500 hover:border-slate-400 hover:text-slate-600 dark:border-slate-600 dark:text-slate-400 dark:hover:border-slate-500"
        >
          <Plus size={14} />
          Add Floor Plan
        </button>
      </div>
    </div>
  );
}
