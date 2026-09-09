import React from 'react';
import { X, Calendar, Clock, MapPin, Printer, Download, CheckCircle, AlertTriangle } from 'lucide-react';
import { IBooking } from '../types';

interface TicketPassModalProps {
  booking: IBooking | null;
  isOpen: boolean;
  onClose: () => void;
}

export const TicketPassModal: React.FC<TicketPassModalProps> = ({
  booking,
  isOpen,
  onClose,
}) => {
  if (!isOpen || !booking) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/85 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden my-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-cyan-400">
              EventX Digital Pass
            </span>
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">
              {booking.bookingId}
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Status banner */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs">
            <div className="flex items-center gap-2">
              <span className="text-slate-400">Booking Status:</span>
              <span
                className={`font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                  booking.bookingStatus === 'confirmed'
                    ? 'bg-emerald-500/15 text-emerald-300'
                    : 'bg-rose-500/15 text-rose-400'
                }`}
              >
                {booking.bookingStatus}
              </span>
            </div>
            <div className="flex items-center gap-1.5 font-semibold">
              {booking.checkedIn ? (
                <span className="text-amber-400 flex items-center gap-1">
                  <CheckCircle className="w-3.5 h-3.5" /> Checked-In
                </span>
              ) : (
                <span className="text-cyan-400 flex items-center gap-1">
                  <CheckCircle className="w-3.5 h-3.5" /> Ready for Check-in
                </span>
              )}
            </div>
          </div>

          {/* Ticket Body with Visual Perforations */}
          <div className="relative rounded-2xl bg-gradient-to-b from-slate-950 to-slate-900 border-2 border-indigo-500/40 p-6 shadow-2xl">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
              <div className="space-y-4 flex-1">
                <h3 className="text-xl font-extrabold text-white leading-tight">
                  {booking.eventTitle}
                </h3>

                <div className="grid grid-cols-2 gap-3 text-xs text-slate-300">
                  <div>
                    <div className="text-[10px] text-slate-400 uppercase font-semibold">
                      Attendee Name
                    </div>
                    <div className="font-bold text-white truncate">{booking.userName}</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-400 uppercase font-semibold">
                      Ticket Type
                    </div>
                    <div className="font-bold text-cyan-300">
                      {booking.ticketType} ({booking.quantity}x)
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-400 uppercase font-semibold">Date</div>
                    <div className="font-semibold text-slate-200">{booking.eventDate}</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-400 uppercase font-semibold">Time</div>
                    <div className="font-semibold text-slate-200">{booking.eventTime}</div>
                  </div>
                  <div className="col-span-2">
                    <div className="text-[10px] text-slate-400 uppercase font-semibold">Venue</div>
                    <div className="font-semibold text-slate-200 truncate">
                      {booking.eventVenue}
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-800 text-[11px] text-slate-400">
                  Total Paid: <span className="text-emerald-400 font-bold">${booking.totalAmount.toFixed(2)}</span>
                </div>
              </div>

              {/* Scannable QR Code */}
              <div className="flex flex-col items-center justify-center p-3 rounded-xl bg-white text-slate-950 shrink-0 shadow-lg">
                {booking.qrCode ? (
                  <img
                    src={booking.qrCode}
                    alt={`QR Code ${booking.bookingId}`}
                    className="w-32 h-32 object-contain"
                  />
                ) : (
                  <div className="w-32 h-32 bg-slate-200 flex items-center justify-center text-xs text-slate-600">
                    QR Ready
                  </div>
                )}
                <span className="text-[10px] font-mono font-bold tracking-widest text-slate-800 mt-1">
                  {booking.bookingId}
                </span>
                <span className="text-[9px] text-slate-500">Scan at entrance</span>
              </div>
            </div>
          </div>

          <div className="flex justify-between items-center pt-2">
            <button
              onClick={handlePrint}
              className="px-4 py-2 text-xs font-semibold rounded-xl bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 flex items-center gap-1.5 transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              Print Pass
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
