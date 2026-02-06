import { useState, useRef, useCallback } from 'react';
import { TransformWrapper, TransformComponent, useControls } from 'react-zoom-pan-pinch';
import { ZoomIn, ZoomOut, Maximize, Plus, Move } from 'lucide-react';
import { clsx } from 'clsx';
import type { WorkPoint, FloorPlan } from '../../types/floorPlan';
import WorkPointPin from './WorkPointPin';
import FloorPlanUpload from './FloorPlanUpload';
import PdfRenderer from './PdfRenderer';

interface FloorPlanViewerProps {
  floorPlan: FloorPlan | null;
  workPoints: WorkPoint[];
  selectedPointId: string | null;
  isPlacing: boolean;
  onTogglePlacing: () => void;
  onMapClick: (xPercent: number, yPercent: number) => void;
  onPinClick: (workPoint: WorkPoint) => void;
  onUploadImage: (file: File) => Promise<void>;
  isUploading: boolean;
  address?: string;
}

function ZoomControls() {
  const { zoomIn, zoomOut, resetTransform } = useControls();
  return (
    <div className="flex items-center gap-1">
      <button
        onClick={() => zoomOut()}
        className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700"
        title="Zoom out"
      >
        <ZoomOut size={16} />
      </button>
      <button
        onClick={() => resetTransform()}
        className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700"
        title="Reset zoom"
      >
        <Maximize size={16} />
      </button>
      <button
        onClick={() => zoomIn()}
        className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700"
        title="Zoom in"
      >
        <ZoomIn size={16} />
      </button>
    </div>
  );
}

export default function FloorPlanViewer({
  floorPlan,
  workPoints,
  selectedPointId,
  isPlacing,
  onTogglePlacing,
  onMapClick,
  onPinClick,
  onUploadImage,
  isUploading,
  address,
}: FloorPlanViewerProps) {
  const [hoveredPin, setHoveredPin] = useState<string | null>(null);
  const [currentScale, setCurrentScale] = useState(1);
  const imageRef = useRef<HTMLDivElement>(null);

  const handleCanvasClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!isPlacing || !imageRef.current) return;
    const rect = imageRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    if (x >= 0 && x <= 100 && y >= 0 && y <= 100) {
      onMapClick(x, y);
    }
  }, [isPlacing, onMapClick]);

  const hasImage = floorPlan?.imageUrl;
  const isPdf = floorPlan?.imagePath?.endsWith('.pdf');

  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-concrete-800">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-200 p-4 dark:border-slate-700">
        <div>
          <h2 className="font-display text-lg font-semibold text-slate-900 dark:text-white">
            {floorPlan?.name ?? 'No floor plan selected'}
          </h2>
          {address && <p className="text-sm text-slate-500 dark:text-slate-400">{address}</p>}
        </div>
        <div className="flex items-center gap-2">
          {hasImage && (
            <button
              onClick={onTogglePlacing}
              className={clsx(
                'flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                isPlacing
                  ? 'bg-yolk-500 text-white shadow-sm'
                  : 'border border-slate-200 text-slate-600 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-800'
              )}
            >
              {isPlacing ? <Move size={16} /> : <Plus size={16} />}
              {isPlacing ? 'Click to place' : 'Add Work Point'}
            </button>
          )}
        </div>
      </div>

      {/* Canvas */}
      <div className="relative min-h-[400px] overflow-hidden">
        {!hasImage ? (
          <FloorPlanUpload onUpload={onUploadImage} isUploading={isUploading} />
        ) : (
          <TransformWrapper
            minScale={0.3}
            maxScale={4}
            initialScale={1}
            centerOnInit
            panning={{ disabled: isPlacing }}
            onTransformed={(_, state) => setCurrentScale(state.scale)}
          >
            <ZoomControls />
            <TransformComponent
              wrapperStyle={{ width: '100%', height: '100%', minHeight: '400px' }}
              contentStyle={{ width: '100%', height: '100%' }}
            >
              <div
                ref={imageRef}
                onClick={handleCanvasClick}
                className={clsx(
                  'relative',
                  isPlacing && 'cursor-crosshair'
                )}
              >
                {isPdf ? (
                  <PdfRenderer pdfUrl={floorPlan.imageUrl!} className="w-full" />
                ) : (
                  <img
                    src={floorPlan.imageUrl!}
                    alt={floorPlan.name}
                    className="w-full"
                    draggable={false}
                  />
                )}

                {/* Work point pins */}
                {workPoints.map(wp => (
                  <WorkPointPin
                    key={wp.id}
                    workPoint={wp}
                    isSelected={wp.id === selectedPointId}
                    isHovered={wp.id === hoveredPin}
                    scale={currentScale}
                    onClick={(e) => { e.stopPropagation(); onPinClick(wp); }}
                    onMouseEnter={() => setHoveredPin(wp.id)}
                    onMouseLeave={() => setHoveredPin(null)}
                  />
                ))}

                {isPlacing && (
                  <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                    <p className="rounded-lg bg-yolk-500/90 px-4 py-2 text-sm font-medium text-white shadow-lg">
                      Click on the plan to place a work point
                    </p>
                  </div>
                )}
              </div>
            </TransformComponent>
          </TransformWrapper>
        )}
      </div>
    </div>
  );
}
