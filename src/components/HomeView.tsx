import React, { useState } from 'react';
import {
  Search,
  Calendar,
  MapPin,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  QrCode,
  Zap,
  TrendingUp,
  Award,
  Globe2,
  Ticket,
  Users,
  Compass,
  CheckCircle2,
} from 'lucide-react';
import { IEvent } from '../types';
import { EventCard } from './EventCard';

interface HomeViewProps {
  events: IEvent[];
  onSelectEvent: (event: IEvent) => void;
  onQuickBook: (event: IEvent) => void;
  onExploreEvents: () => void;
  onCreateEventClick: () => void;
  onCategoryClick: (category: string) => void;
  onSearchSubmit: (query: string) => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  events,
  onSelectEvent,
  onQuickBook,
  onExploreEvents,
  onCreateEventClick,
  onCategoryClick,
  onSearchSubmit,
}) => {
  const [searchInput, setSearchInput] = useState('');
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim()) {
      onSearchSubmit(searchInput.trim());
    } else {
      onExploreEvents();
    }
  };

  const handleNewsletter = (e: React.FormEvent) => {
    e.preventDefault();
    if (newsletterEmail) {
      setSubscribed(true);
      setNewsletterEmail('');
      setTimeout(() => setSubscribed(false), 4000);
    }
  };

  const categories = [
    { name: 'Technology', icon: '💻', count: '140+ events' },
    { name: 'Music', icon: '🎵', count: '85+ events' },
    { name: 'Sports', icon: '🏆', count: '62+ events' },
    { name: 'Education', icon: '📚', count: '94+ events' },
    { name: 'Business', icon: '💼', count: '110+ events' },
    { name: 'Workshops', icon: '🛠️', count: '75+ events' },
    { name: 'Cultural', icon: '🎭', count: '48+ events' },
    { name: 'Entertainment', icon: '✨', count: '90+ events' },
    { name: 'College Events', icon: '🎓', count: '55+ events' },
    { name: 'Conferences', icon: '🎤', count: '130+ events' },
  ];

  const featuredEvents = events.slice(0, 3);
  const upcomingEvents = events.slice(1, 7);

  return (
    <div className="space-y-20 pb-16">
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden pt-12 pb-20 sm:pt-16 sm:pb-24 border-b border-slate-800/80">
        {/* Background glow effects */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-indigo-600/15 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute top-1/3 right-1/4 w-[400px] h-[250px] bg-cyan-500/10 blur-[100px] rounded-full pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900 border border-slate-800 text-xs font-semibold text-cyan-300 shadow-inner">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>Discover & Book Handcrafted Experiences</span>
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold text-white tracking-tight leading-[1.1] max-w-4xl mx-auto font-['Space_Grotesk',sans-serif]">
            Unforgettable Gatherings,{' '}
            <span className="bg-gradient-to-r from-cyan-400 via-indigo-300 to-indigo-500 bg-clip-text text-transparent">
              Engineered for Connection.
            </span>
          </h1>

          <p className="text-base sm:text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed">
            The premier modern platform for tech summits, electronic festivals, business conferences,
            and creative workshops. Instant QR passes with real-time gate check-ins.
          </p>

          {/* Interactive Search Bar */}
          <form
            onSubmit={handleSearch}
            className="max-w-2xl mx-auto p-2 bg-slate-900/90 backdrop-blur-xl border border-slate-800 rounded-2xl shadow-2xl flex flex-col sm:flex-row items-center gap-2"
          >
            <div className="relative flex-1 w-full flex items-center">
              <Search className="w-4 h-4 text-slate-500 absolute left-3.5" />
              <input
                type="text"
                placeholder="Search event name, tech, music, or city..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="w-full pl-10 pr-3 py-2.5 bg-transparent text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none"
              />
            </div>
            <button
              type="submit"
              className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-600 hover:opacity-95 text-white text-xs font-bold tracking-wide shadow-md transition-all shrink-0"
            >
              Search Events
            </button>
          </form>

          {/* CTA Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <button
              onClick={onExploreEvents}
              className="px-6 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold border border-slate-700 transition-all flex items-center gap-2 shadow-sm"
            >
              <Compass className="w-4 h-4 text-cyan-400" />
              Explore All Events
            </button>
            <button
              onClick={onCreateEventClick}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-cyan-600 hover:opacity-95 text-white text-xs font-bold tracking-wide shadow-lg shadow-indigo-600/20 transition-all flex items-center gap-2"
            >
              <span>Create an Event</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* 2. CATEGORY CAROUSEL / GRID */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Explore by Category
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Curated experiences tailored to your interests and passions
            </p>
          </div>
          <button
            onClick={onExploreEvents}
            className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
          >
            <span>See all</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
          {categories.map((cat) => (
            <button
              key={cat.name}
              onClick={() => onCategoryClick(cat.name)}
              className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-cyan-500/50 hover:bg-slate-850 text-left transition-all group flex flex-col justify-between"
            >
              <span className="text-2xl group-hover:scale-110 transition-transform inline-block">
                {cat.icon}
              </span>
              <div className="mt-3">
                <div className="text-xs font-bold text-white group-hover:text-cyan-300 transition-colors">
                  {cat.name}
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5">{cat.count}</div>
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* 3. FEATURED EVENTS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="inline-flex items-center gap-1.5 text-[11px] font-bold text-cyan-400 uppercase tracking-wider mb-1">
              <Sparkles className="w-3.5 h-3.5" /> Handpicked Highlights
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Featured Events
            </h2>
          </div>
          <button
            onClick={onExploreEvents}
            className="text-xs font-semibold text-indigo-400 hover:text-indigo-300"
          >
            View all ({events.length}) →
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuredEvents.map((evt) => (
            <EventCard
              key={evt._id}
              event={evt}
              onSelectEvent={onSelectEvent}
              onQuickBook={onQuickBook}
            />
          ))}
        </div>
      </section>

      {/* 4. UPCOMING EVENTS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Upcoming Gatherings
            </h2>
            <p className="text-xs text-slate-400">
              Reserve tickets before capacities fill up
            </p>
          </div>
          <button
            onClick={onExploreEvents}
            className="text-xs font-semibold text-indigo-400 hover:text-indigo-300"
          >
            Browse Full Calendar →
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {upcomingEvents.map((evt) => (
            <EventCard
              key={evt._id}
              event={evt}
              onSelectEvent={onSelectEvent}
              onQuickBook={onQuickBook}
            />
          ))}
        </div>
      </section>

      {/* 5. WHY CHOOSE EVENTX SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-slate-900 border border-slate-800 p-8 sm:p-12 space-y-10">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Why Event Planners & Attendees Love EventX
            </h2>
            <p className="text-xs sm:text-sm text-slate-400">
              Built with purpose: from instant QR wallet passes to seamless organizer check-in stations.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800/80 space-y-3">
              <div className="p-3 rounded-xl bg-indigo-500/10 text-indigo-400 w-fit">
                <Ticket className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-white">Instant Digital Passes</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Generate high-resolution passes with unique booking IDs and scannable QR payloads in seconds.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800/80 space-y-3">
              <div className="p-3 rounded-xl bg-cyan-500/10 text-cyan-400 w-fit">
                <QrCode className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-white">Rapid Gate Check-in</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Organizers scan attendee passes with instant status checks: valid, already checked-in, or invalid.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800/80 space-y-3">
              <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400 w-fit">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-white">Verified Organizers</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Every event undergoes strict moderation and administrative review to guarantee authentic gatherings.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800/80 space-y-3">
              <div className="p-3 rounded-xl bg-amber-500/10 text-amber-400 w-fit">
                <Zap className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-white">Mobile WebView Ready</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Engineered mobile-first and fully packaged for Android Studio native WebView wrapper deployments.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 6. EVENT STATISTICS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 text-center space-y-1">
            <div className="text-3xl sm:text-4xl font-extrabold text-cyan-400 font-['Space_Grotesk',sans-serif]">
              1,240+
            </div>
            <div className="text-xs font-semibold text-slate-300">Total Events Hosted</div>
            <div className="text-[11px] text-slate-500">Across 2024–2026</div>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 text-center space-y-1">
            <div className="text-3xl sm:text-4xl font-extrabold text-indigo-400 font-['Space_Grotesk',sans-serif]">
              85,000+
            </div>
            <div className="text-xs font-semibold text-slate-300">Active Community Users</div>
            <div className="text-[11px] text-slate-500">Global attendees</div>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 text-center space-y-1">
            <div className="text-3xl sm:text-4xl font-extrabold text-emerald-400 font-['Space_Grotesk',sans-serif]">
              48+
            </div>
            <div className="text-xs font-semibold text-slate-300">Cities Covered</div>
            <div className="text-[11px] text-slate-500">North America & Global</div>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 text-center space-y-1">
            <div className="text-3xl sm:text-4xl font-extrabold text-amber-400 font-['Space_Grotesk',sans-serif]">
              240,000+
            </div>
            <div className="text-xs font-semibold text-slate-300">Tickets Issued</div>
            <div className="text-[11px] text-slate-500">Zero fraud check-ins</div>
          </div>
        </div>
      </section>

      {/* 7. FOOTER */}
      <footer className="border-t border-slate-800/80 pt-16 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Brand */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400 flex items-center justify-center text-white font-extrabold text-sm shadow-md">
                  X
                </div>
                <span className="text-lg font-bold text-white font-['Space_Grotesk',sans-serif]">
                  Event<span className="text-cyan-400">X</span>
                </span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                The premier platform to discover, book, and organize real-world gatherings and summits.
              </p>
              <div className="flex items-center gap-3 text-slate-400 text-xs">
                <span className="hover:text-cyan-400 cursor-pointer">Twitter</span>
                <span>•</span>
                <span className="hover:text-cyan-400 cursor-pointer">LinkedIn</span>
                <span>•</span>
                <span className="hover:text-cyan-400 cursor-pointer">Instagram</span>
                <span>•</span>
                <span className="hover:text-cyan-400 cursor-pointer">GitHub</span>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-3">
                Discover
              </h4>
              <ul className="space-y-2 text-xs text-slate-400">
                <li>
                  <button onClick={onExploreEvents} className="hover:text-cyan-400">
                    Browse All Events
                  </button>
                </li>
                <li>
                  <button onClick={() => onCategoryClick('Technology')} className="hover:text-cyan-400">
                    Tech Summits
                  </button>
                </li>
                <li>
                  <button onClick={() => onCategoryClick('Music')} className="hover:text-cyan-400">
                    Concerts & Festivals
                  </button>
                </li>
                <li>
                  <button onClick={() => onCategoryClick('Business')} className="hover:text-cyan-400">
                    Business Networking
                  </button>
                </li>
              </ul>
            </div>

            {/* Organizers */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-3">
                For Organizers
              </h4>
              <ul className="space-y-2 text-xs text-slate-400">
                <li>
                  <button onClick={onCreateEventClick} className="hover:text-cyan-400">
                    Host an Event
                  </button>
                </li>
                <li>
                  <span className="hover:text-cyan-400 cursor-pointer">Gate Check-in App</span>
                </li>
                <li>
                  <span className="hover:text-cyan-400 cursor-pointer">Ticketing Fees</span>
                </li>
                <li>
                  <span className="hover:text-cyan-400 cursor-pointer">Community Guidelines</span>
                </li>
              </ul>
            </div>

            {/* Newsletter */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-white">
                Stay in the Loop
              </h4>
              <p className="text-xs text-slate-400">
                Get weekly picks of trending events and private organizer early-bird invites.
              </p>
              {subscribed ? (
                <div className="p-2.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  Thanks for subscribing!
                </div>
              ) : (
                <form onSubmit={handleNewsletter} className="flex gap-2">
                  <input
                    type="email"
                    required
                    placeholder="Enter email..."
                    value={newsletterEmail}
                    onChange={(e) => setNewsletterEmail(e.target.value)}
                    className="flex-1 px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                  <button
                    type="submit"
                    className="px-3 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-colors"
                  >
                    Join
                  </button>
                </form>
              )}
            </div>
          </div>

          <div className="pt-8 border-t border-slate-800 text-center text-xs text-slate-500">
            © {new Date().getFullYear()} EventX Technologies Inc. All rights reserved. Mobile WebView Ready.
          </div>
        </div>
      </footer>
    </div>
  );
};
