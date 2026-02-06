import { useState } from 'react';
import { clsx } from 'clsx';
import { Search, AlertTriangle, Clock, CheckCircle2, Circle, Filter } from 'lucide-react';
import { maintenanceRequests, properties, tenants, formatFullCurrency } from '../data/mockData';
import { format, parseISO } from 'date-fns';

type StatusFilter = 'all' | 'open' | 'in-progress' | 'resolved' | 'closed';
type PriorityFilter = 'all' | 'low' | 'medium' | 'high' | 'urgent';

const priorityConfig = {
  urgent: { color: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400', dot: 'bg-red-500', icon: AlertTriangle },
  high: { color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400', dot: 'bg-amber-500', icon: AlertTriangle },
  medium: { color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400', dot: 'bg-blue-500', icon: Clock },
  low: { color: 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300', dot: 'bg-slate-400', icon: Circle },
};

const statusConfig = {
  open: { color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400', icon: Circle },
  'in-progress': { color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400', icon: Clock },
  resolved: { color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400', icon: CheckCircle2 },
  closed: { color: 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300', icon: CheckCircle2 },
};

export default function Maintenance() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [priorityFilter, setPriorityFilter] = useState<PriorityFilter>('all');
  const [showFilters, setShowFilters] = useState(false);

  const filtered = maintenanceRequests.filter(r => {
    const matchesSearch = search === '' || r.title.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || r.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || r.priority === priorityFilter;
    return matchesSearch && matchesStatus && matchesPriority;
  });

  const stats = {
    open: maintenanceRequests.filter(r => r.status === 'open').length,
    inProgress: maintenanceRequests.filter(r => r.status === 'in-progress').length,
    resolved: maintenanceRequests.filter(r => r.status === 'resolved').length,
    totalCost: maintenanceRequests.reduce((s, r) => s + (r.estimatedCost ?? 0), 0),
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-2xl font-bold text-slate-900 dark:text-white">Maintenance Requests</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{maintenanceRequests.length} total requests</p>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-mansion-800">
          <p className="text-xs text-slate-500 dark:text-slate-400">Open</p>
          <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{stats.open}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-mansion-800">
          <p className="text-xs text-slate-500 dark:text-slate-400">In Progress</p>
          <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">{stats.inProgress}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-mansion-800">
          <p className="text-xs text-slate-500 dark:text-slate-400">Resolved</p>
          <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{stats.resolved}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-mansion-800">
          <p className="text-xs text-slate-500 dark:text-slate-400">Est. Total Cost</p>
          <p className="text-2xl font-bold text-slate-900 dark:text-white">{formatFullCurrency(stats.totalCost)}</p>
        </div>
      </div>

      {/* Search and filters */}
      <div className="space-y-3">
        <div className="flex gap-2">
          <div className="flex flex-1 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 dark:border-slate-600 dark:bg-mansion-800">
            <Search size={18} className="text-slate-400" />
            <input
              type="text"
              placeholder="Search requests..."
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
          </button>
        </div>

        {showFilters && (
          <div className="flex flex-wrap gap-3 rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-mansion-800">
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-500 dark:text-slate-400">Status</label>
              <select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value as StatusFilter)}
                className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm dark:border-slate-600 dark:bg-mansion-900 dark:text-white"
              >
                <option value="all">All</option>
                <option value="open">Open</option>
                <option value="in-progress">In Progress</option>
                <option value="resolved">Resolved</option>
                <option value="closed">Closed</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-500 dark:text-slate-400">Priority</label>
              <select
                value={priorityFilter}
                onChange={e => setPriorityFilter(e.target.value as PriorityFilter)}
                className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm dark:border-slate-600 dark:bg-mansion-900 dark:text-white"
              >
                <option value="all">All</option>
                <option value="urgent">Urgent</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Requests list */}
      <div className="space-y-3">
        {filtered.map(req => {
          const prop = properties.find(p => p.id === req.propertyId);
          const tenant = tenants.find(t => t.id === req.tenantId);
          const prioConf = priorityConfig[req.priority];
          const statConf = statusConfig[req.status];

          return (
            <div
              key={req.id}
              className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-mansion-800"
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex items-start gap-3">
                  <div className={clsx('mt-1 h-3 w-3 shrink-0 rounded-full', prioConf.dot)} />
                  <div>
                    <h3 className="font-semibold text-slate-900 dark:text-white">{req.title}</h3>
                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{req.description}</p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      <span className={clsx('rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize', prioConf.color)}>
                        {req.priority}
                      </span>
                      <span className={clsx('rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize', statConf.color)}>
                        {req.status}
                      </span>
                      <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600 dark:bg-slate-700 dark:text-slate-300">
                        {req.category}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="text-right text-sm">
                  {req.estimatedCost && (
                    <p className="font-semibold text-slate-900 dark:text-white">{formatFullCurrency(req.estimatedCost)}</p>
                  )}
                  <p className="text-slate-500 dark:text-slate-400">{prop?.name}</p>
                  {tenant && (
                    <p className="text-xs text-slate-400">{tenant.firstName} {tenant.lastName}</p>
                  )}
                  <p className="mt-1 text-xs text-slate-400">
                    Updated {format(parseISO(req.updatedAt), 'MMM d, yyyy')}
                  </p>
                  {req.assignedTo && (
                    <p className="mt-0.5 text-xs text-slate-400">Assigned: {req.assignedTo}</p>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="py-20 text-center">
          <p className="text-lg font-medium text-slate-400">No maintenance requests match your filters</p>
        </div>
      )}
    </div>
  );
}
