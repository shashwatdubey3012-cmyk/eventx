import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Ticket,
  Clock,
  MapPin,
  XCircle,
  CheckCircle2,
  AlertCircle,
  User,
  Phone,
  Mail,
  Edit3,
  Camera,
  RefreshCw,
} from 'lucide-react';
import { IUser, IBooking } from '../types';
import { api } from '../services/api';

interface UserDashboardProps {
  currentUser: IUser;
  initialTab?: 'overview' | 'bookings' | 'profile';
  onViewTicket: (booking: IBooking) => void;
  onProfileUpdated: (user: IUser) => void;
  onBrowseEvents: () => void;
}

export const UserDashboard: React.FC<UserDashboardProps> = ({
  currentUser,
  initialTab = 'overview',
  onViewTicket,
  onProfileUpdated,
  onBrowseEvents,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'bookings' | 'profile'>(initialTab);
  const [bookings, setBookings] = useState<IBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  // Profile Form states
  const [name, setName] = useState(currentUser.name);
  const [phone, setPhone] = useState(currentUser.phone || '');
  const [city, setCity] = useState(currentUser.city || '');
  const [profileImage, setProfileImage] = useState(currentUser.profileImage || '');
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const res = await api.getMyBookings();
      setBookings(res.bookings);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleCancelBooking = async (booking: IBooking) => {
    if (
      !window.confirm(
        `Are you sure you want to cancel booking ${booking.bookingId} for "${booking.eventTitle}"? This will release your reserved tickets.`
      )
    ) {
      return;
    }

    setCancellingId(booking._id);
    try {
      await api.cancelBooking(booking._id);
      await fetchBookings();
    } catch (err: any) {
      alert(err.message || 'Failed to cancel booking');
    } finally {
      setCancellingId(null);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileSaving(true);
    setProfileError(null);
    setProfileSuccess(false);

    try {
      const res = await api.updateProfile({
        name,
        phone,
        city,
        profileImage,
      });
      onProfileUpdated(res.user);
      setProfileSuccess(true);
      setTimeout(() => setProfileSuccess(false), 3000);
    } catch (err: any) {
      setProfileError(err.message || 'Failed to update profile');
    } finally {
      setProfileSaving(false);
    }
  };

  // Metrics
  const todayStr = new Date().toISOString().split('T')[0];
  const totalBookings = bookings.length;
  const confirmedBookings = bookings.filter((b) => b.bookingStatus === 'confirmed');
  const cancelledBookings = bookings.filter((b) => b.bookingStatus === 'cancelled').length;
  const upcomingEvents = confirmedBookings.filter((b) => b.eventDate >= todayStr).length;
  const pastEvents = confirmedBookings.filter((b) => b.eventDate < todayStr).length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header Profile Banner */}
      <div className="relative rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-slate-800 p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 shadow-xl">
        <div className="flex items-center gap-4">
          <img
            src={
              currentUser.profileImage ||
              'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80'
            }
            alt={currentUser.name}
            className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover ring-2 ring-indigo-500/40 shadow-lg"
          />
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                {currentUser.name}
              </h1>
              <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                {currentUser.role}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">{currentUser.email} • {currentUser.city}</p>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Member since {new Date(currentUser.createdAt).toLocaleDateString([], { month: 'short', year: 'numeric' })}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchBookings}
            className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors"
            title="Refresh Bookings"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={onBrowseEvents}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-gradient-to-r from-indigo-600 to-cyan-600 text-white shadow-md hover:opacity-95 transition-all"
          >
            Explore More Events
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-all ${
            activeTab === 'overview'
              ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 shadow-sm'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          Overview & Stats
        </button>
        <button
          onClick={() => setActiveTab('bookings')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-all ${
            activeTab === 'bookings'
              ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 shadow-sm'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          My Bookings ({bookings.length})
        </button>
        <button
          onClick={() => setActiveTab('profile')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-all ${
            activeTab === 'profile'
              ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 shadow-sm'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          Profile Settings
        </button>
      </div>

      {/* Tab 1: Overview */}
      {activeTab === 'overview' && (
        <div className="space-y-8">
          {/* Stat metrics */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-400">Upcoming Events</span>
                <Calendar className="w-4 h-4 text-cyan-400" />
              </div>
              <div className="text-2xl font-extrabold text-white mt-2">{upcomingEvents}</div>
              <div className="text-[11px] text-slate-500 mt-1">Confirmed upcoming passes</div>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-400">Total Bookings</span>
                <Ticket className="w-4 h-4 text-indigo-400" />
              </div>
              <div className="text-2xl font-extrabold text-white mt-2">{totalBookings}</div>
              <div className="text-[11px] text-slate-500 mt-1">Lifetime registrations</div>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-400">Past Events</span>
                <Clock className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="text-2xl font-extrabold text-white mt-2">{pastEvents}</div>
              <div className="text-[11px] text-slate-500 mt-1">Completed gatherings</div>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-400">Cancelled Bookings</span>
                <XCircle className="w-4 h-4 text-rose-400" />
              </div>
              <div className="text-2xl font-extrabold text-white mt-2">{cancelledBookings}</div>
              <div className="text-[11px] text-slate-500 mt-1">Refunded / released</div>
            </div>
          </div>

          {/* Quick Bookings Section */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-white tracking-tight">Recent Passes</h2>
              <button
                onClick={() => setActiveTab('bookings')}
                className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold"
              >
                View all bookings →
              </button>
            </div>

            {bookings.length === 0 ? (
              <div className="p-8 text-center bg-slate-900/60 rounded-2xl border border-slate-800 space-y-3">
                <Ticket className="w-8 h-8 text-slate-600 mx-auto" />
                <div className="text-sm font-semibold text-slate-300">No bookings yet</div>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Discover trending summits, music festivals, and workshops happening this week.
                </p>
                <button
                  onClick={onBrowseEvents}
                  className="px-4 py-2 text-xs font-semibold rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white transition-colors"
                >
                  Browse Events
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {bookings.slice(0, 4).map((b) => (
                  <div
                    key={b._id}
                    className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex items-start justify-between gap-4"
                  >
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-bold text-cyan-400">
                          {b.bookingId}
                        </span>
                        <span
                          className={`text-[10px] uppercase font-bold px-1.5 py-0.5 rounded ${
                            b.bookingStatus === 'confirmed'
                              ? 'bg-emerald-500/15 text-emerald-300'
                              : 'bg-rose-500/15 text-rose-400'
                          }`}
                        >
                          {b.bookingStatus}
                        </span>
                      </div>
                      <h4 className="text-sm font-bold text-white truncate">{b.eventTitle}</h4>
                      <p className="text-xs text-slate-400">{b.eventDate} • {b.eventVenue}</p>
                    </div>

                    <button
                      onClick={() => onViewTicket(b)}
                      className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white shrink-0 transition-colors"
                    >
                      View Ticket
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 2: My Bookings */}
      {activeTab === 'bookings' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight">My Event Bookings</h2>
              <p className="text-xs text-slate-400">Manage all your passes and digital entry passes</p>
            </div>
          </div>

          {bookings.length === 0 ? (
            <div className="p-12 text-center bg-slate-900 rounded-2xl border border-slate-800 space-y-3">
              <Ticket className="w-10 h-10 text-slate-600 mx-auto" />
              <div className="text-base font-semibold text-slate-300">You haven’t booked any events</div>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Explore our curated catalog and reserve your spot in minutes.
              </p>
              <button
                onClick={onBrowseEvents}
                className="px-4 py-2 text-xs font-semibold rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white"
              >
                Browse Events
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {bookings.map((booking) => (
                <div
                  key={booking._id}
                  className="p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700/80 transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-6"
                >
                  {/* Left: Thumbnail & Details */}
                  <div className="flex items-start gap-4 flex-1 min-w-0">
                    <img
                      src={
                        booking.eventBanner ||
                        'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=400&q=80'
                      }
                      alt={booking.eventTitle}
                      className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl object-cover ring-1 ring-slate-700 shrink-0"
                    />
                    <div className="space-y-1.5 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs font-mono font-bold text-cyan-400">
                          {booking.bookingId}
                        </span>
                        <span
                          className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded ${
                            booking.bookingStatus === 'confirmed'
                              ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                              : 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                          }`}
                        >
                          {booking.bookingStatus}
                        </span>
                        {booking.checkedIn ? (
                          <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-amber-500/15 text-amber-300 border border-amber-500/30 flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" /> Checked In
                          </span>
                        ) : (
                          <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-indigo-500/15 text-indigo-300 border border-indigo-500/30">
                            Entry Ready
                          </span>
                        )}
                      </div>

                      <h3 className="text-base font-bold text-white truncate">
                        {booking.eventTitle}
                      </h3>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1 text-xs text-slate-400">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                          <span>{booking.eventDate} at {booking.eventTime}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                          <span className="truncate">{booking.eventVenue}</span>
                        </div>
                        <div>
                          <span>Pass: </span>
                          <span className="text-slate-200 font-semibold">
                            {booking.ticketType} ({booking.quantity}x)
                          </span>
                        </div>
                        <div>
                          <span>Paid: </span>
                          <span className="text-emerald-400 font-semibold">
                            ${booking.totalAmount.toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right: Actions */}
                  <div className="flex items-center gap-2 self-end md:self-center shrink-0">
                    <button
                      onClick={() => onViewTicket(booking)}
                      className="px-4 py-2 text-xs font-semibold rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white flex items-center gap-1.5 shadow-md shadow-indigo-600/20 transition-colors"
                    >
                      <Ticket className="w-3.5 h-3.5" />
                      View Ticket
                    </button>

                    {booking.bookingStatus === 'confirmed' && !booking.checkedIn && (
                      <button
                        onClick={() => handleCancelBooking(booking)}
                        disabled={cancellingId === booking._id}
                        className="px-3 py-2 text-xs font-semibold rounded-xl bg-slate-800 hover:bg-rose-950/40 text-slate-300 hover:text-rose-400 border border-slate-700 hover:border-rose-500/30 transition-colors disabled:opacity-50"
                      >
                        {cancellingId === booking._id ? 'Cancelling...' : 'Cancel'}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Profile Settings */}
      {activeTab === 'profile' && (
        <div className="max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-6">
          <div>
            <h2 className="text-lg font-bold text-white tracking-tight">Edit Profile</h2>
            <p className="text-xs text-slate-400">Update your account information and contact preferences</p>
          </div>

          {profileSuccess && (
            <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              Profile changes saved successfully!
            </div>
          )}

          {profileError && (
            <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs">
              {profileError}
            </div>
          )}

          <form onSubmit={handleSaveProfile} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Profile Avatar URL
              </label>
              <div className="relative">
                <Camera className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/..."
                  value={profileImage}
                  onChange={(e) => setProfileImage(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Full Name</label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                <input
                  type="email"
                  disabled
                  value={currentUser.email}
                  className="w-full pl-9 pr-3 py-2 bg-slate-950/50 border border-slate-800/60 rounded-xl text-xs text-slate-400 cursor-not-allowed"
                />
              </div>
              <span className="text-[10px] text-slate-500 mt-0.5 block">Email cannot be modified directly</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Phone Number</label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">City / Region</label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={profileSaving}
                className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md transition-colors disabled:opacity-50"
              >
                {profileSaving ? 'Saving Changes...' : 'Save Profile'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
