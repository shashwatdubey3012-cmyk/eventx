import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  Users,
  Calendar,
  Ticket,
  DollarSign,
  CheckCircle2,
  XCircle,
  Trash2,
  Search,
  Filter,
  UserCheck,
  UserX,
  RefreshCw,
  TrendingUp,
} from 'lucide-react';
import { IUser, IEvent, IBooking } from '../types';
import { api } from '../services/api';

interface AdminDashboardProps {
  currentUser: IUser;
  onLogout: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ currentUser, onLogout }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'events' | 'users' | 'bookings'>('overview');
  const [stats, setStats] = useState<any>(null);
  const [events, setEvents] = useState<IEvent[]>([]);
  const [users, setUsers] = useState<IUser[]>([]);
  const [bookings, setBookings] = useState<IBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  // Search & Filters
  const [eventSearch, setEventSearch] = useState('');
  const [userSearch, setUserSearch] = useState('');
  const [bookingSearch, setBookingSearch] = useState('');

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const [statsRes, eventsRes, usersRes, bookingsRes] = await Promise.all([
        api.getAdminStats(),
        api.getAdminEvents(),
        api.getAdminUsers(),
        api.getAdminBookings(),
      ]);
      setStats(statsRes.stats);
      setEvents(eventsRes.events);
      setUsers(usersRes.users);
      setBookings(bookingsRes.bookings);
    } catch (err) {
      console.error('Failed to load admin data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleUpdateEventStatus = async (eventId: string, status: 'Approved' | 'Rejected') => {
    setActionLoadingId(eventId);
    try {
      await api.updateEventStatus(eventId, status);
      await fetchAdminData();
    } catch (err: any) {
      alert(err.message || 'Failed to update event status');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleDeleteEvent = async (eventId: string, title: string) => {
    if (!window.confirm(`Delete event "${title}" as admin? This will cancel all bookings.`)) return;
    setActionLoadingId(eventId);
    try {
      await api.deleteAdminEvent(eventId);
      await fetchAdminData();
    } catch (err: any) {
      alert(err.message || 'Failed to delete event');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleToggleBlockUser = async (user: IUser) => {
    const willBlock = !user.isBlocked;
    if (
      !window.confirm(
        `${willBlock ? 'Block' : 'Unblock'} user "${user.name}" (${user.email})?`
      )
    )
      return;

    setActionLoadingId(user._id);
    try {
      await api.toggleBlockUser(user._id, willBlock);
      await fetchAdminData();
    } catch (err: any) {
      alert(err.message || 'Failed to update user status');
    } finally {
      setActionLoadingId(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header Banner */}
      <div className="rounded-2xl bg-gradient-to-r from-amber-950/40 via-slate-900 to-slate-900 border border-amber-500/30 p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 shadow-xl">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-white tracking-tight">
                EventX Super Admin Console
              </h1>
              <span className="px-2 py-0.5 rounded text-[10px] uppercase font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                Full Privileges
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Platform moderation, event approvals, user role management, and global financial metrics
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchAdminData}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors"
            title="Refresh Data"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={onLogout}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-rose-950/40 hover:bg-rose-900 text-rose-300 border border-rose-500/30 transition-colors"
          >
            Logout
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-all ${
            activeTab === 'overview'
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          System Overview & Metrics
        </button>
        <button
          onClick={() => setActiveTab('events')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-all ${
            activeTab === 'events'
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          All Events ({events.length})
        </button>
        <button
          onClick={() => setActiveTab('users')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-all ${
            activeTab === 'users'
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          Users & Organizers ({users.length})
        </button>
        <button
          onClick={() => setActiveTab('bookings')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-all ${
            activeTab === 'bookings'
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          Bookings ({bookings.length})
        </button>
      </div>

      {/* TAB 1: SYSTEM OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="space-y-8">
          {/* Top 5 System Stats */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-400">
                <span>Total Users</span>
                <Users className="w-4 h-4 text-indigo-400" />
              </div>
              <div className="text-2xl font-extrabold text-white mt-2">
                {stats?.totalUsers || 0}
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5">Attendee accounts</div>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-400">
                <span>Total Organizers</span>
                <UserCheck className="w-4 h-4 text-cyan-400" />
              </div>
              <div className="text-2xl font-extrabold text-white mt-2">
                {stats?.totalOrganizers || 0}
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5">Event creators</div>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-400">
                <span>Total Events</span>
                <Calendar className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="text-2xl font-extrabold text-white mt-2">
                {stats?.totalEvents || 0}
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5">
                {stats?.pendingEvents || 0} awaiting approval
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-400">
                <span>Total Bookings</span>
                <Ticket className="w-4 h-4 text-amber-400" />
              </div>
              <div className="text-2xl font-extrabold text-white mt-2">
                {stats?.totalBookings || 0}
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5">Tickets issued</div>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 col-span-2 md:col-span-1">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-400">
                <span>Total Revenue</span>
                <DollarSign className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="text-2xl font-extrabold text-white mt-2">
                ${(stats?.totalRevenue || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5">Gross GMV processed</div>
            </div>
          </div>

          {/* Pending Events Moderation Queue */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-white tracking-tight">
                  Events Requiring Approval
                </h2>
                <p className="text-xs text-slate-400">
                  Review new submissions before they appear on the public discovery feed
                </p>
              </div>
              <span className="px-2.5 py-1 rounded-lg bg-amber-500/20 text-amber-300 text-xs font-bold border border-amber-500/30">
                {events.filter((e) => e.status === 'Pending Approval').length} Pending
              </span>
            </div>

            {events.filter((e) => e.status === 'Pending Approval').length === 0 ? (
              <div className="p-8 text-center bg-slate-900/60 rounded-2xl border border-slate-800 text-slate-400 text-xs">
                All events are reviewed. No pending approvals in queue.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {events
                  .filter((e) => e.status === 'Pending Approval')
                  .map((evt) => (
                    <div
                      key={evt._id}
                      className="p-5 rounded-2xl bg-slate-900 border border-amber-500/40 space-y-3"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-amber-500/20 text-amber-300">
                            {evt.category}
                          </span>
                          <h3 className="text-base font-bold text-white mt-1">{evt.title}</h3>
                          <p className="text-xs text-slate-400 mt-0.5">
                            By {evt.organizerName} • {evt.venue}, {evt.city}
                          </p>
                        </div>
                        <span className="text-xs font-bold text-emerald-400">
                          {evt.ticketPrice === 0 ? 'Free' : `$${evt.ticketPrice}`}
                        </span>
                      </div>

                      <p className="text-xs text-slate-300 line-clamp-2">{evt.description}</p>

                      <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleUpdateEventStatus(evt._id, 'Rejected')}
                          disabled={actionLoadingId === evt._id}
                          className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-rose-950/40 hover:bg-rose-900 text-rose-300 border border-rose-500/30 flex items-center gap-1 transition-colors"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          Reject
                        </button>
                        <button
                          onClick={() => handleUpdateEventStatus(evt._id, 'Approved')}
                          disabled={actionLoadingId === evt._id}
                          className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white flex items-center gap-1 transition-colors"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Approve Event
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: ALL EVENTS TABLE */}
      {activeTab === 'events' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-white">Event Catalog Management</h2>
              <p className="text-xs text-slate-400">Approve, reject, or remove platform events</p>
            </div>
            <div className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Search event title or city..."
                value={eventSearch}
                onChange={(e) => setEventSearch(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950 text-slate-400 border-b border-slate-800 uppercase font-semibold text-[10px]">
                  <tr>
                    <th className="p-4">Event Details</th>
                    <th className="p-4">Organizer</th>
                    <th className="p-4">Date & City</th>
                    <th className="p-4">Price</th>
                    <th className="p-4">Capacity</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-right">Moderation Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {events
                    .filter(
                      (e) =>
                        !eventSearch ||
                        e.title.toLowerCase().includes(eventSearch.toLowerCase()) ||
                        e.city.toLowerCase().includes(eventSearch.toLowerCase())
                    )
                    .map((evt) => (
                      <tr key={evt._id} className="hover:bg-slate-800/40">
                        <td className="p-4 font-semibold text-white max-w-[200px]">
                          <div className="truncate">{evt.title}</div>
                          <div className="text-[10px] text-slate-400 font-normal">{evt.category}</div>
                        </td>
                        <td className="p-4 text-slate-300">{evt.organizerName}</td>
                        <td className="p-4">
                          <div>{evt.date}</div>
                          <div className="text-[10px] text-slate-400">{evt.city}</div>
                        </td>
                        <td className="p-4 font-bold text-emerald-400">
                          {evt.ticketPrice === 0 ? 'Free' : `$${evt.ticketPrice}`}
                        </td>
                        <td className="p-4">{evt.capacity} seats</td>
                        <td className="p-4">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                              evt.status === 'Approved'
                                ? 'bg-emerald-500/15 text-emerald-300'
                                : evt.status === 'Pending Approval'
                                ? 'bg-amber-500/15 text-amber-300'
                                : 'bg-rose-500/15 text-rose-400'
                            }`}
                          >
                            {evt.status}
                          </span>
                        </td>
                        <td className="p-4 text-right space-x-2">
                          {evt.status !== 'Approved' && (
                            <button
                              onClick={() => handleUpdateEventStatus(evt._id, 'Approved')}
                              className="px-2.5 py-1 text-[11px] font-bold rounded bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500 hover:text-white"
                            >
                              Approve
                            </button>
                          )}
                          {evt.status !== 'Rejected' && (
                            <button
                              onClick={() => handleUpdateEventStatus(evt._id, 'Rejected')}
                              className="px-2.5 py-1 text-[11px] font-bold rounded bg-amber-500/20 text-amber-300 hover:bg-amber-500 hover:text-slate-950"
                            >
                              Reject
                            </button>
                          )}
                          <button
                            onClick={() => handleDeleteEvent(evt._id, evt.title)}
                            className="p-1 text-rose-400 hover:text-rose-300"
                            title="Delete Event"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: USERS & ORGANIZERS */}
      {activeTab === 'users' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-white">Registered Users & Organizers</h2>
              <p className="text-xs text-slate-400">Manage account access and prevent platform misuse</p>
            </div>
            <div className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Search user name or email..."
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950 text-slate-400 border-b border-slate-800 uppercase font-semibold text-[10px]">
                  <tr>
                    <th className="p-4">User</th>
                    <th className="p-4">Role</th>
                    <th className="p-4">City</th>
                    <th className="p-4">Phone</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-right">Moderation</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {users
                    .filter(
                      (u) =>
                        !userSearch ||
                        u.name.toLowerCase().includes(userSearch.toLowerCase()) ||
                        u.email.toLowerCase().includes(userSearch.toLowerCase())
                    )
                    .map((user) => (
                      <tr key={user._id} className="hover:bg-slate-800/40">
                        <td className="p-4">
                          <div className="font-semibold text-white">{user.name}</div>
                          <div className="text-[11px] text-slate-400">{user.email}</div>
                        </td>
                        <td className="p-4">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                              user.role === 'admin'
                                ? 'bg-amber-500/20 text-amber-300'
                                : user.role === 'organizer'
                                ? 'bg-cyan-500/20 text-cyan-300'
                                : 'bg-indigo-500/20 text-indigo-300'
                            }`}
                          >
                            {user.role}
                          </span>
                        </td>
                        <td className="p-4 text-slate-400">{user.city || 'N/A'}</td>
                        <td className="p-4 text-slate-400">{user.phone || 'N/A'}</td>
                        <td className="p-4">
                          {user.isBlocked ? (
                            <span className="px-2 py-0.5 rounded bg-rose-500/15 text-rose-400 font-bold text-[10px]">
                              Blocked
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-300 font-bold text-[10px]">
                              Active
                            </span>
                          )}
                        </td>
                        <td className="p-4 text-right">
                          {user.role !== 'admin' && (
                            <button
                              onClick={() => handleToggleBlockUser(user)}
                              disabled={actionLoadingId === user._id}
                              className={`px-2.5 py-1 text-[11px] font-bold rounded transition-colors ${
                                user.isBlocked
                                  ? 'bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500 hover:text-white'
                                  : 'bg-rose-500/20 text-rose-300 hover:bg-rose-500 hover:text-white'
                              }`}
                            >
                              {user.isBlocked ? 'Unblock' : 'Block User'}
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: ALL BOOKINGS */}
      {activeTab === 'bookings' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-white">All Platform Bookings</h2>
              <p className="text-xs text-slate-400">Complete audit log of all attendee reservations</p>
            </div>
            <div className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Search booking ID, event..."
                value={bookingSearch}
                onChange={(e) => setBookingSearch(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950 text-slate-400 border-b border-slate-800 uppercase font-semibold text-[10px]">
                  <tr>
                    <th className="p-4">Booking ID</th>
                    <th className="p-4">User</th>
                    <th className="p-4">Event</th>
                    <th className="p-4">Quantity</th>
                    <th className="p-4">Total Paid</th>
                    <th className="p-4">Check-in Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {bookings
                    .filter(
                      (b) =>
                        !bookingSearch ||
                        b.bookingId.toLowerCase().includes(bookingSearch.toLowerCase()) ||
                        b.userName.toLowerCase().includes(bookingSearch.toLowerCase()) ||
                        b.eventTitle.toLowerCase().includes(bookingSearch.toLowerCase())
                    )
                    .map((b) => (
                      <tr key={b._id} className="hover:bg-slate-800/40">
                        <td className="p-4 font-mono font-bold text-cyan-400">{b.bookingId}</td>
                        <td className="p-4">
                          <div className="font-semibold text-white">{b.userName}</div>
                          <div className="text-[11px] text-slate-400">{b.userEmail}</div>
                        </td>
                        <td className="p-4 font-medium text-white">{b.eventTitle}</td>
                        <td className="p-4">{b.quantity}x</td>
                        <td className="p-4 font-bold text-emerald-400">
                          ${b.totalAmount.toFixed(2)}
                        </td>
                        <td className="p-4">
                          {b.checkedIn ? (
                            <span className="px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-300 font-bold text-[10px]">
                              Checked In
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-400 font-bold text-[10px]">
                              Not Checked In
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
