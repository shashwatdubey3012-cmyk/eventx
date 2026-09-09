import React, { useState, useEffect, useRef } from 'react';
import {
  Calendar,
  Search,
  Bell,
  User,
  PlusCircle,
  ShieldCheck,
  Briefcase,
  Ticket,
  LogOut,
  ChevronDown,
  Sparkles,
  Menu,
  X,
  CheckCircle2,
} from 'lucide-react';
import { IUser, INotification } from '../types';
import { api } from '../services/api';

interface NavbarProps {
  currentUser: IUser | null;
  currentView: string;
  onNavigate: (view: string, params?: any) => void;
  onOpenAuth: (defaultTab?: 'login' | 'register') => void;
  onLogout: () => void;
  onQuickSwitchUser: (email: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  currentView,
  onNavigate,
  onOpenAuth,
  onLogout,
  onQuickSwitchUser,
}) => {
  const [notifications, setNotifications] = useState<INotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifs, setShowNotifs] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showDemoMenu, setShowDemoMenu] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const notifRef = useRef<HTMLDivElement>(null);
  const userRef = useRef<HTMLDivElement>(null);
  const demoRef = useRef<HTMLDivElement>(null);

  // Fetch notifications when user changes
  const fetchNotifications = async () => {
    if (!currentUser) return;
    try {
      const res = await api.getNotifications();
      setNotifications(res.notifications);
      setUnreadCount(res.unreadCount);
    } catch {
      // ignore silently
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 15000);
    return () => clearInterval(interval);
  }, [currentUser]);

  // Click outside listener
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setShowNotifs(false);
      }
      if (userRef.current && !userRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
      if (demoRef.current && !demoRef.current.contains(event.target as Node)) {
        setShowDemoMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMarkAllRead = async () => {
    try {
      await api.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error(err);
    }
  };

  const navLinks = [
    { label: 'Home', view: 'home' },
    { label: 'Events', view: 'events' },
    { label: 'Categories', view: 'categories' },
    { label: 'My Bookings', view: 'my-bookings', requireAuth: true },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-slate-950/85 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Left: Brand Logo */}
        <div className="flex items-center gap-8">
          <button
            id="brand-logo-btn"
            onClick={() => onNavigate('home')}
            className="flex items-center gap-2.5 text-left group focus:outline-none"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-violet-600 to-cyan-400 p-0.5 shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition-transform duration-200">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <Calendar className="w-5 h-5 text-cyan-400 group-hover:text-cyan-300 transition-colors" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent font-['Space_Grotesk',sans-serif]">
                  Event<span className="text-cyan-400">X</span>
                </span>
                <span className="text-[10px] uppercase font-bold tracking-widest px-1.5 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                  Live
                </span>
              </div>
              <p className="text-[10px] text-slate-400 hidden sm:block">Discover & Experience</p>
            </div>
          </button>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => {
              const active = currentView === link.view;
              return (
                <button
                  key={link.view}
                  id={`nav-${link.view}`}
                  onClick={() => {
                    if (link.requireAuth && !currentUser) {
                      onOpenAuth('login');
                    } else {
                      onNavigate(link.view);
                    }
                  }}
                  className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-all ${
                    active
                      ? 'text-white bg-slate-800/90 shadow-sm border border-slate-700/60'
                      : 'text-slate-300 hover:text-white hover:bg-slate-900/60'
                  }`}
                >
                  {link.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Right Action Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* One-Click Role Switcher */}
          <div className="relative" ref={demoRef}>
            <button
              id="demo-role-btn"
              onClick={() => setShowDemoMenu(!showDemoMenu)}
              className="flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1.5 rounded-lg bg-indigo-950/40 text-indigo-300 border border-indigo-500/30 hover:bg-indigo-900/40 hover:text-white transition-all shadow-sm"
              title="Test with instant User, Organizer, or Admin accounts"
            >
              <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
              <span className="hidden sm:inline">Role:</span>
              <span className="capitalize font-bold text-cyan-300">
                {currentUser ? currentUser.role : 'Guest'}
              </span>
              <ChevronDown className="w-3 h-3 text-indigo-400 ml-0.5" />
            </button>

            {showDemoMenu && (
              <div className="absolute right-0 mt-2 w-64 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="px-2 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-400 border-b border-slate-800">
                  Quick Role Switcher
                </div>
                <div className="mt-1.5 space-y-1">
                  <button
                    onClick={() => {
                      onQuickSwitchUser('user@eventx.com');
                      setShowDemoMenu(false);
                    }}
                    className="w-full flex items-center justify-between p-2 rounded-lg text-left text-xs text-slate-200 hover:bg-slate-800 hover:text-white transition-colors"
                  >
                    <div>
                      <div className="font-semibold text-slate-100 flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-indigo-400" />
                        Jordan Miller (User)
                      </div>
                      <div className="text-[11px] text-slate-400">user@eventx.com</div>
                    </div>
                    {currentUser?.role === 'user' && (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    )}
                  </button>

                  <button
                    onClick={() => {
                      onQuickSwitchUser('organizer@eventx.com');
                      setShowDemoMenu(false);
                    }}
                    className="w-full flex items-center justify-between p-2 rounded-lg text-left text-xs text-slate-200 hover:bg-slate-800 hover:text-white transition-colors"
                  >
                    <div>
                      <div className="font-semibold text-slate-100 flex items-center gap-1.5">
                        <Briefcase className="w-3.5 h-3.5 text-cyan-400" />
                        Sarah Chen (Organizer)
                      </div>
                      <div className="text-[11px] text-slate-400">organizer@eventx.com</div>
                    </div>
                    {currentUser?.role === 'organizer' && (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    )}
                  </button>

                  <button
                    onClick={() => {
                      onQuickSwitchUser('admin@eventx.com');
                      setShowDemoMenu(false);
                    }}
                    className="w-full flex items-center justify-between p-2 rounded-lg text-left text-xs text-slate-200 hover:bg-slate-800 hover:text-white transition-colors"
                  >
                    <div>
                      <div className="font-semibold text-slate-100 flex items-center gap-1.5">
                        <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                        Alex Vance (Admin)
                      </div>
                      <div className="text-[11px] text-slate-400">admin@eventx.com</div>
                    </div>
                    {currentUser?.role === 'admin' && (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    )}
                  </button>

                  {currentUser && (
                    <button
                      onClick={() => {
                        onLogout();
                        setShowDemoMenu(false);
                      }}
                      className="w-full text-left text-xs text-rose-400 hover:bg-rose-950/40 p-2 rounded-lg mt-1 border-t border-slate-800 flex items-center gap-1.5"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      Sign Out to Guest
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Create Event CTA */}
          <button
            id="nav-create-event-btn"
            onClick={() => {
              if (!currentUser) {
                onOpenAuth('login');
              } else if (currentUser.role === 'user') {
                onNavigate('organizer-dashboard', { tab: 'create' });
              } else {
                onNavigate('organizer-dashboard', { tab: 'create' });
              }
            }}
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-gradient-to-r from-indigo-600 to-cyan-600 text-white hover:opacity-95 shadow-md shadow-indigo-600/20 transition-all hover:scale-[1.02]"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            Create Event
          </button>

          {/* Notifications dropdown */}
          {currentUser && (
            <div className="relative" ref={notifRef}>
              <button
                id="notifications-bell-btn"
                onClick={() => setShowNotifs(!showNotifs)}
                className="relative p-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-900 border border-transparent hover:border-slate-800 transition-colors"
                aria-label="Notifications"
              >
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-cyan-400 ring-2 ring-slate-950 animate-ping" />
                )}
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-cyan-400 ring-2 ring-slate-950" />
                )}
              </button>

              {showNotifs && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl overflow-hidden z-50">
                  <div className="px-4 py-3 border-b border-slate-800 flex items-center justify-between">
                    <div className="font-semibold text-sm text-slate-100 flex items-center gap-2">
                      <span>Notifications</span>
                      {unreadCount > 0 && (
                        <span className="text-[11px] px-1.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-bold">
                          {unreadCount} new
                        </span>
                      )}
                    </div>
                    {unreadCount > 0 && (
                      <button
                        onClick={handleMarkAllRead}
                        className="text-xs text-indigo-400 hover:text-indigo-300 font-medium"
                      >
                        Mark all read
                      </button>
                    )}
                  </div>

                  <div className="max-h-80 overflow-y-auto divide-y divide-slate-800/60">
                    {notifications.length === 0 ? (
                      <div className="py-8 text-center text-xs text-slate-500">
                        No notifications yet
                      </div>
                    ) : (
                      notifications.map((notif) => (
                        <div
                          key={notif._id}
                          className={`p-3.5 transition-colors ${
                            notif.read ? 'bg-slate-900/50' : 'bg-slate-800/40'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <span className="text-xs font-semibold text-slate-200">
                              {notif.title}
                            </span>
                            <span className="text-[10px] text-slate-500 whitespace-nowrap">
                              {new Date(notif.createdAt).toLocaleDateString([], {
                                month: 'short',
                                day: 'numeric',
                              })}
                            </span>
                          </div>
                          <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                            {notif.message}
                          </p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* User Profile Menu or Login Button */}
          {currentUser ? (
            <div className="relative" ref={userRef}>
              <button
                id="user-profile-menu-btn"
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2 p-1 pl-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-colors"
              >
                <img
                  src={
                    currentUser.profileImage ||
                    'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&q=80'
                  }
                  alt={currentUser.name}
                  className="w-7 h-7 rounded-lg object-cover ring-1 ring-slate-700"
                />
                <span className="text-xs font-medium text-slate-200 hidden md:block max-w-[100px] truncate">
                  {currentUser.name}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 pr-1" />
              </button>

              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-56 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl p-1.5 z-50">
                  <div className="px-3 py-2 border-b border-slate-800">
                    <div className="text-xs font-bold text-slate-200 truncate">{currentUser.name}</div>
                    <div className="text-[11px] text-slate-400 truncate">{currentUser.email}</div>
                    <div className="mt-1 inline-block text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300">
                      {currentUser.role}
                    </div>
                  </div>

                  <div className="py-1 space-y-0.5">
                    <button
                      onClick={() => {
                        onNavigate('user-dashboard', { tab: 'overview' });
                        setShowUserMenu(false);
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-xs text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                    >
                      <User className="w-3.5 h-3.5 text-indigo-400" />
                      User Dashboard
                    </button>

                    <button
                      onClick={() => {
                        onNavigate('my-bookings');
                        setShowUserMenu(false);
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-xs text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                    >
                      <Ticket className="w-3.5 h-3.5 text-cyan-400" />
                      My Bookings & Passes
                    </button>

                    {(currentUser.role === 'organizer' || currentUser.role === 'admin') && (
                      <button
                        onClick={() => {
                          onNavigate('organizer-dashboard');
                          setShowUserMenu(false);
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 text-xs text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                      >
                        <Briefcase className="w-3.5 h-3.5 text-emerald-400" />
                        Organizer Portal
                      </button>
                    )}

                    {currentUser.role === 'admin' && (
                      <button
                        onClick={() => {
                          onNavigate('admin-dashboard');
                          setShowUserMenu(false);
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 text-xs text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                      >
                        <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                        Admin Governance
                      </button>
                    )}
                  </div>

                  <div className="pt-1 border-t border-slate-800">
                    <button
                      onClick={() => {
                        onLogout();
                        setShowUserMenu(false);
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-xs text-rose-400 hover:bg-rose-950/40 rounded-lg transition-colors"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                id="login-btn"
                onClick={() => onOpenAuth('login')}
                className="px-3.5 py-1.5 text-xs font-semibold text-slate-200 hover:text-white hover:bg-slate-900 rounded-lg transition-colors"
              >
                Sign In
              </button>
              <button
                id="register-btn"
                onClick={() => onOpenAuth('register')}
                className="px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-indigo-600 text-white hover:bg-indigo-500 shadow-sm transition-all"
              >
                Register
              </button>
            </div>
          )}

          {/* Mobile menu hamburger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-900 focus:outline-none"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-800 bg-slate-950 px-4 pt-3 pb-5 space-y-2 animate-in fade-in duration-150">
          {navLinks.map((link) => (
            <button
              key={link.view}
              onClick={() => {
                setMobileMenuOpen(false);
                if (link.requireAuth && !currentUser) {
                  onOpenAuth('login');
                } else {
                  onNavigate(link.view);
                }
              }}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium ${
                currentView === link.view
                  ? 'bg-indigo-600/20 text-indigo-300 font-semibold'
                  : 'text-slate-300 hover:bg-slate-900'
              }`}
            >
              {link.label}
            </button>
          ))}

          <button
            onClick={() => {
              setMobileMenuOpen(false);
              onNavigate('organizer-dashboard', { tab: 'create' });
            }}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold bg-gradient-to-r from-indigo-600 to-cyan-600 text-white mt-2"
          >
            <PlusCircle className="w-4 h-4" />
            Create Event
          </button>

          {currentUser?.role === 'admin' && (
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onNavigate('admin-dashboard');
              }}
              className="w-full text-left px-3 py-2 rounded-lg text-sm text-amber-400 hover:bg-slate-900 flex items-center gap-2"
            >
              <ShieldCheck className="w-4 h-4" />
              Admin Portal
            </button>
          )}
        </div>
      )}
    </header>
  );
};
