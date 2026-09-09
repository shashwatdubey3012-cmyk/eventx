import { Response } from 'express';
import { db } from '../config/db.js';
import { IEvent } from '../models/index.js';
import { AuthRequest } from '../middleware/auth.js';

export const getEvents = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const {
      search,
      category,
      city,
      location,
      eventType,
      priceType, // 'free' | 'paid' | 'all'
      dateFilter, // 'today' | 'week' | 'month' | 'all'
      sort = 'popular', // 'popular' | 'latest' | 'price_asc' | 'price_desc' | 'date'
    } = req.query;

    let events = db.getEvents().filter((e) => e.status === 'Approved');

    // Search query: title, description, venue, city
    if (search) {
      const q = String(search).toLowerCase();
      events = events.filter(
        (e) =>
          e.title.toLowerCase().includes(q) ||
          e.description.toLowerCase().includes(q) ||
          e.venue.toLowerCase().includes(q) ||
          e.city.toLowerCase().includes(q) ||
          e.category.toLowerCase().includes(q)
      );
    }

    // Category filter
    if (category && category !== 'All') {
      const cat = String(category).toLowerCase();
      events = events.filter((e) => e.category.toLowerCase() === cat);
    }

    // Location / City filter
    if (city && city !== 'All') {
      const c = String(city).toLowerCase();
      events = events.filter((e) => e.city.toLowerCase().includes(c));
    } else if (location && location !== 'All') {
      const l = String(location).toLowerCase();
      events = events.filter(
        (e) => e.city.toLowerCase().includes(l) || e.venue.toLowerCase().includes(l)
      );
    }

    // Event Type: Online / In-person / Hybrid
    if (eventType && eventType !== 'All') {
      const et = String(eventType).toLowerCase();
      events = events.filter((e) => e.eventType.toLowerCase() === et);
    }

    // Price Type: Free vs Paid
    if (priceType === 'free') {
      events = events.filter((e) => Number(e.ticketPrice) === 0);
    } else if (priceType === 'paid') {
      events = events.filter((e) => Number(e.ticketPrice) > 0);
    }

    // Date filter
    if (dateFilter && dateFilter !== 'all') {
      const now = new Date();
      const todayStr = now.toISOString().split('T')[0];

      if (dateFilter === 'today') {
        events = events.filter((e) => e.date === todayStr);
      } else if (dateFilter === 'week') {
        const endOfWeek = new Date();
        endOfWeek.setDate(now.getDate() + 7);
        const endStr = endOfWeek.toISOString().split('T')[0];
        events = events.filter((e) => e.date >= todayStr && e.date <= endStr);
      } else if (dateFilter === 'month') {
        const endOfMonth = new Date();
        endOfMonth.setDate(now.getDate() + 30);
        const endStr = endOfMonth.toISOString().split('T')[0];
        events = events.filter((e) => e.date >= todayStr && e.date <= endStr);
      }
    }

    // Sorting
    events.sort((a, b) => {
      if (sort === 'latest') {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
      if (sort === 'date') {
        return new Date(a.date).getTime() - new Date(b.date).getTime();
      }
      if (sort === 'price_asc') {
        return a.ticketPrice - b.ticketPrice;
      }
      if (sort === 'price_desc') {
        return b.ticketPrice - a.ticketPrice;
      }
      // 'popular' default: featured first, then lowest remaining seats percentage
      if (a.featured && !b.featured) return -1;
      if (!a.featured && b.featured) return 1;
      const bookedA = a.capacity - a.availableSeats;
      const bookedB = b.capacity - b.availableSeats;
      return bookedB - bookedA;
    });

    res.json({ events, total: events.length });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to fetch events' });
  }
};

export const getFeaturedEvents = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const featured = db
      .getEvents()
      .filter((e) => e.status === 'Approved' && e.featured)
      .slice(0, 6);

    res.json({ events: featured });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to fetch featured events' });
  }
};

export const getEventById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const event = db.getEvents().find((e) => e._id === id);

    if (!event) {
      res.status(404).json({ error: 'Event not found' });
      return;
    }

    // Allow viewing pending events only if user is the organizer or admin
    if (
      event.status !== 'Approved' &&
      (!req.user || (req.user.role !== 'admin' && req.user._id !== event.organizerId))
    ) {
      res.status(403).json({ error: 'This event is currently pending admin approval or review' });
      return;
    }

    res.json({ event });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to fetch event' });
  }
};

