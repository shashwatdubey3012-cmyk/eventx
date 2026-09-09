import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  Calendar,
  PlusCircle,
  Ticket,
  Users,
  BarChart3,
  User,
  LogOut,
  QrCode,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Search,
  Clock,
  MapPin,
  ExternalLink,
  DollarSign,
  TrendingUp,
  Camera,
  Trash2,
  Edit2,
  Scan,
} from 'lucide-react';
import { IUser, IEvent, IBooking } from '../types';
import { api } from '../services/api';

interface OrganizerDashboardProps {
  currentUser: IUser;
  initialTab?: string;
  onLogout: () => void;
  onSelectEventForView?: (event: IEvent) => void;
}

export const OrganizerDashboard: React.FC<OrganizerDashboardProps> = ({
  currentUser,
  initialTab = 'dashboard',
  onLogout,
  onSelectEventForView,
}) => {
  const [activeTab, setActiveTab] = useState<string>(initialTab);
  const [events, setEvents] = useState<IEvent[]>([]);
  const [bookings, setBookings] = useState<IBooking[]>([]);
  const [loading, setLoading] = useState(true);

  // Check-In scanner states
  const [scanInput, setScanInput] = useState('');
  const [checkInResult, setCheckInResult] = useState<{
    status: 'success' | 'already_used' | 'invalid' | null;
    message: string;
    booking?: any;
  } | null>(null);
  const [checkingIn, setCheckingIn] = useState(false);

  // Create event form states
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Technology');
  const [description, setDescription] = useState('');
  const [banner, setBanner] = useState('');
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [venue, setVenue] = useState('');
  const [city, setCity] = useState(currentUser.city || 'Seattle, WA');
  const [location, setLocation] = useState('');
  const [eventType, setEventType] = useState<'In-person' | 'Online' | 'Hybrid'>('In-person');
  const [ticketPrice, setTicketPrice] = useState<number>(49);
  const [capacity, setCapacity] = useState<number>(150);
  const [terms, setTerms] = useState('');
  const [speakerName, setSpeakerName] = useState('');
  const [speakerRole, setSpeakerRole] = useState('');
  const [speakersList, setSpeakersList] = useState<Array<{ name: string; role: string; avatar?: string }>>([]);
  const [scheduleTime, setScheduleTime] = useState('');
  const [scheduleActivity, setScheduleActivity] = useState('');
  const [scheduleList, setScheduleList] = useState<Array<{ time: string; activity: string }>>([]);
  const [submittingEvent, setSubmittingEvent] = useState(false);
  const [formSuccessMessage, setFormSuccessMessage] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  // Search in bookings/attendees
  const [searchTerm, setSearchTerm] = useState('');

  const fetchOrganizerData = async () => {
    setLoading(true);
    try {
      const [eventsRes, bookingsRes] = await Promise.all([
        api.getOrganizerEvents(),
        api.getOrganizerBookings(),
      ]);
      setEvents(eventsRes.events);
      setBookings(bookingsRes.bookings);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrganizerData();
  }, []);

  // Handle Add Speaker
  const handleAddSpeaker = () => {
    if (!speakerName.trim()) return;
    setSpeakersList([
      ...speakersList,
      {
        name: speakerName.trim(),
        role: speakerRole.trim() || 'Speaker',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
      },
    ]);
    setSpeakerName('');
    setSpeakerRole('');
  };

  const handleRemoveSpeaker = (index: number) => {
    setSpeakersList(speakersList.filter((_, i) => i !== index));
  };

  // Handle Add Schedule item
  const handleAddSchedule = () => {
    if (!scheduleTime.trim() || !scheduleActivity.trim()) return;
    setScheduleList([
      ...scheduleList,
      { time: scheduleTime.trim(), activity: scheduleActivity.trim() },
    ]);
    setScheduleTime('');
    setScheduleActivity('');
  };

  const handleRemoveSchedule = (index: number) => {
    setScheduleList(scheduleList.filter((_, i) => i !== index));
  };

  // Submit Event Form (Save Draft vs Publish Event)
  const handleCreateEvent = async (isDraft: boolean) => {
    setFormError(null);
    setFormSuccessMessage(null);

    if (!isDraft && (!title.trim() || !date || !startTime || !venue.trim())) {
      setFormError('Please fill in Event Title, Date, Start Time, and Venue');
      return;
    }

    setSubmittingEvent(true);
    try {
      const res = await api.createEvent({
        title: title || 'Untitled Draft Event',
        category,
        description,
        banner:
          banner ||
          'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1200&q=80',
        date: date || new Date().toISOString().split('T')[0],
        startTime: startTime || '10:00',
        endTime,
        venue: venue || 'TBD',
        city,
        location: location || venue,
        eventType,
        ticketPrice: Number(ticketPrice) || 0,
        capacity: Number(capacity) || 100,
        speakers: speakersList,
        schedule: scheduleList,
        terms,
        isDraft,
      });

      setFormSuccessMessage(res.message);
      await fetchOrganizerData();

      // Reset form if published
      if (!isDraft) {
        setTitle('');
        setDescription('');
        setBanner('');
        setDate('');
        setStartTime('');
        setEndTime('');
        setVenue('');
        setLocation('');
        setSpeakersList([]);
        setScheduleList([]);
      }
    } catch (err: any) {
      setFormError(err.message || 'Failed to submit event');
    } finally {
      setSubmittingEvent(false);
    }
  };

  // Handle QR Check-in scan / lookup
  const handleCheckIn = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!scanInput.trim()) return;

    setCheckingIn(true);
    setCheckInResult(null);

    try {
      const res = await api.checkInAttendee({ scanData: scanInput.trim() });
      setCheckInResult(res);
      await fetchOrganizerData();
    } catch (err: any) {
      setCheckInResult({
        status: 'invalid',
        message: err.message || '✕ Invalid Ticket',
      });
    } finally {
      setCheckingIn(false);
    }
  };

  // Delete event
  const handleDeleteEvent = async (id: string, eventTitle: string) => {
    if (!window.confirm(`Are you sure you want to delete "${eventTitle}"?`)) return;
    try {
      await api.deleteEvent(id);
      await fetchOrganizerData();
    } catch (err: any) {
      alert(err.message || 'Failed to delete event');
    }
  };

  // Stats calculation
  const totalEvents = events.length;
  const todayStr = new Date().toISOString().split('T')[0];
  const upcomingEvents = events.filter((e) => e.date >= todayStr).length;
  const totalRegistrations = bookings
    .filter((b) => b.bookingStatus === 'confirmed')
    .reduce((sum, b) => sum + b.quantity, 0);
  const totalRevenue = bookings
    .filter((b) => b.bookingStatus === 'confirmed')
    .reduce((sum, b) => sum + b.subtotal, 0);

  const categories = [
    'Technology',
    'Music',
    'Sports',
    'Education',
    'Business',
    'Workshops',
    'Cultural',
    'Entertainment',
    'College Events',
    'Conferences',
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col md:flex-row gap-8 min-h-[85vh]">
      {/* Sidebar Navigation */}
      <aside className="w-full md:w-64 shrink-0 space-y-6">
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
          <div className="flex items-center gap-3">
            <img
              src={
                currentUser.profileImage ||
                'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=150&q=80'
              }
              alt={currentUser.name}
              className="w-12 h-12 rounded-xl object-cover ring-1 ring-slate-700"
            />
            <div className="min-w-0">
              <div className="text-sm font-bold text-white truncate">{currentUser.name}</div>
              <div className="text-[11px] text-cyan-400 font-semibold">Event Organizer</div>
            </div>
          </div>
        </div>

        <nav className="p-2 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-colors ${
              activeTab === 'dashboard'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            Dashboard
          </button>

          <button
            onClick={() => setActiveTab('events')}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-colors ${
              activeTab === 'events'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Calendar className="w-4 h-4" />
            My Events ({events.length})
          </button>

          <button
            onClick={() => setActiveTab('create')}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-colors ${
              activeTab === 'create'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <PlusCircle className="w-4 h-4" />
            Create Event
          </button>

          <button
            onClick={() => setActiveTab('check-in')}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-colors ${
              activeTab === 'check-in'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Scan className="w-4 h-4 text-cyan-400" />
            Attendee Check-In
          </button>

          <button
            onClick={() => setActiveTab('bookings')}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-colors ${
              activeTab === 'bookings'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Ticket className="w-4 h-4" />
            Bookings & Passes
          </button>

          <button
            onClick={() => setActiveTab('attendees')}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-colors ${
              activeTab === 'attendees'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Users className="w-4 h-4" />
            Attendees List
          </button>

          <button
            onClick={() => setActiveTab('analytics')}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-colors ${
              activeTab === 'analytics'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            Analytics
          </button>

          <div className="pt-2 border-t border-slate-800">
            <button
              onClick={onLogout}
              className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-rose-400 hover:bg-rose-950/30 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        </nav>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 min-w-0 space-y-6">
        {/* TAB 1: DASHBOARD OVERVIEW */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-bold text-white tracking-tight">Organizer Dashboard</h1>
              <p className="text-xs text-slate-400">
                Track event reach, ticket sales, revenue and attendee check-in rates
              </p>
            </div>

            {/* Top 4 Stats Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-sm">
                <div className="flex items-center justify-between text-xs font-semibold text-slate-400">
                  <span>Total Events</span>
                  <Calendar className="w-4 h-4 text-indigo-400" />
                </div>
                <div className="text-2xl font-extrabold text-white mt-2">{totalEvents}</div>
                <div className="text-[11px] text-slate-500 mt-0.5">Published & pending</div>
              </div>

              <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-sm">
                <div className="flex items-center justify-between text-xs font-semibold text-slate-400">
                  <span>Upcoming Events</span>
                  <Clock className="w-4 h-4 text-cyan-400" />
                </div>
                <div className="text-2xl font-extrabold text-white mt-2">{upcomingEvents}</div>
                <div className="text-[11px] text-slate-500 mt-0.5">Scheduled forward</div>
              </div>

              <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-sm">
                <div className="flex items-center justify-between text-xs font-semibold text-slate-400">
                  <span>Total Registrations</span>
                  <Users className="w-4 h-4 text-emerald-400" />
                </div>
                <div className="text-2xl font-extrabold text-white mt-2">{totalRegistrations}</div>
                <div className="text-[11px] text-slate-500 mt-0.5">Tickets sold/reserved</div>
              </div>

              <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-sm">
                <div className="flex items-center justify-between text-xs font-semibold text-slate-400">
                  <span>Total Revenue</span>
                  <DollarSign className="w-4 h-4 text-amber-400" />
                </div>
                <div className="text-2xl font-extrabold text-white mt-2">
                  ${totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5">Gross ticket earnings</div>
              </div>
            </div>

            {/* Quick Check-In Banner */}
            <div className="p-5 rounded-2xl bg-gradient-to-r from-indigo-950/60 to-slate-900 border border-indigo-500/30 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-cyan-500/20 text-cyan-300">
                  <Scan className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Live Event Check-in Station</h3>
                  <p className="text-xs text-slate-400">
                    Scan attendee QR codes or enter booking IDs for immediate check-in validation.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setActiveTab('check-in')}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-cyan-500 hover:bg-cyan-400 text-slate-950 shrink-0 transition-colors shadow-md"
              >
                Launch Scanner
              </button>
            </div>

            {/* Visual Overview Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Registration Trends */}
              <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-white">Registrations Over Time</h3>
                  <span className="text-[11px] text-indigo-400 font-semibold">Weekly View</span>
                </div>
                <div className="h-44 flex items-end justify-between gap-3 pt-4 px-2">
                  {[
                    { label: 'Mon', val: 32 },
                    { label: 'Tue', val: 54 },
                    { label: 'Wed', val: 78 },
                    { label: 'Thu', val: 95 },
                    { label: 'Fri', val: 140 },
                    { label: 'Sat', val: 190 },
                    { label: 'Sun', val: 165 },
                  ].map((d) => (
                    <div key={d.label} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
                      <div
                        style={{ height: `${(d.val / 200) * 100}%` }}
                        className="w-full rounded-t-lg bg-gradient-to-t from-indigo-600 to-cyan-400 hover:opacity-90 transition-all cursor-pointer"
                        title={`${d.val} registrations`}
                      />
                      <span className="text-[10px] text-slate-400">{d.label}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Event Popularity */}
              <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-white">Event Capacity & Popularity</h3>
                  <span className="text-[11px] text-emerald-400 font-semibold">Active Events</span>
                </div>
                <div className="space-y-3 pt-2">
                  {events.slice(0, 4).map((evt) => {
                    const booked = evt.capacity - evt.availableSeats;
                    const pct = Math.round((booked / evt.capacity) * 100);
                    return (
                      <div key={evt._id} className="space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-semibold text-slate-200 truncate max-w-[200px]">
                            {evt.title}
                          </span>
                          <span className="text-slate-400">
                            {booked} / {evt.capacity} ({pct}%)
                          </span>
                        </div>
                        <div className="h-2 w-full rounded-full bg-slate-950 overflow-hidden">
                          <div
                            style={{ width: `${pct}%` }}
                            className="h-full bg-gradient-to-r from-indigo-500 to-cyan-400 rounded-full"
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: MY EVENTS */}
        {activeTab === 'events' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold text-white tracking-tight">My Events</h1>
                <p className="text-xs text-slate-400">
                  Manage event listings, review attendee counts, and modify details
                </p>
              </div>
              <button
                onClick={() => setActiveTab('create')}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white flex items-center gap-1.5 transition-colors"
              >
                <PlusCircle className="w-4 h-4" />
                Create New Event
              </button>
            </div>

            {events.length === 0 ? (
              <div className="p-12 text-center bg-slate-900 rounded-2xl border border-slate-800 space-y-3">
                <Calendar className="w-10 h-10 text-slate-600 mx-auto" />
                <h3 className="text-base font-semibold text-white">No events created yet</h3>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  Click the button below to publish your first summit, concert, or masterclass.
                </p>
                <button
                  onClick={() => setActiveTab('create')}
                  className="px-4 py-2 text-xs font-semibold rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white"
                >
                  Create Event
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {events.map((evt) => (
                  <div
                    key={evt._id}
                    className="p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <span
                            className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded ${
                              evt.status === 'Approved'
                                ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                                : evt.status === 'Pending Approval'
                                ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                                : 'bg-slate-800 text-slate-400'
                            }`}
                          >
                            {evt.status}
                          </span>
                          <h3 className="text-base font-bold text-white mt-1.5 line-clamp-1">
                            {evt.title}
                          </h3>
                        </div>
                        <span className="text-xs font-bold text-emerald-400 shrink-0">
                          {evt.ticketPrice === 0 ? 'Free' : `$${evt.ticketPrice}`}
                        </span>
                      </div>

                      <div className="mt-3 space-y-1 text-xs text-slate-400">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-indigo-400" />
                          <span>{evt.date} at {evt.startTime}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-indigo-400" />
                          <span className="truncate">{evt.venue}, {evt.city}</span>
                        </div>
                      </div>

                      <div className="mt-4 p-3 rounded-xl bg-slate-950 text-xs flex justify-between">
                        <div>
                          <span className="text-slate-500">Reserved Seats: </span>
                          <span className="font-bold text-white">
                            {evt.capacity - evt.availableSeats} / {evt.capacity}
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-500">Checked In: </span>
                          <span className="font-bold text-cyan-400">
                            {evt.checkedInCount || 0}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-5 pt-4 border-t border-slate-800 flex items-center justify-between">
                      {onSelectEventForView && (
                        <button
                          onClick={() => onSelectEventForView(evt)}
                          className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold"
                        >
                          View Public Page
                        </button>
                      )}
                      <button
                        onClick={() => handleDeleteEvent(evt._id, evt.title)}
                        className="text-xs text-rose-400 hover:text-rose-300 flex items-center gap-1 p-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: CREATE EVENT */}
        {activeTab === 'create' && (
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-bold text-white tracking-tight">Create Event</h1>
              <p className="text-xs text-slate-400">
                Submit an event for community discovery. New events are marked "Pending Approval"
                until verified by administrators.
              </p>
            </div>

            {formSuccessMessage && (
              <div className="p-4 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                {formSuccessMessage}
              </div>
            )}

            {formError && (
              <div className="p-4 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs">
                {formError}
              </div>
            )}

            <div className="p-6 sm:p-8 rounded-2xl bg-slate-900 border border-slate-800 space-y-6">
              {/* Event Title */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Event Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Autonomous AI Summit 2026"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>

              {/* Category & Event Type */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Category *
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
                  >
                    {categories.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Event Type (Online / Offline) *
                  </label>
                  <select
                    value={eventType}
                    onChange={(e) => setEventType(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="In-person">In-person</option>
                    <option value="Online">Online</option>
                    <option value="Hybrid">Hybrid</option>
                  </select>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Event Description
                </label>
                <textarea
                  rows={4}
                  placeholder="Provide an overview of the agenda, keynote topics, workshops, and why attendees should join..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>

              {/* Banner Image URL */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Event Banner Image URL
                </label>
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/photo-1540575467063-178a50c2df87..."
                  value={banner}
                  onChange={(e) => setBanner(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
                <span className="text-[10px] text-slate-500 mt-1 block">
                  Leave blank to use an automatic high-resolution theme banner
                </span>
              </div>

              {/* Date & Times */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Start Time *
                  </label>
                  <input
                    type="time"
                    required
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    End Time
                  </label>
                  <input
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              {/* Venue, City & Google Maps location */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Venue *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Moscone Convention Center"
                    value={venue}
                    onChange={(e) => setVenue(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    City *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. San Francisco, CA"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Google Maps Location / URL
                  </label>
                  <input
                    type="text"
                    placeholder="747 Howard St, San Francisco"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              {/* Pricing & Capacity */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Ticket Price ($ USD) (Enter 0 for Free)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={ticketPrice}
                    onChange={(e) => setTicketPrice(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Maximum Capacity (Seats)
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={capacity}
                    onChange={(e) => setCapacity(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              {/* Speakers & Schedule Builders */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 border-t border-slate-800">
                {/* Speakers */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Event Speakers & Performers
                  </label>
                  <div className="flex gap-2 mb-2">
                    <input
                      type="text"
                      placeholder="Speaker Name"
                      value={speakerName}
                      onChange={(e) => setSpeakerName(e.target.value)}
                      className="flex-1 px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
                    />
                    <input
                      type="text"
                      placeholder="Title/Role"
                      value={speakerRole}
                      onChange={(e) => setSpeakerRole(e.target.value)}
                      className="flex-1 px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
                    />
                    <button
                      type="button"
                      onClick={handleAddSpeaker}
                      className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold"
                    >
                      Add
                    </button>
                  </div>

                  {speakersList.length > 0 && (
                    <div className="space-y-1.5 max-h-32 overflow-y-auto">
                      {speakersList.map((spk, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between p-2 rounded-lg bg-slate-950 text-xs"
                        >
                          <span className="text-white font-medium">
                            {spk.name} ({spk.role})
                          </span>
                          <button
                            type="button"
                            onClick={() => handleRemoveSpeaker(idx)}
                            className="text-rose-400 hover:text-rose-300"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Schedule */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Event Schedule / Timeline
                  </label>
                  <div className="flex gap-2 mb-2">
                    <input
                      type="text"
                      placeholder="Time (e.g. 10:00 AM)"
                      value={scheduleTime}
                      onChange={(e) => setScheduleTime(e.target.value)}
                      className="w-1/3 px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
                    />
                    <input
                      type="text"
                      placeholder="Activity Description"
                      value={scheduleActivity}
                      onChange={(e) => setScheduleActivity(e.target.value)}
                      className="flex-1 px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
                    />
                    <button
                      type="button"
                      onClick={handleAddSchedule}
                      className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold"
                    >
                      Add
                    </button>
                  </div>

                  {scheduleList.length > 0 && (
                    <div className="space-y-1.5 max-h-32 overflow-y-auto">
                      {scheduleList.map((item, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between p-2 rounded-lg bg-slate-950 text-xs"
                        >
                          <span className="text-cyan-400 font-bold mr-2">{item.time}</span>
                          <span className="text-white flex-1 truncate">{item.activity}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveSchedule(idx)}
                            className="text-rose-400 hover:text-rose-300"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Terms & Conditions */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Terms and Conditions
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Government ID required. Non-refundable 48 hours prior to start."
                  value={terms}
                  onChange={(e) => setTerms(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>

              {/* Action buttons */}
              <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => handleCreateEvent(true)}
                  disabled={submittingEvent}
                  className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors disabled:opacity-50"
                >
                  Save Draft
                </button>
                <button
                  type="button"
                  onClick={() => handleCreateEvent(false)}
                  disabled={submittingEvent}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-600 hover:opacity-95 text-white text-xs font-bold shadow-lg shadow-indigo-600/20 transition-all disabled:opacity-50"
                >
                  {submittingEvent ? 'Submitting...' : 'Publish Event'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: ATTENDEE CHECK-IN SCANNER */}
        {activeTab === 'check-in' && (
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-bold text-white tracking-tight">Attendee QR Check-in</h1>
              <p className="text-xs text-slate-400">
                Scan attendee digital pass QR codes or verify ticket booking IDs at the door
              </p>
            </div>

            <div className="p-6 sm:p-8 rounded-2xl bg-slate-900 border border-slate-800 space-y-6 max-w-2xl">
              {/* Scan / Manual input form */}
              <form onSubmit={handleCheckIn} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Scan QR Payload or Enter Booking ID (e.g. EVX-2026-8F72K)
                  </label>
                  <div className="relative">
                    <QrCode className="w-4 h-4 text-cyan-400 absolute left-3 top-3.5" />
                    <input
                      type="text"
                      required
                      placeholder="EVX-2026-8F72K or paste QR payload"
                      value={scanInput}
                      onChange={(e) => setScanInput(e.target.value)}
                      className="w-full pl-9 pr-24 py-3 bg-slate-950 border border-slate-800 rounded-xl text-sm font-mono text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
                    />
                    <button
                      type="submit"
                      disabled={checkingIn}
                      className="absolute right-1.5 top-1.5 bottom-1.5 px-4 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold transition-colors disabled:opacity-50"
                    >
                      {checkingIn ? 'Checking...' : 'Check In'}
                    </button>
                  </div>
                </div>
              </form>

              {/* Check-in Outcome Display */}
              {checkInResult && (
                <div
                  className={`p-6 rounded-2xl border-2 transition-all animate-in fade-in zoom-in-95 duration-150 ${
                    checkInResult.status === 'success'
                      ? 'bg-emerald-950/40 border-emerald-500/80 text-emerald-200'
                      : checkInResult.status === 'already_used'
                      ? 'bg-amber-950/40 border-amber-500/80 text-amber-200'
                      : 'bg-rose-950/40 border-rose-500/80 text-rose-200'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {checkInResult.status === 'success' && (
                      <CheckCircle2 className="w-8 h-8 text-emerald-400 shrink-0" />
                    )}
                    {checkInResult.status === 'already_used' && (
                      <AlertTriangle className="w-8 h-8 text-amber-400 shrink-0" />
                    )}
                    {checkInResult.status === 'invalid' && (
                      <XCircle className="w-8 h-8 text-rose-400 shrink-0" />
                    )}
                    <div>
                      <h3 className="text-lg font-extrabold tracking-tight">
                        {checkInResult.message}
                      </h3>
                      {checkInResult.status === 'already_used' && (
                        <p className="text-xs text-amber-300 mt-0.5">
                          This ticket was previously checked in on{' '}
                          {checkInResult.booking?.checkedInAt
                            ? new Date(checkInResult.booking.checkedInAt).toLocaleTimeString()
                            : 'record'}
                          . Cannot check in twice.
                        </p>
                      )}
                    </div>
                  </div>

                  {checkInResult.booking && (
                    <div className="mt-4 pt-4 border-t border-slate-700/60 grid grid-cols-2 gap-3 text-xs">
                      <div>
                        <span className="text-slate-400 block">Participant:</span>
                        <span className="font-bold text-white text-sm">
                          {checkInResult.booking.participantName}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400 block">Booking ID:</span>
                        <span className="font-mono font-bold text-cyan-300">
                          {checkInResult.booking.bookingId}
                        </span>
                      </div>
                      <div className="col-span-2">
                        <span className="text-slate-400 block">Event:</span>
                        <span className="font-semibold text-white">
                          {checkInResult.booking.event}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400 block">Pass Type:</span>
                        <span className="font-semibold text-white">
                          {checkInResult.booking.ticketType} ({checkInResult.booking.quantity}x)
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Sample Tickets for Testing */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs space-y-2">
                <span className="font-bold text-slate-300 block">Quick Test Booking IDs:</span>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => setScanInput('EVX-2026-8F72K')}
                    className="px-2.5 py-1 rounded bg-slate-900 border border-slate-700 font-mono text-cyan-300 hover:border-cyan-400"
                  >
                    EVX-2026-8F72K (Valid Seed Booking)
                  </button>
                  <button
                    type="button"
                    onClick={() => setScanInput('INVALID-TICKET-999')}
                    className="px-2.5 py-1 rounded bg-slate-900 border border-slate-700 font-mono text-rose-300 hover:border-rose-400"
                  >
                    INVALID-TICKET-999 (Test Invalid)
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 5 & 6: BOOKINGS & ATTENDEES */}
        {(activeTab === 'bookings' || activeTab === 'attendees') && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold text-white tracking-tight">
                  {activeTab === 'attendees' ? 'Registered Attendees' : 'Bookings & Transactions'}
                </h1>
                <p className="text-xs text-slate-400">
                  Total of {bookings.length} reservations across your events
                </p>
              </div>

              {/* Search Bar */}
              <div className="relative w-full sm:w-64">
                <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-3" />
                <input
                  type="text"
                  placeholder="Search attendee or ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-950/80 text-slate-400 border-b border-slate-800 uppercase font-semibold text-[10px] tracking-wider">
                    <tr>
                      <th className="p-4">Booking ID</th>
                      <th className="p-4">Participant</th>
                      <th className="p-4">Event</th>
                      <th className="p-4">Quantity</th>
                      <th className="p-4">Total</th>
                      <th className="p-4">Check-in Status</th>
                      <th className="p-4">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {bookings
                      .filter(
                        (b) =>
                          !searchTerm ||
                          b.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          b.bookingId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          b.eventTitle.toLowerCase().includes(searchTerm.toLowerCase())
                      )
                      .map((b) => (
                        <tr key={b._id} className="hover:bg-slate-800/40 transition-colors">
                          <td className="p-4 font-mono font-bold text-cyan-400">{b.bookingId}</td>
                          <td className="p-4">
                            <div className="font-semibold text-white">{b.userName}</div>
                            <div className="text-[11px] text-slate-400">{b.userEmail}</div>
                          </td>
                          <td className="p-4 font-medium text-slate-200 truncate max-w-[180px]">
                            {b.eventTitle}
                          </td>
                          <td className="p-4">{b.quantity}x</td>
                          <td className="p-4 font-semibold text-emerald-400">
                            ${b.totalAmount.toFixed(2)}
                          </td>
                          <td className="p-4">
                            {b.checkedIn ? (
                              <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 font-bold text-[10px]">
                                ✓ Checked In
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded-full bg-indigo-500/15 text-indigo-300 font-bold text-[10px]">
                                Ready
                              </span>
                            )}
                          </td>
                          <td className="p-4">
                            {!b.checkedIn && (
                              <button
                                onClick={async () => {
                                  setScanInput(b.bookingId);
                                  setActiveTab('check-in');
                                }}
                                className="px-2.5 py-1 text-[11px] font-bold rounded bg-cyan-500/20 text-cyan-300 hover:bg-cyan-500 hover:text-slate-950 transition-colors"
                              >
                                Check In
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

        {/* TAB 7: ANALYTICS */}
        {activeTab === 'analytics' && (
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-bold text-white tracking-tight">Event Analytics</h1>
              <p className="text-xs text-slate-400">
                Detailed performance metrics and revenue distribution
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
                <h3 className="text-sm font-bold text-white">Monthly Revenue Breakdown</h3>
                <div className="space-y-3 pt-2">
                  {[
                    { month: 'September 2026', rev: 4900, pct: 40 },
                    { month: 'October 2026', rev: 8900, pct: 75 },
                    { month: 'November 2026', rev: 11400, pct: 95 },
                  ].map((m) => (
                    <div key={m.month} className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="font-semibold text-slate-200">{m.month}</span>
                        <span className="font-bold text-emerald-400">${m.rev}</span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-slate-950">
                        <div
                          style={{ width: `${m.pct}%` }}
                          className="h-full bg-gradient-to-r from-indigo-500 to-cyan-400 rounded-full"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
                <h3 className="text-sm font-bold text-white">Attendee Check-In Efficiency</h3>
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800/80 text-center space-y-2">
                  <div className="text-3xl font-extrabold text-cyan-400">92%</div>
                  <div className="text-xs text-slate-300 font-semibold">Average Attendance Rate</div>
                  <p className="text-[11px] text-slate-500">
                    High turn-out rate across tech, musical, and business conference events.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
