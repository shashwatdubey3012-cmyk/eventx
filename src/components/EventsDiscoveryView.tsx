import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  SlidersHorizontal,
  Calendar,
  DollarSign,
  MapPin,
  RotateCcw,
  Sparkles,
} from 'lucide-react';
import { IEvent } from '../types';
import { EventCard } from './EventCard';

interface EventsDiscoveryViewProps {
  events: IEvent[];
  initialCategory?: string;
  initialSearch?: string;
  onSelectEvent: (event: IEvent) => void;
  onQuickBook: (event: IEvent) => void;
}

export const EventsDiscoveryView: React.FC<EventsDiscoveryViewProps> = ({
  events,
  initialCategory = 'All',
  initialSearch = '',
  onSelectEvent,
  onQuickBook,
}) => {
  const [search, setSearch] = useState(initialSearch);
  const [category, setCategory] = useState(initialCategory);
  const [dateFilter, setDateFilter] = useState<'All' | 'Today' | 'Weekend' | 'Month' | 'Custom'>('All');
  const [customDate, setCustomDate] = useState('');
  const [cityFilter, setCityFilter] = useState('All');
  const [priceFilter, setPriceFilter] = useState<'All' | 'Free' | 'Paid'>('All');
  const [maxPrice, setMaxPrice] = useState<number>(300);
  const [eventTypeFilter, setEventTypeFilter] = useState<'All' | 'In-person' | 'Online' | 'Hybrid'>('All');
  const [sortBy, setSortBy] = useState<'date' | 'price-asc' | 'price-desc' | 'popularity'>('date');
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // Extract unique cities
  const uniqueCities = useMemo(() => {
    const set = new Set(events.map((e) => e.city).filter(Boolean));
    return ['All', ...Array.from(set)];
  }, [events]);

  const categories = [
    'All',
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

  const resetFilters = () => {
    setSearch('');
    setCategory('All');
    setDateFilter('All');
    setCustomDate('');
    setCityFilter('All');
    setPriceFilter('All');
    setMaxPrice(300);
    setEventTypeFilter('All');
    setSortBy('date');
  };

  // Filter and Sort Logic
  const filteredEvents = useMemo(() => {
    return events
      .filter((e) => {
        // Search
        if (search.trim()) {
          const q = search.toLowerCase();
          const matchTitle = e.title.toLowerCase().includes(q);
          const matchCity = e.city.toLowerCase().includes(q);
          const matchCat = e.category.toLowerCase().includes(q);
          const matchVenue = e.venue.toLowerCase().includes(q);
          if (!matchTitle && !matchCity && !matchCat && !matchVenue) return false;
        }

        // Category
        if (category !== 'All' && e.category.toLowerCase() !== category.toLowerCase()) {
          return false;
        }

        // City
        if (cityFilter !== 'All' && e.city.toLowerCase() !== cityFilter.toLowerCase()) {
          return false;
        }

        // Event Type
        if (eventTypeFilter !== 'All' && e.eventType !== eventTypeFilter) {
          return false;
        }

        // Price
        if (priceFilter === 'Free' && e.ticketPrice > 0) return false;
        if (priceFilter === 'Paid' && e.ticketPrice === 0) return false;
        if (e.ticketPrice > maxPrice) return false;

        // Date
        const today = new Date();
        const eventDate = new Date(e.date);

        if (dateFilter === 'Today') {
          const todayStr = today.toISOString().split('T')[0];
          if (e.date !== todayStr) return false;
        } else if (dateFilter === 'Weekend') {
          const day = eventDate.getDay();
          // Saturday (6) or Sunday (0)
          if (day !== 0 && day !== 6) return false;
        } else if (dateFilter === 'Month') {
          if (
            eventDate.getMonth() !== today.getMonth() ||
            eventDate.getFullYear() !== today.getFullYear()
          ) {
            return false;
          }
        } else if (dateFilter === 'Custom' && customDate) {
          if (e.date !== customDate) return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'date') {
          return new Date(a.date).getTime() - new Date(b.date).getTime();
        }
        if (sortBy === 'price-asc') {
          return a.ticketPrice - b.ticketPrice;
        }
        if (sortBy === 'price-desc') {
          return b.ticketPrice - a.ticketPrice;
        }
        if (sortBy === 'popularity') {
          // based on booked count = capacity - availableSeats
          const bookedA = a.capacity - a.availableSeats;
          const bookedB = b.capacity - b.availableSeats;
          return bookedB - bookedA;
        }
        return 0;
      });
  }, [
    events,
    search,
    category,
    cityFilter,
    eventTypeFilter,
    priceFilter,
    maxPrice,
    dateFilter,
    customDate,
    sortBy,
  ]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Discover Events
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Showing {filteredEvents.length} of {events.length} active events
          </p>
        </div>

        {/* Search bar & Mobile filter button */}
        <div className="flex items-center gap-2.5">
          <div className="relative flex-1 sm:w-80">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search title, venue, city..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
            />
          </div>

          <button
            onClick={() => setShowMobileFilters(!showMobileFilters)}
            className="md:hidden p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white"
          >
            <SlidersHorizontal className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Layout: Filters sidebar + Results grid */}
      <div className="flex flex-col md:flex-row gap-8 items-start">
        {/* Filter Sidebar */}
        <aside
          className={`w-full md:w-72 shrink-0 space-y-6 ${
            showMobileFilters ? 'block' : 'hidden md:block'
          }`}
        >
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-white">
                <Filter className="w-3.5 h-3.5 text-cyan-400" />
                Filters
              </div>
              <button
                onClick={resetFilters}
                className="text-[11px] text-slate-400 hover:text-cyan-300 flex items-center gap-1 font-semibold"
              >
                <RotateCcw className="w-3 h-3" /> Reset
              </button>
            </div>

            {/* Category Filter */}
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-2">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-500"
              >
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            {/* Date Filter */}
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-2">Date</label>
              <div className="grid grid-cols-2 gap-1.5 mb-2">
                {[
                  { id: 'All', label: 'Any Date' },
                  { id: 'Today', label: 'Today' },
                  { id: 'Weekend', label: 'This Weekend' },
                  { id: 'Month', label: 'This Month' },
                ].map((d) => (
                  <button
                    key={d.id}
                    type="button"
                    onClick={() => setDateFilter(d.id as any)}
                    className={`py-1.5 px-2 rounded-lg text-xs font-semibold transition-colors ${
                      dateFilter === d.id
                        ? 'bg-cyan-500 text-slate-950 shadow-sm font-bold'
                        : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                    }`}
                  >
                    {d.label}
                  </button>
                ))}
              </div>

              {dateFilter === 'Custom' || dateFilter === 'All' ? (
                <input
                  type="date"
                  value={customDate}
                  onChange={(e) => {
                    setCustomDate(e.target.value);
                    setDateFilter('Custom');
                  }}
                  className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-300 focus:outline-none focus:border-cyan-500 mt-1"
                />
              ) : null}
            </div>

            {/* Location / City Filter */}
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-2">City / Location</label>
              <select
                value={cityFilter}
                onChange={(e) => setCityFilter(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-500"
              >
                {uniqueCities.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            {/* Event Type (Online / Offline) */}
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-2">Format</label>
              <div className="grid grid-cols-2 gap-1.5">
                {['All', 'In-person', 'Online', 'Hybrid'].map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setEventTypeFilter(type as any)}
                    className={`py-1.5 px-2 rounded-lg text-xs font-semibold transition-colors ${
                      eventTypeFilter === type
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            {/* Price Filter & Range */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold text-slate-300">Price Range</label>
                <span className="text-xs font-semibold text-emerald-400">Up to ${maxPrice}</span>
              </div>

              <div className="flex gap-2 mb-3">
                {['All', 'Free', 'Paid'].map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPriceFilter(p as any)}
                    className={`flex-1 py-1 text-xs font-semibold rounded-lg transition-colors ${
                      priceFilter === p
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                        : 'bg-slate-950 text-slate-400 border border-slate-800'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>

              <input
                type="range"
                min="0"
                max="500"
                step="10"
                value={maxPrice}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
                className="w-full accent-cyan-400 cursor-pointer"
              />
            </div>
          </div>
        </aside>

        {/* Results section */}
        <main className="flex-1 min-w-0 space-y-6">
          {/* Sorting and result count bar */}
          <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
            <div className="text-slate-400">
              Found <span className="font-bold text-white">{filteredEvents.length}</span> matching events
            </div>

            <div className="flex items-center gap-2 self-end sm:self-auto">
              <span className="text-slate-400 font-medium">Sort By:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-500"
              >
                <option value="date">Date (Earliest First)</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="popularity">Popularity / Most Booked</option>
              </select>
            </div>
          </div>

          {/* Cards Grid */}
          {filteredEvents.length === 0 ? (
            <div className="p-12 text-center rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
              <Search className="w-10 h-10 text-slate-600 mx-auto" />
              <h3 className="text-base font-bold text-white">No matching events found</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Try adjusting your category, date, or city filters to discover more experiences.
              </p>
              <button
                onClick={resetFilters}
                className="px-4 py-2 text-xs font-semibold rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white"
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredEvents.map((evt) => (
                <EventCard
                  key={evt._id}
                  event={evt}
                  onSelectEvent={onSelectEvent}
                  onQuickBook={onQuickBook}
                />
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};
