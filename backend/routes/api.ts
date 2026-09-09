import express from 'express';
import {
  register,
  login,
  getMe,
  updateProfile,
} from '../controllers/authController.js';
import {
  getEvents,
  getFeaturedEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
  getOrganizerEvents,
} from '../controllers/eventController.js';
import {
  createBooking,
  getMyBookings,
  getBookingById,
  cancelBooking,
  getOrganizerBookings,
  checkInAttendee,
} from '../controllers/bookingController.js';
import {
  getAdminStats,
  getAdminUsers,
  updateUserStatus,
  deleteUser,
  getAdminEvents,
  updateEventStatus,
  getAdminAnalytics,
  getAdminBookings,
} from '../controllers/adminController.js';
import {
  getNotifications,
  markAsRead,
  markAllAsRead,
} from '../controllers/notificationController.js';
import { authenticateJWT, optionalAuth, requireRole } from '../middleware/auth.js';
import { db } from '../config/db.js';

const router = express.Router();

// Health check
router.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'EventX API', timestamp: new Date().toISOString() });
});

// Seed / Reset demo route
router.post('/system/reset-demo', async (req, res) => {
  await db.seedInitialData(true);
  res.json({ message: 'EventX demo database reset successfully with realistic data' });
});

// Authentication routes
router.post('/auth/register', register);
router.post('/auth/login', login);
router.get('/auth/me', authenticateJWT, getMe);
router.put('/auth/profile', authenticateJWT, updateProfile);

// Public & Browse Events
router.get('/events', optionalAuth, getEvents);
router.get('/events/featured', optionalAuth, getFeaturedEvents);
router.get('/events/:id', optionalAuth, getEventById);

// Organizer Event Management
router.post('/events', authenticateJWT, requireRole(['organizer', 'admin']), createEvent);
router.put('/events/:id', authenticateJWT, requireRole(['organizer', 'admin']), updateEvent);
router.delete('/events/:id', authenticateJWT, requireRole(['organizer', 'admin']), deleteEvent);
router.get('/organizer/events', authenticateJWT, requireRole(['organizer', 'admin']), getOrganizerEvents);
router.get('/organizer/bookings', authenticateJWT, requireRole(['organizer', 'admin']), getOrganizerBookings);
router.post('/organizer/check-in', authenticateJWT, requireRole(['organizer', 'admin']), checkInAttendee);

// Bookings
router.post('/bookings', authenticateJWT, createBooking);
router.get('/bookings/my', authenticateJWT, getMyBookings);
router.get('/bookings/:id', authenticateJWT, getBookingById);
router.put('/bookings/:id/cancel', authenticateJWT, cancelBooking);

// Notifications
router.get('/notifications', authenticateJWT, getNotifications);
router.put('/notifications/:id/read', authenticateJWT, markAsRead);
router.put('/notifications/read-all', authenticateJWT, markAllAsRead);

// Admin Portal
router.get('/admin/stats', authenticateJWT, requireRole(['admin']), getAdminStats);
router.get('/admin/users', authenticateJWT, requireRole(['admin']), getAdminUsers);
router.put('/admin/users/:id/status', authenticateJWT, requireRole(['admin']), updateUserStatus);
router.delete('/admin/users/:id', authenticateJWT, requireRole(['admin']), deleteUser);
router.get('/admin/events', authenticateJWT, requireRole(['admin']), getAdminEvents);
router.put('/admin/events/:id/status', authenticateJWT, requireRole(['admin']), updateEventStatus);
router.delete('/admin/events/:id', authenticateJWT, requireRole(['admin']), deleteEvent);
router.get('/admin/bookings', authenticateJWT, requireRole(['admin']), getAdminBookings);
router.get('/admin/analytics', authenticateJWT, requireRole(['admin']), getAdminAnalytics);

export default router;
