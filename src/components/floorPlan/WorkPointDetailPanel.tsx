import { useState, useRef } from 'react';
import { X, Edit3, Trash2, Calendar, MapPin, Plus, Send, Loader2 } from 'lucide-react';
import { clsx } from 'clsx';
import { format } from 'date-fns';
import type { WorkPoint } from '../../types/floorPlan';

interface WorkPointDetailPanelProps {
  workPoint: WorkPoint;
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onAddComment: (text: string) => Promise<void>;
  onAddImage: (file: File) => Promise<void>;
  onRemoveImage: (imageId: string) => Promise<void>;
}

const statusBadge = {
  planned: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  'in-progress': 'bg-yolk-100 text-yolk-700 dark:bg-yolk-900/30 dark:text-yolk-400',
  completed: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
};

const statusLabel = {
  planned: 'Planned',
  'in-progress': 'In Progress',
  completed: 'Completed',
};

export default function WorkPointDetailPanel({
  workPoint,
  onClose,
  onEdit,
  onDelete,
  onAddComment,
  onAddImage,
  onRemoveImage,
}: WorkPointDetailPanelProps) {
  const [commentText, setCommentText] = useState('');
  const [isAddingComment, setIsAddingComment] = useState(false);
  const [isAddingImage, setIsAddingImage] = useState(false);
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  const handleAddComment = async () => {
    if (!commentText.trim()) return;
    setIsAddingComment(true);
    await onAddComment(commentText.trim());
    setCommentText('');
    setIsAddingComment(false);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsAddingImage(true);
    await onAddImage(file);
    setIsAddingImage(false);
    if (imageInputRef.current) imageInputRef.current.value = '';
  };

  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-concrete-800">
      {/* Header */}
      <div className="flex items-start justify-between p-4">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className={clsx('rounded-full px-2 py-0.5 text-xs font-medium', statusBadge[workPoint.status])}>
              {statusLabel[workPoint.status]}
            </span>
          </div>
          <h3 className="mt-2 font-display text-lg font-semibold text-slate-900 dark:text-white">
            {workPoint.title}
          </h3>
        </div>
        <button
          onClick={onClose}
          className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700"
        >
          <X size={16} />
        </button>
      </div>

      {/* Metadata */}
      <div className="space-y-1.5 border-t border-slate-100 px-4 py-3 dark:border-slate-700">
        {workPoint.room && (
          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
            <MapPin size={12} />
            {workPoint.room}
          </div>
        )}
        {workPoint.dueDate && (
          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
            <Calendar size={12} />
            Due {format(new Date(workPoint.dueDate), 'MMM d, yyyy')}
          </div>
        )}
      </div>

      {/* Description */}
      {workPoint.description && (
        <div className="border-t border-slate-100 px-4 py-3 dark:border-slate-700">
          <p className="text-sm text-slate-600 dark:text-slate-300">{workPoint.description}</p>
        </div>
      )}

      {/* Images */}
      <div className="border-t border-slate-100 px-4 py-3 dark:border-slate-700">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Photos ({workPoint.images.length})
          </h4>
          <button
            onClick={() => imageInputRef.current?.click()}
            disabled={isAddingImage}
            className="flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-yolk-600 hover:bg-yolk-50 dark:text-yolk-400 dark:hover:bg-yolk-900/20"
          >
            {isAddingImage ? <Loader2 size={12} className="animate-spin" /> : <Plus size={12} />}
            Add
          </button>
          <input
            ref={imageInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleImageUpload}
          />
        </div>
        {workPoint.images.length > 0 ? (
          <div className="mt-2 flex gap-2 overflow-x-auto pb-1">
            {workPoint.images.map(img => (
              <div key={img.id} className="group relative shrink-0">
                <button
                  onClick={() => setLightboxUrl(img.imageUrl)}
                  className="block"
                >
                  <img
                    src={img.imageUrl}
                    alt={img.caption || 'Work point photo'}
                    className="h-16 w-16 rounded-md object-cover"
                  />
                </button>
                <button
                  onClick={() => onRemoveImage(img.id)}
                  className="absolute -right-1 -top-1 hidden rounded-full bg-red-500 p-0.5 text-white group-hover:block"
                >
                  <X size={10} />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p className="mt-2 text-xs text-slate-400">No photos attached yet.</p>
        )}
      </div>

      {/* Comments */}
      <div className="border-t border-slate-100 px-4 py-3 dark:border-slate-700">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          Comments ({workPoint.comments.length})
        </h4>
        {workPoint.comments.length > 0 && (
          <div className="mt-2 max-h-40 space-y-2 overflow-y-auto">
            {workPoint.comments.map(c => (
              <div key={c.id} className="rounded-lg bg-slate-50 p-2 dark:bg-slate-800">
                <p className="text-xs text-slate-600 dark:text-slate-300">{c.text}</p>
                <div className="mt-1 flex items-center gap-2 text-[10px] text-slate-400">
                  <span className="font-medium">{c.authorName}</span>
                  <span>{format(new Date(c.createdAt), 'MMM d, HH:mm')}</span>
                </div>
              </div>
            ))}
          </div>
        )}
        <div className="mt-2 flex gap-2">
          <input
            type="text"
            value={commentText}
            onChange={e => setCommentText(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') handleAddComment(); }}
            placeholder="Add a comment..."
            className="flex-1 rounded-lg border border-slate-200 px-3 py-1.5 text-sm text-slate-900 placeholder-slate-400 outline-none focus:border-yolk-400 dark:border-slate-600 dark:bg-slate-800 dark:text-white"
          />
          <button
            onClick={handleAddComment}
            disabled={!commentText.trim() || isAddingComment}
            className="rounded-lg bg-yolk-500 p-1.5 text-white disabled:opacity-50 hover:bg-yolk-600"
          >
            {isAddingComment ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
          </button>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2 border-t border-slate-100 p-4 dark:border-slate-700">
        <button
          onClick={onEdit}
          className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-800"
        >
          <Edit3 size={14} />
          Edit
        </button>
        <button
          onClick={onDelete}
          className="flex items-center gap-1.5 rounded-lg border border-red-200 px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-900/20"
        >
          <Trash2 size={14} />
        </button>
      </div>

      {/* Lightbox */}
      {lightboxUrl && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
          onClick={() => setLightboxUrl(null)}
        >
          <button
            onClick={() => setLightboxUrl(null)}
            className="absolute right-4 top-4 rounded-full bg-white/20 p-2 text-white hover:bg-white/30"
          >
            <X size={20} />
          </button>
          <img
            src={lightboxUrl}
            alt="Full size"
            className="max-h-[90vh] max-w-[90vw] rounded-lg object-contain"
            onClick={e => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
}
