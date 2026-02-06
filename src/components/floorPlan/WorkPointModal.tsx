import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import Modal from '../Modal';
import type { WorkPointFormData, WorkPointStatus } from '../../types/floorPlan';

interface WorkPointModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Omit<WorkPointFormData, 'floorPlanId' | 'xPercent' | 'yPercent'>) => Promise<void>;
  initialData?: {
    title?: string;
    description?: string;
    status?: WorkPointStatus;
    dueDate?: string | null;
    room?: string;
  };
  mode: 'create' | 'edit';
}

export default function WorkPointModal({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  mode,
}: WorkPointModalProps) {
  const [title, setTitle] = useState(initialData?.title ?? '');
  const [description, setDescription] = useState(initialData?.description ?? '');
  const [status, setStatus] = useState<WorkPointStatus>(initialData?.status ?? 'planned');
  const [dueDate, setDueDate] = useState(initialData?.dueDate ?? '');
  const [room, setRoom] = useState(initialData?.room ?? '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!title.trim()) {
      setError('Title is required.');
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit({
        title: title.trim(),
        description: description.trim(),
        status,
        dueDate: dueDate || null,
        room: room.trim(),
      });
      onClose();
    } catch {
      setError('Failed to save work point. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={mode === 'create' ? 'New Work Point' : 'Edit Work Point'}
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Title */}
        <div>
          <label htmlFor="wp-title" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
            Title <span className="text-red-500">*</span>
          </label>
          <input
            id="wp-title"
            type="text"
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="e.g. Living Room Flooring Replacement"
            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 placeholder-slate-400 outline-none focus:border-yolk-400 focus:ring-1 focus:ring-yolk-400 dark:border-slate-600 dark:bg-slate-800 dark:text-white"
          />
        </div>

        {/* Description */}
        <div>
          <label htmlFor="wp-desc" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
            Description
          </label>
          <textarea
            id="wp-desc"
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder="Describe the work to be done..."
            rows={3}
            className="mt-1 w-full resize-none rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 placeholder-slate-400 outline-none focus:border-yolk-400 focus:ring-1 focus:ring-yolk-400 dark:border-slate-600 dark:bg-slate-800 dark:text-white"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          {/* Status */}
          <div>
            <label htmlFor="wp-status" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
              Status
            </label>
            <select
              id="wp-status"
              value={status}
              onChange={e => setStatus(e.target.value as WorkPointStatus)}
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 outline-none focus:border-yolk-400 dark:border-slate-600 dark:bg-slate-800 dark:text-white"
            >
              <option value="planned">Planned</option>
              <option value="in-progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>
          </div>

          {/* Room */}
          <div>
            <label htmlFor="wp-room" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
              Room
            </label>
            <input
              id="wp-room"
              type="text"
              value={room}
              onChange={e => setRoom(e.target.value)}
              placeholder="e.g. Kitchen"
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 placeholder-slate-400 outline-none focus:border-yolk-400 dark:border-slate-600 dark:bg-slate-800 dark:text-white"
            />
          </div>
        </div>

        {/* Due Date */}
        <div>
          <label htmlFor="wp-date" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
            Due Date
          </label>
          <input
            id="wp-date"
            type="date"
            value={dueDate}
            onChange={e => setDueDate(e.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 outline-none focus:border-yolk-400 dark:border-slate-600 dark:bg-slate-800 dark:text-white"
          />
        </div>

        {error && <p className="text-sm text-red-500">{error}</p>}

        {/* Actions */}
        <div className="flex justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex items-center gap-2 rounded-lg bg-yolk-500 px-4 py-2 text-sm font-medium text-white hover:bg-yolk-600 disabled:opacity-50"
          >
            {isSubmitting && <Loader2 size={14} className="animate-spin" />}
            {mode === 'create' ? 'Create' : 'Save Changes'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
