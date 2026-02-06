import { Building2, DollarSign, TrendingUp, Users, Wrench, CalendarClock } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import StatCard from '../components/StatCard';
import { properties, tenants, maintenanceRequests, monthlyFinancials, calendarEvents, formatCurrency } from '../data/mockData';
import { Link } from 'react-router-dom';
import { format, parseISO, isAfter } from 'date-fns';

const occupiedCount = properties.filter(p => p.status === 'occupied').length;
const totalRevenue = properties.filter(p => p.status === 'occupied').reduce((s, p) => s + p.monthlyRent, 0);
const totalValue = properties.reduce((s, p) => s + p.price, 0);
const pendingMaint = maintenanceRequests.filter(r => r.status === 'open' || r.status === 'in-progress').length;

const typeDistribution = [
  { name: 'Penthouse', value: properties.filter(p => p.type === 'penthouse').length, color: '#3b82f6' },
  { name: 'Villa', value: properties.filter(p => p.type === 'villa').length, color: '#10b981' },
  { name: 'Estate', value: properties.filter(p => p.type === 'estate').length, color: '#f59e0b' },
  { name: 'Mansion', value: properties.filter(p => p.type === 'mansion').length, color: '#ef4444' },
  { name: 'Château', value: properties.filter(p => p.type === 'chateau').length, color: '#8b5cf6' },
  { name: 'Townhouse', value: properties.filter(p => p.type === 'townhouse').length, color: '#06b6d4' },
].filter(d => d.value > 0);

const upcomingEvents = calendarEvents
  .filter(e => isAfter(parseISO(e.date), new Date('2026-02-05')))
  .sort((a, b) => a.date.localeCompare(b.date))
  .slice(0, 5);

export default function Dashboard() {
  return (
    <div className="space-y-6">
      {/* Page heading */}
      <div>
        <h1 className="font-serif text-2xl font-bold text-slate-900 dark:text-white">Portfolio Dashboard</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Overview of your luxury property portfolio as of {format(new Date(), 'MMMM d, yyyy')}
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
        <StatCard title="Total Properties" value={String(properties.length)} icon={Building2} color="blue" change={12.5} />
        <StatCard title="Portfolio Value" value={formatCurrency(totalValue)} icon={TrendingUp} color="green" change={8.3} />
        <StatCard title="Occupancy Rate" value={`${Math.round((occupiedCount / properties.length) * 100)}%`} icon={Users} color="violet" change={-2.1} />
        <StatCard title="Monthly Revenue" value={formatCurrency(totalRevenue)} icon={DollarSign} color="amber" change={5.7} />
        <StatCard title="Open Maintenance" value={String(pendingMaint)} icon={Wrench} color="rose" />
        <StatCard title="Active Tenants" value={String(tenants.length)} icon={CalendarClock} color="cyan" />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Revenue Chart */}
        <div className="col-span-2 rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-mansion-800">
          <h2 className="font-serif text-lg font-semibold text-slate-900 dark:text-white">Revenue & Expenses</h2>
          <p className="mb-4 text-sm text-slate-500 dark:text-slate-400">Last 12 months performance</p>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyFinancials}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#c8a415" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#c8a415" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorExpenses" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="#94a3b8" />
                <YAxis tickFormatter={(v: number) => `$${v / 1000}K`} tick={{ fontSize: 12 }} stroke="#94a3b8" />
                <Tooltip
                  formatter={(value) => [`$${Number(value).toLocaleString()}`, '']}
                  contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0' }}
                />
                <Area type="monotone" dataKey="revenue" stroke="#c8a415" fill="url(#colorRevenue)" strokeWidth={2} name="Revenue" />
                <Area type="monotone" dataKey="expenses" stroke="#ef4444" fill="url(#colorExpenses)" strokeWidth={2} name="Expenses" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Property distribution */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-mansion-800">
          <h2 className="font-serif text-lg font-semibold text-slate-900 dark:text-white">Property Types</h2>
          <p className="mb-4 text-sm text-slate-500 dark:text-slate-400">Portfolio distribution</p>
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={typeDistribution} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" paddingAngle={4}>
                  {typeDistribution.map((entry, index) => (
                    <Cell key={index} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-2 flex flex-wrap gap-3">
            {typeDistribution.map(d => (
              <div key={d.name} className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-300">
                <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: d.color }} />
                {d.name}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Recent Maintenance */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-mansion-800">
          <div className="flex items-center justify-between">
            <h2 className="font-serif text-lg font-semibold text-slate-900 dark:text-white">Recent Maintenance</h2>
            <Link to="/maintenance" className="text-sm font-medium text-gold-600 hover:text-gold-700 dark:text-gold-400">
              View all
            </Link>
          </div>
          <div className="mt-4 space-y-3">
            {maintenanceRequests.slice(0, 4).map(req => {
              const prop = properties.find(p => p.id === req.propertyId);
              return (
                <div key={req.id} className="flex items-start gap-3 rounded-lg border border-slate-100 p-3 dark:border-slate-700">
                  <div
                    className={`mt-0.5 h-2.5 w-2.5 shrink-0 rounded-full ${
                      req.priority === 'urgent' ? 'bg-red-500' : req.priority === 'high' ? 'bg-amber-500' : req.priority === 'medium' ? 'bg-blue-500' : 'bg-slate-400'
                    }`}
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-slate-900 dark:text-white">{req.title}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{prop?.name} &middot; {req.status}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Upcoming Events */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-mansion-800">
          <div className="flex items-center justify-between">
            <h2 className="font-serif text-lg font-semibold text-slate-900 dark:text-white">Upcoming Events</h2>
            <Link to="/calendar" className="text-sm font-medium text-gold-600 hover:text-gold-700 dark:text-gold-400">
              View calendar
            </Link>
          </div>
          <div className="mt-4 space-y-3">
            {upcomingEvents.map(event => {
              const prop = event.propertyId ? properties.find(p => p.id === event.propertyId) : null;
              return (
                <div key={event.id} className="flex items-start gap-3 rounded-lg border border-slate-100 p-3 dark:border-slate-700">
                  <div className="h-2.5 w-2.5 shrink-0 rounded-full mt-0.5" style={{ backgroundColor: event.color }} />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-slate-900 dark:text-white">{event.title}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {format(parseISO(event.date), 'MMM d')} at {event.time}
                      {prop && <> &middot; {prop.name}</>}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
