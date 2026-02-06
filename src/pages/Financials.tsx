import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
  LineChart, Line,
} from 'recharts';
import { DollarSign, TrendingUp, TrendingDown, PiggyBank } from 'lucide-react';
import { monthlyFinancials, properties, formatCurrency, formatFullCurrency } from '../data/mockData';
import StatCard from '../components/StatCard';

const totalRevenue = monthlyFinancials.reduce((s, m) => s + m.revenue, 0);
const totalExpenses = monthlyFinancials.reduce((s, m) => s + m.expenses, 0);
const totalProfit = totalRevenue - totalExpenses;
const avgMonthlyRevenue = totalRevenue / monthlyFinancials.length;

const propertyRevenue = properties
  .filter(p => p.status === 'occupied')
  .map(p => ({
    name: p.name.length > 20 ? p.name.slice(0, 17) + '...' : p.name,
    revenue: p.monthlyRent,
    yield: Number(((p.monthlyRent * 12 / p.price) * 100).toFixed(2)),
  }))
  .sort((a, b) => b.revenue - a.revenue);

export default function Financials() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-2xl font-bold text-slate-900 dark:text-white">Financial Analytics</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">12-month financial performance overview</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Total Revenue" value={formatCurrency(totalRevenue)} icon={DollarSign} color="green" change={12.3} />
        <StatCard title="Total Expenses" value={formatCurrency(totalExpenses)} icon={TrendingDown} color="rose" change={-3.1} />
        <StatCard title="Net Profit" value={formatCurrency(totalProfit)} icon={TrendingUp} color="blue" change={15.7} />
        <StatCard title="Avg Monthly Revenue" value={formatCurrency(avgMonthlyRevenue)} icon={PiggyBank} color="amber" />
      </div>

      {/* Revenue vs Expenses Bar Chart */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-mansion-800">
        <h2 className="font-serif text-lg font-semibold text-slate-900 dark:text-white">Monthly Revenue vs Expenses</h2>
        <p className="mb-4 text-sm text-slate-500 dark:text-slate-400">Side-by-side comparison over the past 12 months</p>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={monthlyFinancials} barGap={4}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} stroke="#94a3b8" />
              <YAxis tickFormatter={(v: number) => `$${v / 1000}K`} tick={{ fontSize: 11 }} stroke="#94a3b8" />
              <Tooltip formatter={(value) => [formatFullCurrency(Number(value)), '']} contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0' }} />
              <Legend />
              <Bar dataKey="revenue" fill="#c8a415" radius={[4, 4, 0, 0]} name="Revenue" />
              <Bar dataKey="expenses" fill="#ef4444" radius={[4, 4, 0, 0]} name="Expenses" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Profit trend */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-mansion-800">
          <h2 className="font-serif text-lg font-semibold text-slate-900 dark:text-white">Profit Trend</h2>
          <p className="mb-4 text-sm text-slate-500 dark:text-slate-400">Monthly net income over time</p>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthlyFinancials}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} stroke="#94a3b8" />
                <YAxis tickFormatter={(v: number) => `$${v / 1000}K`} tick={{ fontSize: 11 }} stroke="#94a3b8" />
                <Tooltip formatter={(value) => [formatFullCurrency(Number(value)), 'Profit']} contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0' }} />
                <Line type="monotone" dataKey="profit" stroke="#10b981" strokeWidth={2} dot={{ fill: '#10b981', r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Property revenue breakdown */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-mansion-800">
          <h2 className="font-serif text-lg font-semibold text-slate-900 dark:text-white">Revenue by Property</h2>
          <p className="mb-4 text-sm text-slate-500 dark:text-slate-400">Monthly rental income per occupied property</p>
          <div className="space-y-3">
            {propertyRevenue.map(p => (
              <div key={p.name}>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-700 dark:text-slate-300">{p.name}</span>
                  <span className="font-semibold text-slate-900 dark:text-white">{formatFullCurrency(p.revenue)}</span>
                </div>
                <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-700">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-gold-400 to-gold-600"
                    style={{ width: `${(p.revenue / propertyRevenue[0].revenue) * 100}%` }}
                  />
                </div>
                <p className="mt-0.5 text-xs text-slate-400">{p.yield}% annual yield</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
