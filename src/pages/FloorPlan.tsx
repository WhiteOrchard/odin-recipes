import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { properties } from '../data/mockData';
import { getFloorPlansByProperty, createFloorPlan, uploadFloorPlanImage } from '../services/floorPlans';
import { getWorkPointsByFloorPlan, createWorkPoint, updateWorkPoint, deleteWorkPoint, addWorkPointImage, removeWorkPointImage, addWorkPointComment } from '../services/workPoints';
import type { FloorPlan as FloorPlanType, WorkPoint, WorkPointFormData } from '../types/floorPlan';
import FloorPlanSelector from '../components/floorPlan/FloorPlanSelector';
import FloorPlanViewer from '../components/floorPlan/FloorPlanViewer';
import FloorPlanSidebar from '../components/floorPlan/FloorPlanSidebar';
import WorkPointModal from '../components/floorPlan/WorkPointModal';
import Modal from '../components/Modal';
import { useToast, ToastContainer } from '../components/Toast';

export default function FloorPlan() {
  const { propertyId: urlPropertyId } = useParams<{ propertyId?: string }>();
  const [propertyId, setPropertyId] = useState(urlPropertyId ?? properties[0]?.id ?? '');
  const [floorPlans, setFloorPlans] = useState<FloorPlanType[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<FloorPlanType | null>(null);
  const [workPoints, setWorkPoints] = useState<WorkPoint[]>([]);
  const [selectedPoint, setSelectedPoint] = useState<WorkPoint | null>(null);
  const [isPlacing, setIsPlacing] = useState(false);
  const [pendingCoords, setPendingCoords] = useState<{ x: number; y: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAddPlanModal, setShowAddPlanModal] = useState(false);
  const [newPlanName, setNewPlanName] = useState('');
  const [newPlanFloor, setNewPlanFloor] = useState('');
  const toast = useToast();

  const property = properties.find(p => p.id === propertyId);

  // Load floor plans when property changes
  const loadFloorPlans = useCallback(async () => {
    setLoading(true);
    try {
      const plans = await getFloorPlansByProperty(propertyId);
      setFloorPlans(plans);
      if (plans.length > 0) {
        setSelectedPlan(plans[0]);
      } else {
        setSelectedPlan(null);
      }
      setSelectedPoint(null);
      setWorkPoints([]);
    } catch {
      toast.error('Failed to load floor plans.');
    } finally {
      setLoading(false);
    }
  }, [propertyId]);

  useEffect(() => {
    loadFloorPlans();
  }, [loadFloorPlans]);

  // Load work points when floor plan changes
  const loadWorkPoints = useCallback(async () => {
    if (!selectedPlan) {
      setWorkPoints([]);
      return;
    }
    try {
      const points = await getWorkPointsByFloorPlan(selectedPlan.id);
      setWorkPoints(points);
    } catch {
      toast.error('Failed to load work points.');
    }
  }, [selectedPlan?.id]);

  useEffect(() => {
    loadWorkPoints();
  }, [loadWorkPoints]);

  // Refresh selected point from the work points list
  useEffect(() => {
    if (selectedPoint) {
      const updated = workPoints.find(wp => wp.id === selectedPoint.id);
      if (updated) setSelectedPoint(updated);
      else setSelectedPoint(null);
    }
  }, [workPoints]);

  const handlePropertyChange = (id: string) => {
    setPropertyId(id);
    setSelectedPoint(null);
    setIsPlacing(false);
  };

  const handlePlanChange = (planId: string) => {
    const plan = floorPlans.find(fp => fp.id === planId);
    if (plan) {
      setSelectedPlan(plan);
      setSelectedPoint(null);
      setIsPlacing(false);
    }
  };

  const handleMapClick = (x: number, y: number) => {
    setPendingCoords({ x, y });
    setIsPlacing(false);
    setShowCreateModal(true);
  };

  const handleCreateWorkPoint = async (data: Omit<WorkPointFormData, 'floorPlanId' | 'xPercent' | 'yPercent'>) => {
    if (!selectedPlan || !pendingCoords) return;
    await createWorkPoint({
      floorPlanId: selectedPlan.id,
      xPercent: pendingCoords.x,
      yPercent: pendingCoords.y,
      ...data,
    });
    setPendingCoords(null);
    await loadWorkPoints();
    toast.success('Work point created.');
  };

  const handleEditWorkPoint = async (data: Omit<WorkPointFormData, 'floorPlanId' | 'xPercent' | 'yPercent'>) => {
    if (!selectedPoint) return;
    await updateWorkPoint(selectedPoint.id, data);
    await loadWorkPoints();
    toast.success('Work point updated.');
  };

  const handleDeleteWorkPoint = async (wpId: string) => {
    await deleteWorkPoint(wpId);
    setSelectedPoint(null);
    await loadWorkPoints();
    toast.success('Work point deleted.');
  };

  const handleUploadImage = async (file: File) => {
    if (!selectedPlan) return;
    setIsUploading(true);
    try {
      const imageUrl = await uploadFloorPlanImage(selectedPlan.id, file);
      setSelectedPlan(prev => prev ? { ...prev, imageUrl, imagePath: file.name } : null);
      setFloorPlans(prev => prev.map(fp =>
        fp.id === selectedPlan.id ? { ...fp, imageUrl, imagePath: file.name } : fp
      ));
      toast.success('Floor plan image uploaded.');
    } catch {
      toast.error('Failed to upload image.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleAddImage = async (wpId: string, file: File) => {
    await addWorkPointImage(wpId, file);
    await loadWorkPoints();
  };

  const handleRemoveImage = async (imageId: string) => {
    await removeWorkPointImage(imageId);
    await loadWorkPoints();
  };

  const handleAddComment = async (wpId: string, text: string) => {
    await addWorkPointComment(wpId, text);
    await loadWorkPoints();
  };

  const handleAddPlan = async () => {
    if (!newPlanName.trim()) return;
    await createFloorPlan({
      propertyId,
      name: newPlanName.trim(),
      floor: newPlanFloor.trim() || 'Main',
    });
    setNewPlanName('');
    setNewPlanFloor('');
    setShowAddPlanModal(false);
    await loadFloorPlans();
    toast.success('Floor plan created.');
  };

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Loader2 size={32} className="animate-spin text-yolk-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="font-display text-2xl font-bold text-slate-900 dark:text-white">Floor Plans</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Upload floor plans and mark areas needing work with photos and notes
        </p>
      </div>

      {/* Selector */}
      <FloorPlanSelector
        properties={properties}
        selectedPropertyId={propertyId}
        onPropertyChange={handlePropertyChange}
        floorPlans={floorPlans}
        selectedPlanId={selectedPlan?.id ?? null}
        onPlanChange={handlePlanChange}
        onAddPlan={() => setShowAddPlanModal(true)}
      />

      {/* Main content */}
      {floorPlans.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white p-12 text-center shadow-sm dark:border-slate-700 dark:bg-concrete-800">
          <p className="text-lg font-medium text-slate-500 dark:text-slate-400">
            No floor plans for this property yet.
          </p>
          <p className="mt-2 text-sm text-slate-400">
            Click &quot;Add Floor Plan&quot; to create one.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <FloorPlanViewer
              floorPlan={selectedPlan}
              workPoints={workPoints}
              selectedPointId={selectedPoint?.id ?? null}
              isPlacing={isPlacing}
              onTogglePlacing={() => setIsPlacing(!isPlacing)}
              onMapClick={handleMapClick}
              onPinClick={(wp) => setSelectedPoint(wp)}
              onUploadImage={handleUploadImage}
              isUploading={isUploading}
              address={property?.address}
            />
          </div>
          <div>
            <FloorPlanSidebar
              workPoints={workPoints}
              selectedPoint={selectedPoint}
              onSelectPoint={(wp) => setSelectedPoint(wp)}
              onDeselectPoint={() => setSelectedPoint(null)}
              onEditPoint={() => setShowEditModal(true)}
              onDeletePoint={handleDeleteWorkPoint}
              onAddComment={handleAddComment}
              onAddImage={handleAddImage}
              onRemoveImage={handleRemoveImage}
            />
          </div>
        </div>
      )}

      {/* Create work point modal */}
      <WorkPointModal
        isOpen={showCreateModal}
        onClose={() => { setShowCreateModal(false); setPendingCoords(null); }}
        onSubmit={handleCreateWorkPoint}
        mode="create"
      />

      {/* Edit work point modal */}
      {selectedPoint && (
        <WorkPointModal
          key={selectedPoint.id}
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          onSubmit={handleEditWorkPoint}
          initialData={{
            title: selectedPoint.title,
            description: selectedPoint.description,
            status: selectedPoint.status,
            dueDate: selectedPoint.dueDate,
            room: selectedPoint.room,
          }}
          mode="edit"
        />
      )}

      {/* Add floor plan modal */}
      <Modal
        isOpen={showAddPlanModal}
        onClose={() => setShowAddPlanModal(false)}
        title="New Floor Plan"
        size="sm"
      >
        <div className="space-y-4">
          <div>
            <label htmlFor="plan-name" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
              Name <span className="text-red-500">*</span>
            </label>
            <input
              id="plan-name"
              type="text"
              value={newPlanName}
              onChange={e => setNewPlanName(e.target.value)}
              placeholder="e.g. Main Floor"
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 placeholder-slate-400 outline-none focus:border-yolk-400 dark:border-slate-600 dark:bg-slate-800 dark:text-white"
            />
          </div>
          <div>
            <label htmlFor="plan-floor" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
              Floor
            </label>
            <input
              id="plan-floor"
              type="text"
              value={newPlanFloor}
              onChange={e => setNewPlanFloor(e.target.value)}
              placeholder="e.g. Ground, 1st, Basement"
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 placeholder-slate-400 outline-none focus:border-yolk-400 dark:border-slate-600 dark:bg-slate-800 dark:text-white"
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button
              onClick={() => setShowAddPlanModal(false)}
              className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-300"
            >
              Cancel
            </button>
            <button
              onClick={handleAddPlan}
              disabled={!newPlanName.trim()}
              className="rounded-lg bg-yolk-500 px-4 py-2 text-sm font-medium text-white hover:bg-yolk-600 disabled:opacity-50"
            >
              Create
            </button>
          </div>
        </div>
      </Modal>

      <ToastContainer toasts={toast.toasts} onRemove={toast.removeToast} />
    </div>
  );
}
