import { useState } from 'react';
import { Search, Mail, Phone, ChevronDown, ChevronUp, CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import { clsx } from 'clsx';
import { tenants, properties, formatFullCurrency } from '../data/mockData';
import { format, parseISO, differenceInDays } from 'date-fns';

export default function Tenants() {
  const [search, setSearch] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filtered = tenants.filter(t => {
    const q = search.toLowerCase();
    return q === '' || `${t.firstName} ${t.lastName}`.toLowerCase().includes(q) || t.email.toLowerCase().includes(q);
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-2xl font-bold text-slate-900 dark:text-white">Tenants</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{tenants.length} active tenants across your portfolio</p>
      </div>

      <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 dark:border-slate-600 dark:bg-mansion-800">
        <Search size={18} className="text-slate-400" />
        <input
          type="text"
          placeholder="Search tenants..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="flex-1 bg-transparent text-sm outline-none placeholder:text-slate-400 dark:text-white"
        />
      </div>

      <div className="space-y-3">
        {filtered.map(tenant => {
          const property = properties.find(p => p.id === tenant.propertyId);
          const expanded = expandedId === tenant.id;
          const daysLeft = differenceInDays(parseISO(tenant.leaseEnd), new Date());

          return (
            <div
              key={tenant.id}
              className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-mansion-800"
            >
              {/* Tenant header */}
              <button
                className="flex w-full items-center justify-between p-5 text-left"
                onClick={() => setExpandedId(expanded ? null : tenant.id)}
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-gold-400 to-gold-600 text-sm font-bold text-white">
                    {tenant.avatar}
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900 dark:text-white">
                      {tenant.firstName} {tenant.lastName}
                    </h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400">{property?.name ?? 'Unknown property'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="hidden text-right sm:block">
                    <p className="text-sm font-semibold text-gold-600 dark:text-gold-400">
                      {formatFullCurrency(tenant.monthlyRent)}/mo
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {daysLeft > 0 ? `${daysLeft} days remaining` : 'Lease expired'}
                    </p>
                  </div>
                  <span
                    className={clsx(
                      'rounded-full px-2.5 py-1 text-xs font-semibold capitalize',
                      tenant.status === 'active'
                        ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400'
                        : 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400'
                    )}
                  >
                    {tenant.status}
                  </span>
                  {expanded ? <ChevronUp size={18} className="text-slate-400" /> : <ChevronDown size={18} className="text-slate-400" />}
                </div>
              </button>

              {/* Expanded details */}
              {expanded && (
                <div className="border-t border-slate-100 px-5 pb-5 dark:border-slate-700">
                  <div className="mt-4 grid grid-cols-1 gap-6 md:grid-cols-2">
                    {/* Contact info */}
                    <div className="space-y-3">
                      <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300">Contact Information</h4>
                      <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                        <Mail size={14} className="text-slate-400" />
                        {tenant.email}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                        <Phone size={14} className="text-slate-400" />
                        {tenant.phone}
                      </div>
                    </div>

                    {/* Lease info */}
                    <div className="space-y-3">
                      <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300">Lease Details</h4>
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-500 dark:text-slate-400">Lease Period</span>
                        <span className="text-slate-900 dark:text-white">
                          {format(parseISO(tenant.leaseStart), 'MMM d, yyyy')} - {format(parseISO(tenant.leaseEnd), 'MMM d, yyyy')}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-500 dark:text-slate-400">Security Deposit</span>
                        <span className="text-slate-900 dark:text-white">{formatFullCurrency(tenant.deposit)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Payment history */}
                  <div className="mt-6">
                    <h4 className="mb-3 text-sm font-semibold text-slate-700 dark:text-slate-300">Recent Payments</h4>
                    <div className="space-y-2">
                      {tenant.paymentHistory.map(payment => (
                        <div
                          key={payment.id}
                          className="flex items-center justify-between rounded-lg border border-slate-100 p-3 dark:border-slate-700"
                        >
                          <div className="flex items-center gap-3">
                            {payment.status === 'paid' ? (
                              <CheckCircle2 size={16} className="text-emerald-500" />
                            ) : payment.status === 'pending' ? (
                              <Clock size={16} className="text-amber-500" />
                            ) : (
                              <AlertCircle size={16} className="text-red-500" />
                            )}
                            <div>
                              <p className="text-sm font-medium text-slate-900 dark:text-white">
                                {formatFullCurrency(payment.amount)}
                              </p>
                              <p className="text-xs text-slate-500 dark:text-slate-400">
                                {format(parseISO(payment.date), 'MMMM d, yyyy')} &middot; {payment.method}
                              </p>
                            </div>
                          </div>
                          <span
                            className={clsx(
                              'rounded-full px-2 py-0.5 text-xs font-medium capitalize',
                              payment.status === 'paid' && 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400',
                              payment.status === 'pending' && 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400',
                              payment.status === 'overdue' && 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400'
                            )}
                          >
                            {payment.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="py-20 text-center">
          <p className="text-lg font-medium text-slate-400">No tenants found</p>
        </div>
      )}
    </div>
  );
}