export const createEvent = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const {
      title,
      description,
      category,
      banner,
      date,
      startTime,
      endTime,
      venue,
      city,
      location,
      eventType = 'In-person',
      ticketPrice = 0,
      capacity = 100,
      speakers = [],
      schedule = [],
      terms,
      isDraft = false,
    } = req.body;

    if (!title || !date || !startTime || !venue || !category) {
      res.status(400).json({ error: 'Title, category, date, start time, and venue are required' });
      return;
    }

    const numCapacity = Math.max(1, Number(capacity));
    const numPrice = Math.max(0, Number(ticketPrice));

    // Admin-created events can be automatically approved; organizer events are 'Pending Approval'
    const status = isDraft
      ? 'Draft'
      : req.user.role === 'admin'
      ? 'Approved'
      : 'Pending Approval';

    const newEvent: IEvent = {
      _id: `evt_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      organizerId: req.user._id,
      organizerName: req.user.name,
      title: title.trim(),
      description: description ? description.trim() : '',
      category: category.trim(),
      banner:
        banner && banner.trim().length > 0
          ? banner.trim()
          : 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1200&q=80',
      date,
      startTime,
      endTime: endTime || '',
      venue: venue.trim(),
      city: city ? city.trim() : 'San Francisco, CA',
      location: location ? location.trim() : venue.trim(),
      eventType,
      ticketPrice: numPrice,
      capacity: numCapacity,
      availableSeats: numCapacity,
      status,
      speakers,
      schedule,
      terms: terms || 'Standard EventX admissions terms apply. Non-transferable without notice.',
      featured: false,
      createdAt: new Date().toISOString(),
    };

    db.getEvents().push(newEvent);

    // Notify admins about new event
    const admins = db.getUsers().filter((u) => u.role === 'admin');
    for (const admin of admins) {
      db.getNotifications().push({
        _id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
        userId: admin._id,
        title: 'New Event Submitted',
        message: `Organizer "${req.user.name}" submitted "${newEvent.title}" for review.`,
        read: false,
        createdAt: new Date().toISOString(),
      });
    }

    db.commit();

    res.status(201).json({
      message:
        status === 'Pending Approval'
          ? 'Event submitted successfully! It will be publicly visible once approved by an administrator.'
          : 'Event published successfully!',
      event: newEvent,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to create event' });
  }
};

export const updateEvent = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { id } = req.params;
    const event = db.getEvents().find((e) => e._id === id);

    if (!event) {
      res.status(404).json({ error: 'Event not found' });
      return;
    }

    // Must be event organizer or admin
    if (req.user.role !== 'admin' && event.organizerId !== req.user._id) {
      res.status(403).json({ error: 'You do not have permission to modify this event' });
      return;
    }

    const fields = [
      'title',
      'description',
      'category',
      'banner',
      'date',
      'startTime',
      'endTime',
      'venue',
      'city',
      'location',
      'eventType',
      'ticketPrice',
      'capacity',
      'speakers',
      'schedule',
      'terms',
      'featured',
    ];

    for (const field of fields) {
      if (req.body[field] !== undefined) {
        if (field === 'capacity') {
          const newCapacity = Number(req.body.capacity);
          const currentBooked = event.capacity - event.availableSeats;
          event.capacity = newCapacity;
          event.availableSeats = Math.max(0, newCapacity - currentBooked);
        } else if (field === 'ticketPrice') {
          event.ticketPrice = Number(req.body.ticketPrice);
        } else {
          (event as any)[field] = req.body[field];
        }
      }
    }

    db.commit();
    res.json({ message: 'Event updated successfully', event });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to update event' });
  }
};

export const deleteEvent = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { id } = req.params;
    const events = db.getEvents();
    const index = events.findIndex((e) => e._id === id);

    if (index === -1) {
      res.status(404).json({ error: 'Event not found' });
      return;
    }

    const event = events[index];
    if (req.user.role !== 'admin' && event.organizerId !== req.user._id) {
      res.status(403).json({ error: 'You do not have permission to delete this event' });
      return;
    }

    events.splice(index, 1);
    db.commit();

    res.json({ message: 'Event deleted successfully' });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to delete event' });
  }
};

export const getOrganizerEvents = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const myEvents = db
      .getEvents()
      .filter((e) => req.user?.role === 'admin' || e.organizerId === req.user?._id);

    const allBookings = db.getBookings();

    const eventsWithStats = myEvents.map((evt) => {
      const bookings = allBookings.filter(
        (b) => b.eventId === evt._id && b.bookingStatus === 'confirmed'
      );
      const totalTickets = bookings.reduce((sum, b) => sum + b.quantity, 0);
      const totalRevenue = bookings.reduce((sum, b) => sum + b.subtotal, 0);
      const checkedInCount = bookings.filter((b) => b.checkedIn).length;

      return {
        ...evt,
        totalBookings: bookings.length,
        totalTicketsSold: totalTickets,
        totalRevenue,
        checkedInCount,
      };
    });

    res.json({ events: eventsWithStats });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to fetch organizer events' });
  }
};
