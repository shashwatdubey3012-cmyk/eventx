import React from 'react';
import {
  X,
  Calendar,
  Clock,
  MapPin,
  Ticket,
  User,
  ExternalLink,
  ShieldAlert,
  AlertCircle,
  Share2,
  CheckCircle,
} from 'lucide-react';
import { IEvent } from '../types';

interface EventDetailsModalProps {
  event: IEvent | null;
  isOpen: boolean;
  onClose: () => void;
  onBookNow: (event: IEvent) => void;
}

export const EventDetailsModal: React.FC<EventDetailsModalProps> = ({
  event,
  isOpen,
  onClose,
  onBookNow,
}) => {
  if (!isOpen || !event) return null;

  const isLowSeats = event.availableSeats <= 25 && event.availableSeats > 0;
  const isSoldOut = event.availableSeats <= 0;

  const formattedDate = new Date(event.date).toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  const mapsQuery = encodeURIComponent(`${event.venue}, ${event.city}`);
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${mapsQuery}`;

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: event.title,
        text: `Check out ${event.title} on EventX!`,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Event link copied to clipboard!');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/85 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl max-h-[92vh] flex flex-col bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden my-auto">
        {/* Floating Close & Share buttons */}
        <div className="absolute top-4 right-4 z-20 flex items-center gap-2">
          <button
            onClick={handleShare}
            className="p-2 rounded-full bg-slate-950/80 hover:bg-slate-900 text-slate-300 hover:text-white backdrop-blur-md border border-slate-700/60 shadow-lg transition-colors"
            title="Share Event"
          >
            <Share2 className="w-4 h-4" />
          </button>
          <button
            onClick={onClose}
            className="p-2 rounded-full bg-slate-950/80 hover:bg-slate-900 text-slate-300 hover:text-white backdrop-blur-md border border-slate-700/60 shadow-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Modal Content */}
        <div className="overflow-y-auto flex-1">
          {/* Hero Banner with overlay */}
          <div className="relative h-64 sm:h-80 w-full bg-slate-950">
            <img
              src={event.banner}
              alt={event.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent" />

            <div className="absolute bottom-6 left-6 right-6">
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span className="px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wider bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 backdrop-blur-md">
                  {event.category}
                </span>
                <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-900/80 text-slate-300 border border-slate-700 backdrop-blur-md">
                  {event.eventType}
                </span>
                {isLowSeats && !isSoldOut && (
                  <span className="px-3 py-1 rounded-lg text-xs font-bold bg-amber-500 text-slate-950 flex items-center gap-1.5 shadow-md">
                    <AlertCircle className="w-3.5 h-3.5" />
                    Only 25 seats remaining
                  </span>
                )}
                {isSoldOut && (
                  <span className="px-3 py-1 rounded-lg text-xs font-bold bg-rose-600 text-white">
                    Sold Out
                  </span>
                )}
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight leading-tight">
                {event.title}
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 mt-1 flex items-center gap-1.5">
                Organized by <span className="font-semibold text-white">{event.organizerName || 'EventX Host'}</span>
              </p>
            </div>
          </div>

          {/* Main Grid Body */}
          <div className="p-6 sm:p-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left 2 Cols: Details, Schedule, Speakers */}
            <div className="lg:col-span-2 space-y-8">
              {/* Description */}
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-2.5">
                  About This Event
                </h3>
                <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-line">
                  {event.description}
                </p>
              </div>

              {/* Event Schedule Timeline */}
              {event.schedule && event.schedule.length > 0 && (
                <div>
                  <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-3">
                    Event Schedule
                  </h3>
                  <div className="relative pl-6 space-y-4 border-l-2 border-slate-800">
                    {event.schedule.map((item, idx) => (
                      <div key={idx} className="relative">
                        <div className="absolute -left-[31px] top-1 w-3 h-3 rounded-full bg-cyan-400 ring-4 ring-slate-900" />
                        <div className="text-xs font-bold text-cyan-400">{item.time}</div>
                        <div className="text-sm font-semibold text-white mt-0.5">{item.activity}</div>
                        {item.description && (
                          <div className="text-xs text-slate-400 mt-0.5">{item.description}</div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Speakers & Performers */}
              {event.speakers && event.speakers.length > 0 && (
                <div>
                  <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-3">
                    Featured Speakers & Performers
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {event.speakers.map((spk, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-3 p-3 rounded-xl bg-slate-950 border border-slate-800/80"
                      >
                        <img
                          src={
                            spk.avatar ||
                            `https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80`
                          }
                          alt={spk.name}
                          className="w-11 h-11 rounded-xl object-cover ring-1 ring-slate-700 shrink-0"
                        />
                        <div className="min-w-0">
                          <div className="text-xs font-bold text-white truncate">{spk.name}</div>
                          <div className="text-[11px] text-slate-400 truncate">{spk.role}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Terms & Conditions */}
              {event.terms && (
                <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-300 mb-1">
                    <ShieldAlert className="w-4 h-4 text-amber-400" />
                    Terms & Admission Rules
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">{event.terms}</p>
                </div>
              )}
            </div>

            {/* Right Col: Logistics, Map, Ticket Pricing Card */}
            <div className="space-y-6">
              {/* Date & Location Card */}
              <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
                <div className="flex items-start gap-3">
                  <Calendar className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
                  <div>
                    <div className="text-xs font-semibold text-slate-400">Date</div>
                    <div className="text-sm font-bold text-white">{formattedDate}</div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Clock className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
                  <div>
                    <div className="text-xs font-semibold text-slate-400">Time</div>
                    <div className="text-sm font-bold text-white">
                      {event.startTime} {event.endTime ? `to ${event.endTime}` : ''}
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                  <div>
                    <div className="text-xs font-semibold text-slate-400">Venue & Location</div>
                    <div className="text-sm font-bold text-white">{event.venue}</div>
                    <div className="text-xs text-slate-400 mt-0.5">{event.city}</div>
                    <a
                      href={mapsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs text-indigo-400 hover:text-indigo-300 font-medium mt-1.5"
                    >
                      View on Google Maps <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>

                {/* Mini Map Card Preview */}
                <div className="w-full h-32 rounded-xl bg-slate-900 border border-slate-800 overflow-hidden relative group">
                  <div className="absolute inset-0 bg-[radial-gradient(#334155_1px,transparent_1px)] [background-size:16px_16px] opacity-40" />
                  <div className="absolute inset-0 flex flex-col items-center justify-center p-3 text-center">
                    <MapPin className="w-6 h-6 text-rose-500 mb-1 animate-bounce" />
                    <span className="text-xs font-semibold text-slate-200 truncate max-w-[200px]">
                      {event.venue}
                    </span>
                    <a
                      href={mapsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-1.5 px-2.5 py-1 text-[10px] font-bold rounded-lg bg-indigo-600/80 text-white hover:bg-indigo-500"
                    >
                      Open Directions
                    </a>
                  </div>
                </div>
              </div>

              {/* Pricing & Booking Card */}
              <div className="p-5 rounded-2xl bg-gradient-to-b from-slate-950 to-slate-900 border border-indigo-500/30 shadow-xl space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs text-slate-400 uppercase tracking-wider font-semibold">
                      Standard Admission
                    </div>
                    <div className="text-2xl font-extrabold text-white">
                      {event.ticketPrice === 0 ? 'Free' : `$${event.ticketPrice}`}
                      <span className="text-xs font-normal text-slate-400 ml-1">/ attendee</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-slate-400">Availability</div>
                    <div className="text-sm font-bold text-emerald-400">
                      {event.availableSeats} of {event.capacity} seats
                    </div>
                  </div>
                </div>

                {isLowSeats && !isSoldOut && (
                  <div className="p-2.5 rounded-lg bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-semibold flex items-center gap-1.5">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    High demand! Only 25 seats remaining
                  </div>
                )}

                <button
                  id="event-details-book-now-btn"
                  onClick={() => onBookNow(event)}
                  disabled={isSoldOut}
                  className="w-full py-3.5 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-cyan-500 text-white text-sm font-bold tracking-wide shadow-lg shadow-indigo-600/30 hover:opacity-95 transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {isSoldOut ? 'SOLD OUT' : 'BOOK NOW'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
