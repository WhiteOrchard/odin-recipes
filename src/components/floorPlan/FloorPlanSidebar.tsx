import type { WorkPoint } from '../../types/floorPlan';
import WorkPointDetailPanel from './WorkPointDetailPanel';
import WorkPointList from './WorkPointList';
import FloorPlanLegend from './FloorPlanLegend';
import { Image } from 'lucide-react';

interface FloorPlanSidebarProps {
  workPoints: WorkPoint[];
  selectedPoint: WorkPoint | null;
  onSelectPoint: (wp: WorkPoint) => void;
  onDeselectPoint: () => void;
  onEditPoint: () => void;
  onDeletePoint: (wpId: string) => void;
  onAddComment: (wpId: string, text: string) => Promise<void>;
  onAddImage: (wpId: string, file: File) => Promise<void>;
  onRemoveImage: (imageId: string) => Promise<void>;
}

export default function FloorPlanSidebar({
  workPoints,
  selectedPoint,
  onSelectPoint,
  onDeselectPoint,
  onEditPoint,
  onDeletePoint,
  onAddComment,
  onAddImage,
  onRemoveImage,
}: FloorPlanSidebarProps) {
  return (
    <div className="space-y-4">
      {selectedPoint ? (
        <WorkPointDetailPanel
          workPoint={selectedPoint}
          onClose={onDeselectPoint}
          onEdit={onEditPoint}
          onDelete={() => onDeletePoint(selectedPoint.id)}
          onAddComment={(text) => onAddComment(selectedPoint.id, text)}
          onAddImage={(file) => onAddImage(selectedPoint.id, file)}
          onRemoveImage={onRemoveImage}
        />
      ) : (
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-concrete-800">
          <div className="flex flex-col items-center py-4 text-center">
            <Image size={32} className="text-slate-300 dark:text-slate-600" />
            <p className="mt-3 text-sm font-medium text-slate-500 dark:text-slate-400">
              Click a pin to view work details
            </p>
            <p className="mt-1 text-xs text-slate-400">
              Or add a work point to mark areas needing attention
            </p>
          </div>
        </div>
      )}

      <WorkPointList
        workPoints={workPoints}
        selectedPointId={selectedPoint?.id ?? null}
        onSelectPoint={onSelectPoint}
      />

      <FloorPlanLegend />
    </div>
  );
}
