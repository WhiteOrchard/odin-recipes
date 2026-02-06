import { MousePointerClick, Plus, Layers } from 'lucide-react';

export default function FloorPlanLegend() {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-concrete-800">
      <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">Status legend</h3>
      <div className="mt-3 space-y-2">
        <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
          <span className="h-3 w-3 rounded-full bg-blue-400" />
          Planned
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
          <span className="h-3 w-3 rounded-full bg-yolk-500" />
          In Progress
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
          <span className="h-3 w-3 rounded-full bg-emerald-500" />
          Completed
        </div>
      </div>
      <div className="mt-4 border-t border-slate-100 pt-3 dark:border-slate-700">
        <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">How to use</h3>
        <ul className="mt-2 space-y-2 text-xs text-slate-500 dark:text-slate-400">
          <li className="flex items-start gap-2">
            <MousePointerClick size={12} className="mt-0.5 text-yolk-500" />
            Click pins on the plan to view details
          </li>
          <li className="flex items-start gap-2">
            <Plus size={12} className="mt-0.5 text-yolk-500" />
            Use &quot;Add Work Point&quot; then click to place
          </li>
          <li className="flex items-start gap-2">
            <Layers size={12} className="mt-0.5 text-yolk-500" />
            Switch between floor plans using the tabs
          </li>
        </ul>
      </div>
    </div>
  );
}
