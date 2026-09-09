import React, { useState } from 'react';
import {
  X,
  Ticket,
  User,
  Mail,
  Phone,
  CheckCircle2,
  Calendar,
  Clock,
  MapPin,
  Printer,
  Download,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import { IEvent, IBooking, IUser } from '../types';
import { api } from '../services/api';

interface BookingModalProps {
  event: IEvent | null;
  isOpen: boolean;
  currentUser: IUser | null;
  onClose: () => void;
  onBookingSuccess: (booking: IBooking) => void;
  onOpenAuth: (defaultTab?: 'login' | 'register') => void;
  onViewMyBookings: () => void;
}

export const BookingModal: React.FC<BookingModalProps> = ({
  event,
  isOpen,
  currentUser,
  onClose,
  onBookingSuccess,
  onOpenAuth,
  onViewMyBookings,
}) => {
  if (!isOpen || !event) return null;

  const [quantity, setQuantity] = useState(1);
  const [ticketType, setTicketType] = useState('General Admission');
  const [fullName, setFullName] = useState(currentUser?.name || '');
  const [email, setEmail] = useState(currentUser?.email || '');
  const [phone, setPhone] = useState(currentUser?.phone || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmedBooking, setConfirmedBooking] = useState<IBooking | null>(null);

  const pricePerTicket = Number(event.ticketPrice) || 0;
  const subtotal = pricePerTicket * quantity;
  const serviceFee = subtotal > 0 ? Number((subtotal * 0.05 + 1.5).toFixed(2)) : 0;
  const totalAmount = Number((subtotal + serviceFee).toFixed(2));

  const handleConfirmBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      onOpenAuth('login');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await api.createBooking({
        eventId: event._id,
        ticketType,
        quantity,
        fullName,
        email,
        phone,
      });

      setConfirmedBooking(res.booking);
      onBookingSuccess(res.booking);
    } catch (err: any) {
      setError(err.message || 'Failed to confirm booking. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/85 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden my-auto">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-500/15 border border-indigo-500/20 text-indigo-400">
              <Ticket className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-tight font-['Space_Grotesk',sans-serif]">
                {confirmedBooking ? 'Booking Confirmed & Digital Pass' : 'Reserve Event Tickets'}
              </h2>
              <p className="text-xs text-slate-400 truncate max-w-sm sm:max-w-md">
                {event.title}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6">
          {confirmedBooking ? (
            /* Digital Ticket confirmation view */
            <div className="space-y-6">
              <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-semibold">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>
                  Booking confirmed! Your unique pass has been generated and added to My Bookings.
                </span>
              </div>

              {/* Digital Pass Card */}
              <div
                id="digital-ticket-pass"
                className="relative rounded-2xl bg-gradient-to-b from-slate-950 to-slate-900 border-2 border-indigo-500/40 p-6 shadow-2xl overflow-hidden"
              >
                {/* Visual perforations */}
                <div className="absolute -left-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-slate-900 border border-slate-800" />
                <div className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-slate-900 border border-slate-800" />

                <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
                  {/* Left: Event & Attendee info */}
                  <div className="space-y-3.5 flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                        EventX Official Digital Pass
                      </span>
                      <span className="text-xs font-mono font-bold text-cyan-400">
                        {confirmedBooking.bookingId}
                      </span>
                    </div>

                    <h3 className="text-lg font-extrabold text-white leading-snug">
                      {confirmedBooking.eventTitle}
                    </h3>

                    <div className="grid grid-cols-2 gap-2 text-xs text-slate-300">
                      <div>
                        <div className="text-[10px] text-slate-400 uppercase font-semibold">
                          Attendee
                        </div>
                        <div className="font-bold text-white truncate">
                          {confirmedBooking.userName}
                        </div>
                      </div>
                      <div>
                        <div className="text-[10px] text-slate-400 uppercase font-semibold">
                          Ticket Type
                        </div>
                        <div className="font-bold text-cyan-300">
                          {confirmedBooking.ticketType} ({confirmedBooking.quantity}x)
                        </div>
                      </div>
                      <div>
                        <div className="text-[10px] text-slate-400 uppercase font-semibold">
                          Date & Time
                        </div>
                        <div className="font-semibold text-slate-200">
                          {confirmedBooking.eventDate} • {confirmedBooking.eventTime}
                        </div>
                      </div>
                      <div>
                        <div className="text-[10px] text-slate-400 uppercase font-semibold">
                          Venue
                        </div>
                        <div className="font-semibold text-slate-200 truncate">
                          {confirmedBooking.eventVenue}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right: Scannable QR Code */}
                  <div className="flex flex-col items-center justify-center p-3 rounded-xl bg-white text-slate-950 shrink-0 shadow-lg">
                    {confirmedBooking.qrCode ? (
                      <img
                        src={confirmedBooking.qrCode}
                        alt={`QR Code ${confirmedBooking.bookingId}`}
                        className="w-32 h-32 object-contain"
                      />
                    ) : (
                      <div className="w-32 h-32 bg-slate-200 flex items-center justify-center text-xs text-slate-600">
                        Pass QR Ready
                      </div>
                    )}
                    <span className="text-[10px] font-mono font-bold tracking-widest text-slate-800 mt-1">
                      {confirmedBooking.bookingId}
                    </span>
                    <span className="text-[9px] text-slate-500">Scan at entrance</span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                <button
                  type="button"
                  onClick={handlePrint}
                  className="px-4 py-2 text-xs font-semibold rounded-xl bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 flex items-center gap-1.5 transition-colors"
                >
                  <Printer className="w-3.5 h-3.5" />
                  Print / Save Pass
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onViewMyBookings();
                    }}
                    className="px-4 py-2 text-xs font-semibold rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white flex items-center gap-1.5 transition-colors"
                  >
                    <span>View in My Bookings</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* Booking Form */
            <form onSubmit={handleConfirmBooking} className="space-y-6">
              {error && (
                <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
                  {error}
                </div>
              )}

              {/* Event Mini summary */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800/80 flex items-start gap-4">
                <img
                  src={event.banner}
                  alt={event.title}
                  className="w-20 h-20 rounded-lg object-cover ring-1 ring-slate-700 shrink-0"
                />
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-bold uppercase tracking-wider text-cyan-400">
                    {event.category}
                  </div>
                  <h4 className="text-sm font-bold text-white truncate">{event.title}</h4>
                  <div className="text-xs text-slate-400 mt-1 flex items-center gap-1.5">
                    <Calendar className="w-3 h-3 text-indigo-400" />
                    <span>{event.date} at {event.startTime}</span>
                  </div>
                  <div className="text-xs text-slate-400 flex items-center gap-1.5 mt-0.5">
                    <MapPin className="w-3 h-3 text-indigo-400" />
                    <span className="truncate">{event.venue}, {event.city}</span>
                  </div>
                </div>
              </div>

              {/* Ticket Type & Quantity */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    Ticket Type
                  </label>
                  <select
                    value={ticketType}
                    onChange={(e) => setTicketType(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="General Admission">General Admission</option>
                    <option value="VIP All-Access">VIP All-Access</option>
                    <option value="Early Bird / Student">Early Bird / Student</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    Number of Tickets
                  </label>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="w-9 h-9 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 hover:text-white font-bold text-sm flex items-center justify-center transition-colors"
                    >
                      -
                    </button>
                    <span className="w-8 text-center text-sm font-bold text-white">
                      {quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        setQuantity(Math.min(Math.min(10, event.availableSeats), quantity + 1))
                      }
                      className="w-9 h-9 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 hover:text-white font-bold text-sm flex items-center justify-center transition-colors"
                    >
                      +
                    </button>
                    <span className="text-[11px] text-slate-400 ml-1">
                      Max {Math.min(10, event.availableSeats)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Attendee Details */}
              <div className="space-y-3 pt-2 border-t border-slate-800/80">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Attendee Contact Information
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs text-slate-300 mb-1">Full Name</label>
                    <div className="relative">
                      <User className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-3" />
                      <input
                        type="text"
                        required
                        placeholder="Jordan Miller"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="w-full pl-8 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs text-slate-300 mb-1">Email</label>
                    <div className="relative">
                      <Mail className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-3" />
                      <input
                        type="email"
                        required
                        placeholder="name@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full pl-8 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs text-slate-300 mb-1">Phone</label>
                    <div className="relative">
                      <Phone className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-3" />
                      <input
                        type="text"
                        placeholder="+1 (555) 000-0000"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full pl-8 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Price Breakdown */}
              <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2 text-xs">
                <div className="flex justify-between text-slate-400">
                  <span>
                    Ticket Price ({quantity}x ${pricePerTicket.toFixed(2)})
                  </span>
                  <span className="font-semibold text-slate-200">${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Convenience & Platform Fee</span>
                  <span className="font-semibold text-slate-200">${serviceFee.toFixed(2)}</span>
                </div>
                <div className="pt-2 border-t border-slate-800 flex justify-between text-sm font-bold text-white">
                  <span>Total Amount</span>
                  <span className="text-emerald-400">${totalAmount.toFixed(2)}</span>
                </div>
              </div>

              {/* Confirm button */}
              <button
                type="submit"
                id="confirm-booking-btn"
                disabled={loading}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-cyan-500 text-white text-xs font-bold uppercase tracking-wider shadow-lg shadow-indigo-600/20 hover:opacity-95 transition-all disabled:opacity-50"
              >
                {loading ? 'Generating Pass & Securing Seats...' : 'Confirm Booking'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
