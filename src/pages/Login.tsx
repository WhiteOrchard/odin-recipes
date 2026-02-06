import { useState } from 'react';
import { Crown, Mail, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

export default function Login() {
  const { signIn, signUp, isDemoMode } = useAuth();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const action = isSignUp ? signUp : signIn;
    const { error } = await action(email, password);

    if (error) {
      setError(error.message);
    }
    setLoading(false);
  };

  const handleDemoLogin = async () => {
    setLoading(true);
    await signIn('demo@luxeestates.com', 'demo');
    setLoading(false);
  };

  return (
    <div className="flex min-h-screen">
      {/* Left side - branding */}
      <div className="hidden w-1/2 flex-col justify-between bg-gradient-to-br from-mansion-900 via-mansion-800 to-mansion-950 p-12 lg:flex">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-gold-400 to-gold-600 text-white">
            <Crown size={22} />
          </div>
          <span className="font-serif text-xl font-bold text-white">LuxeEstates</span>
        </div>

        <div className="max-w-md">
          <h1 className="font-serif text-4xl font-bold leading-tight text-white">
            Manage your luxury portfolio with elegance
          </h1>
          <p className="mt-4 text-lg text-mansion-300">
            A comprehensive platform for managing high-end residential properties, tenants, and financials — all in one place.
          </p>
          <div className="mt-8 grid grid-cols-2 gap-4">
            {[
              { label: 'Properties Managed', value: '500+' },
              { label: 'Portfolio Value', value: '$2.8B' },
              { label: 'Client Satisfaction', value: '99.2%' },
              { label: 'Countries', value: '24' },
            ].map(stat => (
              <div key={stat.label} className="rounded-lg bg-white/5 p-4 backdrop-blur-sm">
                <p className="text-2xl font-bold text-gold-400">{stat.value}</p>
                <p className="text-sm text-mansion-300">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>

        <p className="text-sm text-mansion-400">
          &copy; 2026 LuxeEstates International. All rights reserved.
        </p>
      </div>

      {/* Right side - form */}
      <div className="flex w-full flex-col items-center justify-center bg-slate-50 px-6 dark:bg-mansion-900 lg:w-1/2">
        {/* Mobile logo */}
        <div className="mb-8 flex items-center gap-3 lg:hidden">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-gold-400 to-gold-600 text-white">
            <Crown size={22} />
          </div>
          <span className="font-serif text-xl font-bold text-slate-900 dark:text-white">LuxeEstates</span>
        </div>

        <div className="w-full max-w-md">
          <h2 className="font-serif text-2xl font-bold text-slate-900 dark:text-white">
            {isSignUp ? 'Create your account' : 'Welcome back'}
          </h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            {isSignUp ? 'Start managing your luxury properties' : 'Sign in to your portfolio dashboard'}
          </p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Email</label>
              <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2.5 focus-within:border-gold-400 focus-within:ring-2 focus-within:ring-gold-100 dark:border-slate-600 dark:bg-mansion-800">
                <Mail size={16} className="text-slate-400" />
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="you@company.com"
                  className="flex-1 bg-transparent text-sm outline-none placeholder:text-slate-400 dark:text-white"
                  required
                />
              </div>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Password</label>
              <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2.5 focus-within:border-gold-400 focus-within:ring-2 focus-within:ring-gold-100 dark:border-slate-600 dark:bg-mansion-800">
                <Lock size={16} className="text-slate-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="flex-1 bg-transparent text-sm outline-none placeholder:text-slate-400 dark:text-white"
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(s => !s)}
                  className="text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {error && (
              <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700 dark:bg-red-900/30 dark:text-red-400">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-gold-500 to-gold-700 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:from-gold-600 hover:to-gold-800 disabled:opacity-50"
            >
              {loading ? (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              ) : (
                <>
                  {isSignUp ? 'Create Account' : 'Sign In'}
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          {/* Demo mode button */}
          {isDemoMode && (
            <button
              onClick={handleDemoLogin}
              className="mt-3 w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              Enter Demo Mode
            </button>
          )}

          <div className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">
            {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
            <button
              onClick={() => { setIsSignUp(s => !s); setError(''); }}
              className="font-medium text-gold-600 hover:text-gold-700 dark:text-gold-400"
            >
              {isSignUp ? 'Sign in' : 'Create one'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
