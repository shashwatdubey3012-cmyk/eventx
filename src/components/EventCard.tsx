import React from 'react';
import { Calendar, Clock, MapPin, Ticket, AlertCircle, ArrowRight } from 'lucide-react';
import { IEvent } from '../types';

interface EventCardProps {
  event: IEvent;
  onSelectEvent: (event: IEvent) => void;
  onQuickBook?: (event: IEvent) => void;
}

export const EventCard: React.FC<EventCardProps> = ({
  event,
  onSelectEvent,
  onQuickBook,
}) => {
  const isLowSeats = event.availableSeats <= 25 && event.availableSeats > 0;
  const isSoldOut = event.availableSeats <= 0;

  // Format date
  const formattedDate = new Date(event.date).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <div className="group relative flex flex-col bg-slate-900/90 border border-slate-800/80 hover:border-slate-700/80 rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-xl hover:shadow-indigo-950/20 hover:-translate-y-1">
      {/* Banner & Badges */}
      <div className="relative h-48 w-full overflow-hidden bg-slate-950">
        <img
          src={event.banner}
          alt={event.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />

        {/* Category Pill */}
        <div className="absolute top-3 left-3 flex items-center gap-1.5">
          <span className="px-2.5 py-1 rounded-lg text-[11px] font-bold tracking-wide uppercase bg-slate-950/80 text-cyan-300 backdrop-blur-md border border-cyan-500/30 shadow-sm">
            {event.category}
          </span>
          <span className="px-2 py-1 rounded-lg text-[10px] font-semibold bg-slate-900/80 text-slate-300 backdrop-blur-md border border-slate-700">
            {event.eventType}
          </span>
        </div>

        {/* Urgent Seats warning */}
        {isLowSeats && !isSoldOut && (
          <div className="absolute bottom-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-500/90 text-slate-950 text-xs font-bold shadow-md backdrop-blur-sm animate-pulse">
            <AlertCircle className="w-3.5 h-3.5" />
            Only {event.availableSeats} seats remaining
          </div>
        )}

        {isSoldOut && (
          <div className="absolute bottom-3 left-3 px-2.5 py-1 rounded-lg bg-rose-600 text-white text-xs font-bold shadow-md">
            Sold Out
          </div>
        )}

        {/* Price Tag */}
        <div className="absolute top-3 right-3 px-2.5 py-1 rounded-lg bg-slate-950/90 backdrop-blur-md border border-slate-700 text-right">
          <div className="text-xs font-bold text-emerald-400">
            {event.ticketPrice === 0 ? 'Free Entry' : `$${event.ticketPrice}`}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-5 flex flex-col flex-1 justify-between">
        <div>
          <h3 className="text-base font-bold text-white group-hover:text-cyan-300 transition-colors line-clamp-1">
            {event.title}
          </h3>

          <p className="mt-1.5 text-xs text-slate-400 line-clamp-2 leading-relaxed">
            {event.description}
          </p>

          <div className="mt-4 space-y-2 text-xs text-slate-300">
            <div className="flex items-center gap-2">
              <Calendar className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
              <span>{formattedDate}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
              <span>
                {event.startTime} {event.endTime ? `- ${event.endTime}` : ''}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
              <span className="truncate">{event.venue}, {event.city}</span>
            </div>
          </div>
        </div>

        {/* Footer actions */}
        <div className="mt-5 pt-4 border-t border-slate-800/80 flex items-center justify-between gap-3">
          <div className="text-[11px] text-slate-400">
            <span className="font-semibold text-slate-200">{event.availableSeats}</span> / {event.capacity} seats left
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onSelectEvent(event)}
              className="px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700 transition-colors flex items-center gap-1"
            >
              <span>View Event</span>
              <ArrowRight className="w-3 h-3" />
            </button>

            {onQuickBook && !isSoldOut && (
              <button
                onClick={() => onQuickBook(event)}
                className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-gradient-to-r from-indigo-600 to-cyan-600 hover:opacity-90 text-white shadow-sm transition-all"
              >
                Book
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
