import { useState, useRef, useCallback } from 'react';
import { Upload, Image, FileText, Loader2 } from 'lucide-react';
import { clsx } from 'clsx';

interface FloorPlanUploadProps {
  onUpload: (file: File) => Promise<void>;
  isUploading: boolean;
}

const ACCEPTED_TYPES = ['image/png', 'image/jpeg', 'image/jpg', 'application/pdf'];
const MAX_SIZE = 20 * 1024 * 1024; // 20MB

export default function FloorPlanUpload({ onUpload, isUploading }: FloorPlanUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const validateFile = (file: File): string | null => {
    if (!ACCEPTED_TYPES.includes(file.type)) {
      return 'Please upload a PNG, JPG, or PDF file.';
    }
    if (file.size > MAX_SIZE) {
      return 'File size must be under 20MB.';
    }
    return null;
  };

  const handleFile = useCallback((file: File) => {
    setError(null);
    const err = validateFile(file);
    if (err) {
      setError(err);
      return;
    }
    setSelectedFile(file);
    if (file.type.startsWith('image/')) {
      setPreview(URL.createObjectURL(file));
    } else {
      setPreview(null);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const handleConfirm = async () => {
    if (!selectedFile) return;
    await onUpload(selectedFile);
    setSelectedFile(null);
    setPreview(null);
  };

  const handleCancel = () => {
    setSelectedFile(null);
    setPreview(null);
    setError(null);
    if (inputRef.current) inputRef.current.value = '';
  };

  if (selectedFile) {
    return (
      <div className="flex flex-col items-center gap-4 p-8">
        {preview ? (
          <img
            src={preview}
            alt="Floor plan preview"
            className="max-h-64 rounded-lg border border-slate-200 object-contain dark:border-slate-700"
          />
        ) : (
          <div className="flex h-32 w-32 items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-800">
            <FileText size={48} className="text-slate-400" />
          </div>
        )}
        <p className="text-sm font-medium text-slate-700 dark:text-slate-300">{selectedFile.name}</p>
        <p className="text-xs text-slate-500">{(selectedFile.size / 1024 / 1024).toFixed(1)} MB</p>
        <div className="flex gap-2">
          <button
            onClick={handleCancel}
            disabled={isUploading}
            className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={isUploading}
            className="flex items-center gap-2 rounded-lg bg-yolk-500 px-4 py-2 text-sm font-medium text-white hover:bg-yolk-600 disabled:opacity-50"
          >
            {isUploading ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
            {isUploading ? 'Uploading...' : 'Upload Floor Plan'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-4 p-8">
      <div
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={clsx(
          'flex w-full cursor-pointer flex-col items-center gap-3 rounded-lg border-2 border-dashed p-10 transition-colors',
          isDragging
            ? 'border-yolk-400 bg-yolk-50/30 dark:border-yolk-500 dark:bg-yolk-900/10'
            : 'border-slate-300 hover:border-slate-400 dark:border-slate-600 dark:hover:border-slate-500'
        )}
      >
        <Image size={40} className="text-slate-400 dark:text-slate-500" />
        <p className="text-sm font-medium text-slate-600 dark:text-slate-300">
          Drop your floor plan here, or click to browse
        </p>
        <p className="text-xs text-slate-400">PNG, JPG, or PDF up to 20MB</p>
      </div>
      {error && <p className="text-sm text-red-500">{error}</p>}
      <input
        ref={inputRef}
        type="file"
        accept=".png,.jpg,.jpeg,.pdf"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
        }}
      />
    </div>
  );
}
