import { Bell, Search, Moon, Sun, User } from 'lucide-react';
import { useTheme } from '../hooks/useTheme';
import { useState } from 'react';

export default function Header() {
  const { dark, toggle } = useTheme();
  const [searchOpen, setSearchOpen] = useState(false);

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-200 bg-white/80 px-6 backdrop-blur-md dark:border-slate-700 dark:bg-mansion-950/80">
      {/* Search */}
      <div className="flex items-center gap-3">
        {searchOpen ? (
          <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 dark:border-slate-600 dark:bg-slate-800">
            <Search size={16} className="text-slate-400" />
            <input
              autoFocus
              type="text"
              placeholder="Search properties, tenants..."
              className="w-64 bg-transparent text-sm outline-none placeholder:text-slate-400 dark:text-white"
              onBlur={() => setSearchOpen(false)}
            />
          </div>
        ) : (
          <button
            onClick={() => setSearchOpen(true)}
            className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-1.5 text-sm text-slate-400 transition-colors hover:border-slate-300 hover:text-slate-500 dark:border-slate-600 dark:hover:border-slate-500"
          >
            <Search size={16} />
            <span>Search...</span>
            <kbd className="ml-8 rounded border border-slate-200 px-1.5 py-0.5 text-xs dark:border-slate-600">
              /
            </kbd>
          </button>
        )}
      </div>

      {/* Right actions */}
      <div className="flex items-center gap-2">
        <button
          onClick={toggle}
          className="rounded-lg p-2 text-slate-500 transition-colors hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
          title={dark ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {dark ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        <button className="relative rounded-lg p-2 text-slate-500 transition-colors hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800">
          <Bell size={18} />
          <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-red-500" />
        </button>

        <div className="ml-2 flex items-center gap-3 rounded-lg border border-slate-200 px-3 py-1.5 dark:border-slate-700">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-gold-400 to-gold-600 text-sm font-semibold text-white">
            <User size={16} />
          </div>
          <div className="hidden sm:block">
            <p className="text-sm font-medium text-slate-900 dark:text-white">Victoria Sterling</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">Portfolio Manager</p>
          </div>
        </div>
      </div>
    </header>
  );
}
