import { Response } from 'express';
import { db } from '../config/db.js';
import { AuthRequest } from '../middleware/auth.js';

export const getAdminStats = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const users = db.getUsers();
    const events = db.getEvents();
    const bookings = db.getBookings();

    const totalUsers = users.filter((u) => u.role === 'user').length;
    const totalOrganizers = users.filter((u) => u.role === 'organizer').length;
    const totalEvents = events.length;
    const pendingEvents = events.filter((e) => e.status === 'Pending Approval').length;
    const approvedEvents = events.filter((e) => e.status === 'Approved').length;
    const totalBookings = bookings.filter((b) => b.bookingStatus === 'confirmed').length;

    const totalRevenue = bookings
      .filter((b) => b.bookingStatus === 'confirmed')
      .reduce((sum, b) => sum + b.totalAmount, 0);

    const platformFees = bookings
      .filter((b) => b.bookingStatus === 'confirmed')
      .reduce((sum, b) => sum + b.serviceFee, 0);

    res.json({
      stats: {
        totalUsers,
        totalOrganizers,
        totalEvents,
        pendingEvents,
        approvedEvents,
        totalBookings,
        totalRevenue: Number(totalRevenue.toFixed(2)),
        platformFees: Number(platformFees.toFixed(2)),
      },
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to fetch admin stats' });
  }
};

export const getAdminUsers = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { role } = req.query;
    let users = db.getUsers();

    if (role) {
      users = users.filter((u) => u.role === role);
    }

    const events = db.getEvents();
    const bookings = db.getBookings();

    const safeUsers = users.map((u) => {
      const { passwordHash: _, ...safe } = u;
      const userEventCount = events.filter((e) => e.organizerId === u._id).length;
      const userBookingCount = bookings.filter((b) => b.userId === u._id).length;
      return {
        ...safe,
        eventCount: userEventCount,
        bookingCount: userBookingCount,
      };
    });

    res.json({ users: safeUsers });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to fetch users' });
  }
};

export const updateUserStatus = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['active', 'suspended'].includes(status)) {
      res.status(400).json({ error: 'Status must be active or suspended' });
      return;
    }

    const user = db.getUsers().find((u) => u._id === id);
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    if (user.role === 'admin' && user._id === req.user?._id) {
      res.status(400).json({ error: 'Cannot suspend your own admin account' });
      return;
    }

    user.status = status;
    db.commit();

    res.json({ message: `User status changed to ${status}`, user });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to update user status' });
  }
};

export const deleteUser = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const users = db.getUsers();
    const index = users.findIndex((u) => u._id === id);

    if (index === -1) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    if (users[index].role === 'admin') {
      res.status(400).json({ error: 'Cannot delete admin account' });
      return;
    }

    users.splice(index, 1);
    db.commit();

    res.json({ message: 'User deleted successfully' });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to delete user' });
  }
};

export const getAdminEvents = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { status } = req.query;
    let events = db.getEvents();

    if (status && status !== 'all') {
      events = events.filter((e) => e.status === status);
    }

    const bookings = db.getBookings();

    const enriched = events.map((e) => {
      const eventBookings = bookings.filter(
        (b) => b.eventId === e._id && b.bookingStatus === 'confirmed'
      );
      const totalTickets = eventBookings.reduce((sum, b) => sum + b.quantity, 0);
      const revenue = eventBookings.reduce((sum, b) => sum + b.subtotal, 0);
      return {
        ...e,
        bookingsCount: eventBookings.length,
        ticketsSold: totalTickets,
        revenue,
      };
    });

    res.json({ events: enriched });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to fetch admin events' });
  }
};

export const updateEventStatus = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['Approved', 'Rejected', 'Pending Approval'].includes(status)) {
      res.status(400).json({ error: 'Status must be Approved, Rejected, or Pending Approval' });
      return;
    }

    const event = db.getEvents().find((e) => e._id === id);
    if (!event) {
      res.status(404).json({ error: 'Event not found' });
      return;
    }

    event.status = status;

    // Send notification to organizer
    db.getNotifications().push({
      _id: `notif_${Date.now()}`,
      userId: event.organizerId,
      title: `Event ${status}`,
      message: `Your event "${event.title}" has been marked as ${status} by the administration.`,
      read: false,
      createdAt: new Date().toISOString(),
    });

    db.commit();

    res.json({ message: `Event status updated to ${status}`, event });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to update event status' });
  }
};

export const getAdminAnalytics = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const bookings = db.getBookings().filter((b) => b.bookingStatus === 'confirmed');
    const events = db.getEvents();

    // Category breakdown
    const categoryCounts: Record<string, number> = {};
    for (const evt of events) {
      categoryCounts[evt.category] = (categoryCounts[evt.category] || 0) + 1;
    }

    // Revenue by category
    const categoryRevenue: Record<string, number> = {};
    for (const bkg of bookings) {
      const evt = events.find((e) => e._id === bkg.eventId);
      const cat = evt?.category || 'General';
      categoryRevenue[cat] = (categoryRevenue[cat] || 0) + bkg.totalAmount;
    }

    // Monthly registrations trends
    const monthTrends = [
      { month: 'Jun', registrations: 120, revenue: 8400 },
      { month: 'Jul', registrations: 185, revenue: 12900 },
      { month: 'Aug', registrations: 240, revenue: 16800 },
      { month: 'Sep', registrations: 310, revenue: 22400 },
      { month: 'Oct', registrations: 390, revenue: 28500 },
      { month: 'Nov', registrations: 460, revenue: 34100 },
    ];

    res.json({
      categoryCounts,
      categoryRevenue,
      monthTrends,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to fetch analytics' });
  }
};

export const getAdminBookings = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const bookings = db.getBookings();
    res.json({ bookings });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to fetch admin bookings' });
  }
};

