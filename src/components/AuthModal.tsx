import React, { useState } from 'react';
import { X, Mail, Lock, User, Phone, MapPin, Eye, EyeOff, Sparkles, ShieldCheck, Briefcase } from 'lucide-react';
import { api } from '../services/api';
import { IUser } from '../types';

interface AuthModalProps {
  isOpen: boolean;
  defaultTab?: 'login' | 'register';
  onClose: () => void;
  onSuccess: (user: IUser) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  defaultTab = 'login',
  onClose,
  onSuccess,
}) => {
  const [tab, setTab] = useState<'login' | 'register'>(defaultTab);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('');
  const [role, setRole] = useState<'user' | 'organizer'>('user');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (tab === 'login') {
        const res = await api.login({ email, password });
        onSuccess(res.user);
        onClose();
      } else {
        const res = await api.register({
          name,
          email,
          password,
          phone,
          role,
          city: city || 'San Francisco, CA',
        });
        onSuccess(res.user);
        onClose();
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = async (demoEmail: string, demoPass: string) => {
    setError(null);
    setLoading(true);
    try {
      const res = await api.login({ email: demoEmail, password: demoPass });
      onSuccess(res.user);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Quick login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-slate-800">
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight font-['Space_Grotesk',sans-serif]">
              {tab === 'login' ? 'Welcome Back to EventX' : 'Create an Account'}
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              {tab === 'login'
                ? 'Sign in to access tickets, bookings & organizers'
                : 'Join the premier community event platform'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switch */}
        <div className="flex border-b border-slate-800 bg-slate-950/50">
          <button
            type="button"
            onClick={() => {
              setTab('login');
              setError(null);
            }}
            className={`flex-1 py-3 text-xs font-semibold tracking-wide uppercase transition-colors ${
              tab === 'login'
                ? 'text-cyan-400 border-b-2 border-cyan-400 bg-slate-900/40'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setTab('register');
              setError(null);
            }}
            className={`flex-1 py-3 text-xs font-semibold tracking-wide uppercase transition-colors ${
              tab === 'register'
                ? 'text-cyan-400 border-b-2 border-cyan-400 bg-slate-900/40'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Register
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6">
          {error && (
            <div className="mb-4 p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
              <span className="font-bold">Error:</span> {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {tab === 'register' && (
              <>
                {/* Role selection */}
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    I want to join as:
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setRole('user')}
                      className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
                        role === 'user'
                          ? 'border-indigo-500 bg-indigo-500/15 text-white shadow-sm'
                          : 'border-slate-800 bg-slate-950 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      <User className="w-3.5 h-3.5 text-indigo-400" />
                      Attendee / User
                    </button>
                    <button
                      type="button"
                      onClick={() => setRole('organizer')}
                      className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
                        role === 'organizer'
                          ? 'border-cyan-500 bg-cyan-500/15 text-white shadow-sm'
                          : 'border-slate-800 bg-slate-950 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      <Briefcase className="w-3.5 h-3.5 text-cyan-400" />
                      Event Organizer
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Full Name</label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                    <input
                      type="text"
                      required
                      placeholder="e.g. Jordan Miller"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Phone</label>
                    <div className="relative">
                      <Phone className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                      <input
                        type="text"
                        placeholder="+1 (555) 000-0000"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">City</label>
                    <div className="relative">
                      <MapPin className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                      <input
                        type="text"
                        placeholder="e.g. Austin, TX"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                  </div>
                </div>
              </>
            )}

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                <input
                  type="email"
                  required
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-10 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-200"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-600 text-white text-xs font-semibold shadow-lg shadow-indigo-600/20 hover:opacity-95 transition-opacity disabled:opacity-50"
            >
              {loading
                ? 'Authenticating...'
                : tab === 'login'
                ? 'Sign In to EventX'
                : 'Complete Registration'}
            </button>
          </form>

          {/* Quick Demo Test Logins */}
          <div className="mt-6 pt-5 border-t border-slate-800/80">
            <div className="flex items-center gap-1.5 mb-2.5">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Instant Demo Access
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleQuickLogin('user@eventx.com', 'User123!')}
                className="p-2 rounded-lg bg-slate-950 border border-slate-800 hover:border-indigo-500/60 text-center transition-all group"
              >
                <div className="text-[11px] font-bold text-slate-200 group-hover:text-indigo-300">
                  User
                </div>
                <div className="text-[9px] text-slate-500">Jordan M.</div>
              </button>
              <button
                type="button"
                onClick={() => handleQuickLogin('organizer@eventx.com', 'Organizer123!')}
                className="p-2 rounded-lg bg-slate-950 border border-slate-800 hover:border-cyan-500/60 text-center transition-all group"
              >
                <div className="text-[11px] font-bold text-slate-200 group-hover:text-cyan-300">
                  Organizer
                </div>
                <div className="text-[9px] text-slate-500">Sarah Chen</div>
              </button>
              <button
                type="button"
                onClick={() => handleQuickLogin('admin@eventx.com', 'Admin123!')}
                className="p-2 rounded-lg bg-slate-950 border border-slate-800 hover:border-amber-500/60 text-center transition-all group"
              >
                <div className="text-[11px] font-bold text-slate-200 group-hover:text-amber-300">
                  Admin
                </div>
                <div className="text-[9px] text-slate-500">Alex Vance</div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
