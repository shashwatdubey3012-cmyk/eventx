import { Response } from 'express';
import QRCode from 'qrcode';
import { db } from '../config/db.js';
import { IBooking } from '../models/index.js';
import { AuthRequest } from '../middleware/auth.js';

function generateBookingId(): string {
  const year = new Date().getFullYear();
  const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
  let randomPart = '';
  for (let i = 0; i < 5; i++) {
    randomPart += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `EVX-${year}-${randomPart}`;
}

export const createBooking = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Please log in to book event tickets' });
      return;
    }

    const {
      eventId,
      ticketType = 'General Admission',
      quantity = 1,
      fullName,
      email,
      phone,
    } = req.body;

    if (!eventId) {
      res.status(400).json({ error: 'Event ID is required' });
      return;
    }

    const numTickets = Math.max(1, parseInt(String(quantity), 10) || 1);
    const event = db.getEvents().find((e) => e._id === eventId);

    if (!event) {
      res.status(404).json({ error: 'Event not found' });
      return;
    }

    if (event.status !== 'Approved') {
      res.status(400).json({ error: 'This event is not currently open for bookings' });
      return;
    }

    if (event.availableSeats < numTickets) {
      res.status(400).json({
        error: `Only ${event.availableSeats} tickets remaining. Cannot reserve ${numTickets} tickets.`,
      });
      return;
    }

    const attendeeName = fullName?.trim() || req.user.name;
    const attendeeEmail = email?.trim() || req.user.email;
    const attendeePhone = phone?.trim() || req.user.phone || '';

    const pricePerTicket = Number(event.ticketPrice) || 0;
    const subtotal = pricePerTicket * numTickets;
    // 5% convenience fee for paid tickets, minimum $1.50 if paid, $0 for free
    const serviceFee = subtotal > 0 ? Number((subtotal * 0.05 + 1.5).toFixed(2)) : 0;
    const totalAmount = Number((subtotal + serviceFee).toFixed(2));

    const bookingId = generateBookingId();

    // Generate QR Code data URL containing verify payload
    const qrPayload = JSON.stringify({
      bookingId,
      eventId: event._id,
      attendee: attendeeName,
      valid: true,
      issued: new Date().toISOString(),
    });

    const qrCode = await QRCode.toDataURL(qrPayload, {
      errorCorrectionLevel: 'M',
      margin: 2,
      scale: 6,
      color: {
        dark: '#0f172a',
        light: '#ffffff',
      },
    });

    // Deduct seats
    event.availableSeats -= numTickets;

    const newBooking: IBooking = {
      _id: `bkg_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      bookingId,
      userId: req.user._id,
      userName: attendeeName,
      userEmail: attendeeEmail,
      userPhone: attendeePhone,
      eventId: event._id,
      eventTitle: event.title,
      eventDate: event.date,
      eventTime: event.startTime,
      eventVenue: event.venue,
      eventBanner: event.banner,
      ticketType,
      quantity: numTickets,
      ticketPrice: pricePerTicket,
      subtotal,
      serviceFee,
      totalAmount,
      paymentStatus: 'paid',
      bookingStatus: 'confirmed',
      qrCode,
      checkedIn: false,
      createdAt: new Date().toISOString(),
    };

    db.getBookings().push(newBooking);

    // Create notification for attendee
    db.getNotifications().push({
      _id: `notif_${Date.now()}`,
      userId: req.user._id,
      title: 'Booking Confirmed!',
      message: `Your booking ${bookingId} for "${event.title}" (${numTickets} ticket${numTickets > 1 ? 's' : ''}) has been confirmed. View your digital QR ticket anytime in My Bookings.`,
      read: false,
      createdAt: new Date().toISOString(),
    });

    // Create notification for organizer
    db.getNotifications().push({
      _id: `notif_org_${Date.now()}`,
      userId: event.organizerId,
      title: 'New Event Registration',
      message: `${attendeeName} just registered for "${event.title}" (${numTickets} ticket${numTickets > 1 ? 's' : ''}). Booking ID: ${bookingId}`,
      read: false,
      createdAt: new Date().toISOString(),
    });

    db.commit();

    res.status(201).json({
      message: 'Booking confirmed successfully',
      booking: newBooking,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to complete booking' });
  }
};

export const getMyBookings = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const bookings = db
      .getBookings()
      .filter((b) => b.userId === req.user?._id)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    res.json({ bookings });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to fetch bookings' });
  }
};

export const getBookingById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const booking = db
      .getBookings()
      .find((b) => b._id === id || b.bookingId === id);

    if (!booking) {
      res.status(404).json({ error: 'Booking not found' });
      return;
    }

    // Verify permission: attendee, organizer of event, or admin
    if (req.user) {
      const event = db.getEvents().find((e) => e._id === booking.eventId);
      const isOwner = booking.userId === req.user._id;
      const isOrganizer = event && event.organizerId === req.user._id;
      const isAdmin = req.user.role === 'admin';

      if (!isOwner && !isOrganizer && !isAdmin) {
        res.status(403).json({ error: 'Unauthorized to view this booking' });
        return;
      }
    }

    res.json({ booking });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to retrieve booking' });
  }
};

export const cancelBooking = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { id } = req.params;
    const booking = db
      .getBookings()
      .find((b) => b._id === id || b.bookingId === id);

    if (!booking) {
      res.status(404).json({ error: 'Booking not found' });
      return;
    }

    if (booking.userId !== req.user._id && req.user.role !== 'admin') {
      res.status(403).json({ error: 'You cannot cancel someone else’s booking' });
      return;
    }

    if (booking.bookingStatus === 'cancelled') {
      res.status(400).json({ error: 'This booking is already cancelled' });
      return;
    }

    if (booking.checkedIn) {
      res.status(400).json({ error: 'Cannot cancel ticket after attendee has checked in' });
      return;
    }

    // Mark cancelled & restore seats
    booking.bookingStatus = 'cancelled';
    booking.paymentStatus = 'refunded';

    const event = db.getEvents().find((e) => e._id === booking.eventId);
    if (event) {
      event.availableSeats = Math.min(event.capacity, event.availableSeats + booking.quantity);
    }

    // Notification
    db.getNotifications().push({
      _id: `notif_${Date.now()}`,
      userId: booking.userId,
      title: 'Booking Cancelled',
      message: `Booking ${booking.bookingId} for "${booking.eventTitle}" was cancelled and seats released.`,
      read: false,
      createdAt: new Date().toISOString(),
    });

    db.commit();

    res.json({ message: 'Booking cancelled successfully', booking });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to cancel booking' });
  }
};

export const getOrganizerBookings = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const myEvents = db
      .getEvents()
      .filter((e) => req.user?.role === 'admin' || e.organizerId === req.user?._id);
    const myEventIds = new Set(myEvents.map((e) => e._id));

    const bookings = db
      .getBookings()
      .filter((b) => myEventIds.has(b.eventId))
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    res.json({ bookings });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to fetch bookings' });
  }
};

export const checkInAttendee = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { scanData, bookingId } = req.body;
    let targetBookingId = bookingId?.trim();

    // Parse scanData if provided from QR scanner
    if (scanData) {
      try {
        const parsed = JSON.parse(scanData);
        if (parsed.bookingId) {
          targetBookingId = parsed.bookingId;
        }
      } catch {
        // scanData might directly be raw booking ID
        targetBookingId = scanData.trim();
      }
    }

    if (!targetBookingId) {
      res.status(400).json({ status: 'invalid', message: '✕ Invalid Ticket: No ticket identifier found' });
      return;
    }

    const booking = db
      .getBookings()
      .find((b) => b.bookingId.toLowerCase() === targetBookingId.toLowerCase() || b._id === targetBookingId);

    if (!booking) {
      res.status(404).json({
        status: 'invalid',
        message: '✕ Invalid Ticket: Ticket does not exist in EventX registry',
      });
      return;
    }

    // Verify organizer permission
    const event = db.getEvents().find((e) => e._id === booking.eventId);
    if (req.user.role !== 'admin' && event && event.organizerId !== req.user._id) {
      res.status(403).json({
        status: 'invalid',
        message: '✕ Unauthorized: You are not the organizer for this event',
      });
      return;
    }

    if (booking.bookingStatus === 'cancelled') {
      res.status(400).json({
        status: 'invalid',
        message: '✕ Invalid Ticket: This booking was cancelled/refunded',
      });
      return;
    }

    if (booking.checkedIn) {
      res.status(200).json({
        status: 'already_used',
        message: '⚠ Ticket Already Used',
        booking: {
          participantName: booking.userName,
          bookingId: booking.bookingId,
          event: booking.eventTitle,
          ticketType: booking.ticketType,
          quantity: booking.quantity,
          checkedInAt: booking.checkedInAt,
        },
      });
      return;
    }

    // Perform check-in
    booking.checkedIn = true;
    booking.checkedInAt = new Date().toISOString();

    db.commit();

    res.status(200).json({
      status: 'success',
      message: '✓ Check-in Successful',
      booking: {
        participantName: booking.userName,
        bookingId: booking.bookingId,
        event: booking.eventTitle,
        ticketType: booking.ticketType,
        quantity: booking.quantity,
        checkedInAt: booking.checkedInAt,
      },
    });
  } catch (err: any) {
    res.status(500).json({ status: 'invalid', message: err.message || 'Check-in processing error' });
  }
};
