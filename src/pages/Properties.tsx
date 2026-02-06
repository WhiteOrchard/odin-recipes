import { useState, useMemo } from 'react';
import { Search, SlidersHorizontal, LayoutGrid, List } from 'lucide-react';
import { clsx } from 'clsx';
import PropertyCard from '../components/PropertyCard';
import { properties } from '../data/mockData';
import type { PropertyType, PropertyStatus } from '../types';

type ViewMode = 'grid' | 'list';

export default function Properties() {
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<PropertyType | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<PropertyStatus | 'all'>('all');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [showFilters, setShowFilters] = useState(false);

  const filtered = useMemo(() => {
    return properties.filter(p => {
      const matchesSearch = search === '' ||
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.city.toLowerCase().includes(search.toLowerCase()) ||
        p.country.toLowerCase().includes(search.toLowerCase());
      const matchesType = typeFilter === 'all' || p.type === typeFilter;
      const matchesStatus = statusFilter === 'all' || p.status === statusFilter;
      return matchesSearch && matchesType && matchesStatus;
    });
  }, [search, typeFilter, statusFilter]);

  const types: (PropertyType | 'all')[] = ['all', 'penthouse', 'villa', 'estate', 'mansion', 'chateau', 'townhouse'];
  const statuses: (PropertyStatus | 'all')[] = ['all', 'available', 'occupied', 'maintenance', 'listed'];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-serif text-2xl font-bold text-slate-900 dark:text-white">Properties</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            {filtered.length} of {properties.length} properties
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowFilters(f => !f)}
            className={clsx(
              'flex items-center gap-1.5 rounded-lg border px-3 py-2 text-sm font-medium transition-colors',
              showFilters
                ? 'border-gold-300 bg-gold-50 text-gold-700 dark:border-gold-700 dark:bg-gold-900/30 dark:text-gold-400'
                : 'border-slate-200 text-slate-600 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-800'
            )}
          >
            <SlidersHorizontal size={16} />
            Filters
          </button>
          <div className="flex rounded-lg border border-slate-200 dark:border-slate-600">
            <button
              onClick={() => setViewMode('grid')}
              className={clsx(
                'rounded-l-lg p-2 transition-colors',
                viewMode === 'grid'
                  ? 'bg-slate-100 text-slate-900 dark:bg-slate-700 dark:text-white'
                  : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
              )}
            >
              <LayoutGrid size={16} />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={clsx(
                'rounded-r-lg p-2 transition-colors',
                viewMode === 'list'
                  ? 'bg-slate-100 text-slate-900 dark:bg-slate-700 dark:text-white'
                  : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
              )}
            >
              <List size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 dark:border-slate-600 dark:bg-mansion-800">
          <Search size={18} className="text-slate-400" />
          <input
            type="text"
            placeholder="Search by name, city, or country..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="flex-1 bg-transparent text-sm outline-none placeholder:text-slate-400 dark:text-white"
          />
        </div>

        {showFilters && (
          <div className="flex flex-wrap gap-3 rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-mansion-800">
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-500 dark:text-slate-400">Property Type</label>
              <select
                value={typeFilter}
                onChange={e => setTypeFilter(e.target.value as PropertyType | 'all')}
                className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm dark:border-slate-600 dark:bg-mansion-900 dark:text-white"
              >
                {types.map(t => (
                  <option key={t} value={t}>{t === 'all' ? 'All Types' : t.charAt(0).toUpperCase() + t.slice(1)}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-500 dark:text-slate-400">Status</label>
              <select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value as PropertyStatus | 'all')}
                className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm dark:border-slate-600 dark:bg-mansion-900 dark:text-white"
              >
                {statuses.map(s => (
                  <option key={s} value={s}>{s === 'all' ? 'All Statuses' : s.charAt(0).toUpperCase() + s.slice(1)}</option>
                ))}
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Results */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map(p => (
            <PropertyCard key={p.id} property={p} />
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(p => (
            <PropertyCard key={p.id} property={p} />
          ))}
        </div>
      )}

      {filtered.length === 0 && (
        <div className="py-20 text-center">
          <p className="text-lg font-medium text-slate-400 dark:text-slate-500">No properties match your filters</p>
          <p className="mt-1 text-sm text-slate-400 dark:text-slate-500">Try adjusting your search or filter criteria</p>
        </div>
      )}
    </div>
  );
}
