import { useState, useRef } from 'react';
import {
  Upload, FileText, Image, File, Trash2, Download, Search,
  FolderOpen, Filter, Eye, X, ChevronDown,
} from 'lucide-react';
import { clsx } from 'clsx';
import { properties } from '../data/mockData';
import { format } from 'date-fns';

type DocCategory = 'contract' | 'photo' | 'inspection' | 'insurance' | 'other';

interface Document {
  id: string;
  name: string;
  category: DocCategory;
  propertyId: string;
  size: string;
  uploadedAt: string;
  type: string;
  thumbnail?: string;
}

const categoryConfig: Record<DocCategory, { label: string; color: string; icon: typeof FileText }> = {
  contract: { label: 'Contract', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400', icon: FileText },
  photo: { label: 'Photo', color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400', icon: Image },
  inspection: { label: 'Inspection', color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400', icon: FileText },
  insurance: { label: 'Insurance', color: 'bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-400', icon: FileText },
  other: { label: 'Other', color: 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300', icon: File },
};

// Mock documents
const initialDocuments: Document[] = [
  { id: 'd1', name: 'Azure Penthouse - Lease Agreement 2025.pdf', category: 'contract', propertyId: 'p1', size: '2.4 MB', uploadedAt: '2025-01-15', type: 'application/pdf' },
  { id: 'd2', name: 'Villa Serenità - Exterior Front.jpg', category: 'photo', propertyId: 'p2', size: '4.8 MB', uploadedAt: '2025-06-20', type: 'image/jpeg', thumbnail: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=200' },
  { id: 'd3', name: 'Kensington Manor - Heritage Inspection Report.pdf', category: 'inspection', propertyId: 'p3', size: '8.1 MB', uploadedAt: '2025-11-02', type: 'application/pdf' },
  { id: 'd4', name: 'Portfolio Insurance Policy 2026.pdf', category: 'insurance', propertyId: 'p1', size: '1.2 MB', uploadedAt: '2026-01-05', type: 'application/pdf' },
  { id: 'd5', name: 'Aspen Summit - Kitchen Renovation.jpg', category: 'photo', propertyId: 'p5', size: '3.2 MB', uploadedAt: '2025-09-18', type: 'image/jpeg', thumbnail: 'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=200' },
  { id: 'd6', name: 'Château de Lumière - Maintenance Log.pdf', category: 'other', propertyId: 'p4', size: '560 KB', uploadedAt: '2026-01-28', type: 'application/pdf' },
  { id: 'd7', name: 'Villa Serenità - Pool Area.jpg', category: 'photo', propertyId: 'p2', size: '5.1 MB', uploadedAt: '2025-07-12', type: 'image/jpeg', thumbnail: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=200' },
  { id: 'd8', name: 'Lake Geneva Estate - Tenant Agreement.pdf', category: 'contract', propertyId: 'p8', size: '3.7 MB', uploadedAt: '2025-03-10', type: 'application/pdf' },
  { id: 'd9', name: 'Harbor View Townhouse - Inspection Q4.pdf', category: 'inspection', propertyId: 'p6', size: '6.3 MB', uploadedAt: '2025-12-15', type: 'application/pdf' },
  { id: 'd10', name: 'Azure Penthouse - Rooftop View.jpg', category: 'photo', propertyId: 'p1', size: '4.2 MB', uploadedAt: '2026-01-20', type: 'image/jpeg', thumbnail: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=200' },
];

export default function Documents() {
  const [documents, setDocuments] = useState(initialDocuments);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<DocCategory | 'all'>('all');
  const [propertyFilter, setPropertyFilter] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [previewDoc, setPreviewDoc] = useState<Document | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [uploadCategory, setUploadCategory] = useState<DocCategory>('other');
  const [uploadProperty, setUploadProperty] = useState('p1');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const filtered = documents.filter(d => {
    const matchesSearch = search === '' || d.name.toLowerCase().includes(search.toLowerCase());
    const matchesCat = categoryFilter === 'all' || d.category === categoryFilter;
    const matchesProp = propertyFilter === 'all' || d.propertyId === propertyFilter;
    return matchesSearch && matchesCat && matchesProp;
  });

  const handleUpload = (files: FileList | null) => {
    if (!files) return;
    const newDocs: Document[] = Array.from(files).map((file, i) => ({
      id: `d-new-${Date.now()}-${i}`,
      name: file.name,
      category: uploadCategory,
      propertyId: uploadProperty,
      size: file.size > 1_000_000 ? `${(file.size / 1_000_000).toFixed(1)} MB` : `${(file.size / 1_000).toFixed(0)} KB`,
      uploadedAt: format(new Date(), 'yyyy-MM-dd'),
      type: file.type,
      thumbnail: file.type.startsWith('image/') ? URL.createObjectURL(file) : undefined,
    }));
    setDocuments(prev => [...newDocs, ...prev]);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    handleUpload(e.dataTransfer.files);
  };

  const handleDelete = (id: string) => {
    setDocuments(prev => prev.filter(d => d.id !== id));
  };

  const stats = {
    total: documents.length,
    contracts: documents.filter(d => d.category === 'contract').length,
    photos: documents.filter(d => d.category === 'photo').length,
    inspections: documents.filter(d => d.category === 'inspection').length,
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-2xl font-bold text-slate-900 dark:text-white">Documents</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Upload and manage contracts, photos, inspection reports, and more
        </p>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-mansion-800">
          <p className="text-xs text-slate-500 dark:text-slate-400">Total Documents</p>
          <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats.total}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-mansion-800">
          <p className="text-xs text-slate-500 dark:text-slate-400">Contracts</p>
          <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{stats.contracts}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-mansion-800">
          <p className="text-xs text-slate-500 dark:text-slate-400">Photos</p>
          <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{stats.photos}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-mansion-800">
          <p className="text-xs text-slate-500 dark:text-slate-400">Inspections</p>
          <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">{stats.inspections}</p>
        </div>
      </div>

      {/* Upload zone */}
      <div
        onDragOver={e => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        className={clsx(
          'flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-8 transition-colors',
          dragOver
            ? 'border-gold-400 bg-gold-50 dark:border-gold-500 dark:bg-gold-900/20'
            : 'border-slate-200 bg-white hover:border-slate-300 dark:border-slate-600 dark:bg-mansion-800 dark:hover:border-slate-500'
        )}
      >
        <Upload size={32} className={dragOver ? 'text-gold-500' : 'text-slate-400'} />
        <p className="mt-3 text-sm font-medium text-slate-700 dark:text-slate-300">
          Drag and drop files here, or{' '}
          <button
            onClick={() => fileInputRef.current?.click()}
            className="text-gold-600 hover:text-gold-700 dark:text-gold-400"
          >
            browse
          </button>
        </p>
        <p className="mt-1 text-xs text-slate-400">
          PDF, JPG, PNG, DOCX up to 50MB
        </p>
        <div className="mt-4 flex items-center gap-3">
          <div>
            <label className="text-xs text-slate-500 dark:text-slate-400">Category</label>
            <select
              value={uploadCategory}
              onChange={e => setUploadCategory(e.target.value as DocCategory)}
              className="ml-2 rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs dark:border-slate-600 dark:bg-mansion-900 dark:text-white"
            >
              {Object.entries(categoryConfig).map(([key, conf]) => (
                <option key={key} value={key}>{conf.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs text-slate-500 dark:text-slate-400">Property</label>
            <select
              value={uploadProperty}
              onChange={e => setUploadProperty(e.target.value)}
              className="ml-2 rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs dark:border-slate-600 dark:bg-mansion-900 dark:text-white"
            >
              {properties.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          className="hidden"
          onChange={e => handleUpload(e.target.files)}
          accept=".pdf,.jpg,.jpeg,.png,.docx,.doc"
        />
      </div>

      {/* Search and filters */}
      <div className="space-y-3">
        <div className="flex gap-2">
          <div className="flex flex-1 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 dark:border-slate-600 dark:bg-mansion-800">
            <Search size={18} className="text-slate-400" />
            <input
              type="text"
              placeholder="Search documents..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="flex-1 bg-transparent text-sm outline-none placeholder:text-slate-400 dark:text-white"
            />
          </div>
          <button
            onClick={() => setShowFilters(f => !f)}
            className={clsx(
              'flex items-center gap-1.5 rounded-lg border px-3 py-2 text-sm font-medium',
              showFilters
                ? 'border-gold-300 bg-gold-50 text-gold-700 dark:border-gold-700 dark:bg-gold-900/30 dark:text-gold-400'
                : 'border-slate-200 text-slate-600 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-300'
            )}
          >
            <Filter size={16} />
            Filters
            <ChevronDown size={14} className={clsx('transition-transform', showFilters && 'rotate-180')} />
          </button>
        </div>
        {showFilters && (
          <div className="flex flex-wrap gap-3 rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-mansion-800">
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-500 dark:text-slate-400">Category</label>
              <select
                value={categoryFilter}
                onChange={e => setCategoryFilter(e.target.value as DocCategory | 'all')}
                className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm dark:border-slate-600 dark:bg-mansion-900 dark:text-white"
              >
                <option value="all">All Categories</option>
                {Object.entries(categoryConfig).map(([key, conf]) => (
                  <option key={key} value={key}>{conf.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-500 dark:text-slate-400">Property</label>
              <select
                value={propertyFilter}
                onChange={e => setPropertyFilter(e.target.value)}
                className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm dark:border-slate-600 dark:bg-mansion-900 dark:text-white"
              >
                <option value="all">All Properties</option>
                {properties.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Documents list */}
      <div className="space-y-2">
        {filtered.map(doc => {
          const prop = properties.find(p => p.id === doc.propertyId);
          const catConf = categoryConfig[doc.category];
          const CatIcon = catConf.icon;

          return (
            <div
              key={doc.id}
              className="group flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition-colors hover:bg-slate-50 dark:border-slate-700 dark:bg-mansion-800 dark:hover:bg-mansion-700"
            >
              {/* Thumbnail / Icon */}
              {doc.thumbnail ? (
                <img
                  src={doc.thumbnail}
                  alt={doc.name}
                  className="h-12 w-12 rounded-lg object-cover"
                />
              ) : (
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-700">
                  <CatIcon size={20} className="text-slate-500 dark:text-slate-400" />
                </div>
              )}

              {/* Info */}
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-slate-900 dark:text-white">{doc.name}</p>
                <div className="mt-1 flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                  <span className={clsx('rounded-full px-2 py-0.5 text-xs font-medium', catConf.color)}>
                    {catConf.label}
                  </span>
                  <span>{prop?.name}</span>
                  <span>&middot;</span>
                  <span>{doc.size}</span>
                  <span>&middot;</span>
                  <span>{format(new Date(doc.uploadedAt), 'MMM d, yyyy')}</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                {doc.thumbnail && (
                  <button
                    onClick={() => setPreviewDoc(doc)}
                    className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-700 dark:hover:text-white"
                    title="Preview"
                  >
                    <Eye size={16} />
                  </button>
                )}
                <button
                  className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-700 dark:hover:text-white"
                  title="Download"
                >
                  <Download size={16} />
                </button>
                <button
                  onClick={() => handleDelete(doc.id)}
                  className="rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-900/20 dark:hover:text-red-400"
                  title="Delete"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="flex flex-col items-center py-20">
          <FolderOpen size={48} className="text-slate-300 dark:text-slate-600" />
          <p className="mt-4 text-lg font-medium text-slate-400">No documents found</p>
          <p className="text-sm text-slate-400">Upload documents or adjust your filters</p>
        </div>
      )}

      {/* Image preview modal */}
      {previewDoc && previewDoc.thumbnail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4" onClick={() => setPreviewDoc(null)}>
          <div className="relative max-h-[90vh] max-w-4xl" onClick={e => e.stopPropagation()}>
            <button
              onClick={() => setPreviewDoc(null)}
              className="absolute -right-3 -top-3 rounded-full bg-white p-1.5 shadow-lg dark:bg-slate-800"
            >
              <X size={18} className="text-slate-600 dark:text-white" />
            </button>
            <img
              src={previewDoc.thumbnail.replace('w=200', 'w=1200')}
              alt={previewDoc.name}
              className="max-h-[85vh] rounded-xl object-contain"
            />
            <p className="mt-2 text-center text-sm text-white">{previewDoc.name}</p>
          </div>
        </div>
      )}
    </div>
  );
}
