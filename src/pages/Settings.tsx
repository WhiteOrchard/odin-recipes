import { useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import { Moon, Sun, Bell, Shield, Globe, User, Building2, Save } from 'lucide-react';
import { clsx } from 'clsx';

export default function Settings() {
  const { dark, toggle } = useTheme();
  const [notifications, setNotifications] = useState({
    email: true,
    sms: false,
    maintenance: true,
    payments: true,
    leaseExpiry: true,
  });
  const [currency, setCurrency] = useState('USD');
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="font-serif text-2xl font-bold text-slate-900 dark:text-white">Settings</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Manage your account and application preferences</p>
      </div>

      {/* Profile */}
      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-mansion-800">
        <div className="flex items-center gap-3 mb-5">
          <User size={20} className="text-gold-500" />
          <h2 className="font-serif text-lg font-semibold text-slate-900 dark:text-white">Profile</h2>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">First Name</label>
            <input
              type="text"
              defaultValue="Victoria"
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-600 dark:bg-mansion-900 dark:text-white"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Last Name</label>
            <input
              type="text"
              defaultValue="Sterling"
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-600 dark:bg-mansion-900 dark:text-white"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Email</label>
            <input
              type="email"
              defaultValue="v.sterling@luxeestates.com"
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-600 dark:bg-mansion-900 dark:text-white"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Role</label>
            <input
              type="text"
              defaultValue="Portfolio Manager"
              disabled
              className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-500 dark:border-slate-600 dark:bg-mansion-900/50 dark:text-slate-400"
            />
          </div>
        </div>
      </section>

      {/* Appearance */}
      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-mansion-800">
        <div className="flex items-center gap-3 mb-5">
          {dark ? <Moon size={20} className="text-gold-500" /> : <Sun size={20} className="text-gold-500" />}
          <h2 className="font-serif text-lg font-semibold text-slate-900 dark:text-white">Appearance</h2>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-700 dark:text-slate-300">Dark Mode</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">Toggle between light and dark themes</p>
          </div>
          <button
            onClick={toggle}
            className={clsx(
              'relative h-7 w-12 rounded-full transition-colors',
              dark ? 'bg-gold-500' : 'bg-slate-300'
            )}
          >
            <span
              className={clsx(
                'absolute top-0.5 h-6 w-6 rounded-full bg-white shadow transition-transform',
                dark ? 'translate-x-5.5' : 'translate-x-0.5'
              )}
            />
          </button>
        </div>
      </section>

      {/* Notifications */}
      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-mansion-800">
        <div className="flex items-center gap-3 mb-5">
          <Bell size={20} className="text-gold-500" />
          <h2 className="font-serif text-lg font-semibold text-slate-900 dark:text-white">Notifications</h2>
        </div>
        <div className="space-y-4">
          {([
            { key: 'email' as const, label: 'Email Notifications', desc: 'Receive updates via email' },
            { key: 'sms' as const, label: 'SMS Notifications', desc: 'Receive text message alerts' },
            { key: 'maintenance' as const, label: 'Maintenance Alerts', desc: 'Get notified about maintenance requests' },
            { key: 'payments' as const, label: 'Payment Reminders', desc: 'Alerts for upcoming and overdue payments' },
            { key: 'leaseExpiry' as const, label: 'Lease Expiry Warnings', desc: 'Notifications before leases expire' },
          ]).map(item => (
            <div key={item.key} className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-700 dark:text-slate-300">{item.label}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">{item.desc}</p>
              </div>
              <button
                onClick={() => setNotifications(n => ({ ...n, [item.key]: !n[item.key] }))}
                className={clsx(
                  'relative h-7 w-12 rounded-full transition-colors',
                  notifications[item.key] ? 'bg-gold-500' : 'bg-slate-300 dark:bg-slate-600'
                )}
              >
                <span
                  className={clsx(
                    'absolute top-0.5 h-6 w-6 rounded-full bg-white shadow transition-transform',
                    notifications[item.key] ? 'translate-x-5.5' : 'translate-x-0.5'
                  )}
                />
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Preferences */}
      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-mansion-800">
        <div className="flex items-center gap-3 mb-5">
          <Globe size={20} className="text-gold-500" />
          <h2 className="font-serif text-lg font-semibold text-slate-900 dark:text-white">Preferences</h2>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Currency</label>
            <select
              value={currency}
              onChange={e => setCurrency(e.target.value)}
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-600 dark:bg-mansion-900 dark:text-white"
            >
              <option value="USD">USD ($)</option>
              <option value="EUR">EUR (&euro;)</option>
              <option value="GBP">GBP (&pound;)</option>
              <option value="CHF">CHF (Fr.)</option>
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Date Format</label>
            <select className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-600 dark:bg-mansion-900 dark:text-white">
              <option>MM/DD/YYYY</option>
              <option>DD/MM/YYYY</option>
              <option>YYYY-MM-DD</option>
            </select>
          </div>
        </div>
      </section>

      {/* Security */}
      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-mansion-800">
        <div className="flex items-center gap-3 mb-5">
          <Shield size={20} className="text-gold-500" />
          <h2 className="font-serif text-lg font-semibold text-slate-900 dark:text-white">Security</h2>
        </div>
        <div className="space-y-4">
          <div>
            <p className="text-sm font-medium text-slate-700 dark:text-slate-300">Two-Factor Authentication</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">Add an extra layer of security to your account</p>
            <button className="mt-2 rounded-lg border border-gold-300 px-4 py-1.5 text-sm font-medium text-gold-700 hover:bg-gold-50 dark:border-gold-700 dark:text-gold-400 dark:hover:bg-gold-900/20">
              Enable 2FA
            </button>
          </div>
          <div>
            <p className="text-sm font-medium text-slate-700 dark:text-slate-300">Password</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">Last changed 45 days ago</p>
            <button className="mt-2 rounded-lg border border-slate-200 px-4 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-800">
              Change Password
            </button>
          </div>
        </div>
      </section>

      {/* Company */}
      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-mansion-800">
        <div className="flex items-center gap-3 mb-5">
          <Building2 size={20} className="text-gold-500" />
          <h2 className="font-serif text-lg font-semibold text-slate-900 dark:text-white">Company</h2>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Company Name</label>
            <input
              type="text"
              defaultValue="LuxeEstates International"
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-600 dark:bg-mansion-900 dark:text-white"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Tax ID</label>
            <input
              type="text"
              defaultValue="84-1234567"
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-600 dark:bg-mansion-900 dark:text-white"
            />
          </div>
        </div>
      </section>

      {/* Save button */}
      <div className="flex justify-end">
        <button
          onClick={handleSave}
          className={clsx(
            'flex items-center gap-2 rounded-lg px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition-all',
            saved
              ? 'bg-emerald-500'
              : 'bg-gradient-to-r from-gold-500 to-gold-700 hover:from-gold-600 hover:to-gold-800'
          )}
        >
          <Save size={16} />
          {saved ? 'Saved!' : 'Save Changes'}
        </button>
      </div>
    </div>
  );
}
