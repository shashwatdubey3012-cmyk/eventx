import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { HomeView } from './components/HomeView';
import { EventsDiscoveryView } from './components/EventsDiscoveryView';
import { UserDashboard } from './components/UserDashboard';
import { OrganizerDashboard } from './components/OrganizerDashboard';
import { AdminDashboard } from './components/AdminDashboard';
import { AuthModal } from './components/AuthModal';
import { EventDetailsModal } from './components/EventDetailsModal';
import { BookingModal } from './components/BookingModal';
import { TicketPassModal } from './components/TicketPassModal';
import { AndroidModal } from './components/AndroidModal';
import { api } from './services/api';
import { IUser, IEvent, IBooking, INotification } from './types';

export default function App() {
  // Navigation & View
  const [currentView, setCurrentView] = useState<
    'home' | 'events' | 'dashboard' | 'organizer' | 'admin'
  >('home');

  // Authentication State
  const [currentUser, setCurrentUser] = useState<IUser | null>(null);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalTab, setAuthModalTab] = useState<'login' | 'register'>('login');

  // Modals & Selected items
  const [selectedEvent, setSelectedEvent] = useState<IEvent | null>(null);
  const [eventDetailsOpen, setEventDetailsOpen] = useState(false);
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [ticketPassModalOpen, setTicketPassModalOpen] = useState(false);
  const [selectedBookingForPass, setSelectedBookingForPass] = useState<IBooking | null>(null);
  const [androidModalOpen, setAndroidModalOpen] = useState(false);

  // Search & Filtering bridge between Home and Discovery
  const [discoveryCategory, setDiscoveryCategory] = useState<string>('All');
  const [discoverySearch, setDiscoverySearch] = useState<string>('');

  // Events & Notifications
  const [events, setEvents] = useState<IEvent[]>([]);
  const [notifications, setNotifications] = useState<INotification[]>([]);
  const [eventsLoading, setEventsLoading] = useState(true);

  // Initialize and check authenticated user
  useEffect(() => {
    const user = api.getCurrentUser();
    if (user) {
      setCurrentUser(user);
    }
    loadEvents();
  }, []);

  // Load notifications whenever user changes
  useEffect(() => {
    if (currentUser) {
      loadNotifications();
    } else {
      setNotifications([]);
    }
  }, [currentUser]);

  const loadEvents = async () => {
    setEventsLoading(true);
    try {
      const res = await api.getEvents();
      setEvents(res.events);
    } catch (err) {
      console.error('Failed to load events', err);
    } finally {
      setEventsLoading(false);
    }
  };

  const loadNotifications = async () => {
    try {
      const res = await api.getNotifications();
      setNotifications(res.notifications);
    } catch (err) {
      console.error('Failed to load notifications', err);
    }
  };

  const handleMarkNotificationRead = async (id: string) => {
    try {
      await api.markNotificationAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
      );
    } catch (err) {
      console.error('Failed to mark read', err);
    }
  };

  // Auth helpers
  const handleOpenAuth = (tab: 'login' | 'register' = 'login') => {
    setAuthModalTab(tab);
    setAuthModalOpen(true);
  };

  const handleAuthSuccess = (user: IUser) => {
    setCurrentUser(user);
    if (user.role === 'admin') {
      setCurrentView('admin');
    } else if (user.role === 'organizer') {
      setCurrentView('organizer');
    } else {
      // attendee
      if (currentView === 'organizer' || currentView === 'admin') {
        setCurrentView('dashboard');
      }
    }
  };

  const handleLogout = () => {
    api.logout();
    setCurrentUser(null);
    setCurrentView('home');
  };

  // Event interaction handlers
  const handleSelectEvent = (event: IEvent) => {
    setSelectedEvent(event);
    setEventDetailsOpen(true);
  };

  const handleQuickBook = (event: IEvent) => {
    setSelectedEvent(event);
    setBookingModalOpen(true);
  };

  const handleBookNowFromDetails = (event: IEvent) => {
    setEventDetailsOpen(false);
    setSelectedEvent(event);
    setBookingModalOpen(true);
  };

  const handleBookingSuccess = (booking: IBooking) => {
    // Reload events to reflect decremented available seats
    loadEvents();
    if (currentUser) {
      loadNotifications();
    }
  };

  const handleCategoryClick = (cat: string) => {
    setDiscoveryCategory(cat);
    setDiscoverySearch('');
    setCurrentView('events');
  };

  const handleSearchSubmit = (query: string) => {
    setDiscoverySearch(query);
    setDiscoveryCategory('All');
    setCurrentView('events');
  };

  const handleViewTicketPass = (booking: IBooking) => {
    setSelectedBookingForPass(booking);
    setTicketPassModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-['Inter',sans-serif] selection:bg-cyan-500 selection:text-slate-950">
      {/* Top Navigation */}
      <Navbar
        currentView={currentView}
        onNavigate={(view) => setCurrentView(view)}
        currentUser={currentUser}
        onOpenAuth={handleOpenAuth}
        onLogout={handleLogout}
        notifications={notifications}
        onMarkNotificationRead={handleMarkNotificationRead}
        onOpenAndroidGuide={() => setAndroidModalOpen(true)}
      />

      {/* Main App Views */}
      <main>
        {currentView === 'home' && (
          <HomeView
            events={events}
            onSelectEvent={handleSelectEvent}
            onQuickBook={handleQuickBook}
            onExploreEvents={() => setCurrentView('events')}
            onCreateEventClick={() => {
              if (!currentUser) {
                handleOpenAuth('login');
              } else if (currentUser.role === 'organizer' || currentUser.role === 'admin') {
                setCurrentView('organizer');
              } else {
                alert(
                  'Your account is currently an Attendee. Please register or log in as an Organizer to create events, or visit your Attendee Dashboard.'
                );
              }
            }}
            onCategoryClick={handleCategoryClick}
            onSearchSubmit={handleSearchSubmit}
          />
        )}

        {currentView === 'events' && (
          <EventsDiscoveryView
            events={events}
            initialCategory={discoveryCategory}
            initialSearch={discoverySearch}
            onSelectEvent={handleSelectEvent}
            onQuickBook={handleQuickBook}
          />
        )}

        {currentView === 'dashboard' && currentUser && (
          <UserDashboard
            currentUser={currentUser}
            onViewTicket={handleViewTicketPass}
            onProfileUpdated={(updated) => setCurrentUser(updated)}
            onBrowseEvents={() => setCurrentView('events')}
          />
        )}

        {currentView === 'organizer' && currentUser && (
          <OrganizerDashboard
            currentUser={currentUser}
            onLogout={handleLogout}
            onSelectEventForView={(evt) => {
              setSelectedEvent(evt);
              setEventDetailsOpen(true);
            }}
          />
        )}

        {currentView === 'admin' && currentUser && (
          <AdminDashboard currentUser={currentUser} onLogout={handleLogout} />
        )}
      </main>

      {/* MODALS */}
      {/* 1. Auth Modal */}
      <AuthModal
        isOpen={authModalOpen}
        defaultTab={authModalTab}
        onClose={() => setAuthModalOpen(false)}
        onSuccess={handleAuthSuccess}
      />

      {/* 2. Event Details Modal */}
      <EventDetailsModal
        event={selectedEvent}
        isOpen={eventDetailsOpen}
        onClose={() => setEventDetailsOpen(false)}
        onBookNow={handleBookNowFromDetails}
      />

      {/* 3. Booking Modal */}
      <BookingModal
        event={selectedEvent}
        isOpen={bookingModalOpen}
        currentUser={currentUser}
        onClose={() => setBookingModalOpen(false)}
        onBookingSuccess={handleBookingSuccess}
        onOpenAuth={handleOpenAuth}
        onViewMyBookings={() => {
          setCurrentView('dashboard');
        }}
      />

      {/* 4. Ticket Pass Modal */}
      <TicketPassModal
        booking={selectedBookingForPass}
        isOpen={ticketPassModalOpen}
        onClose={() => {
          setTicketPassModalOpen(false);
          setSelectedBookingForPass(null);
        }}
      />

      {/* 5. Android WebView Integration Modal */}
      <AndroidModal
        isOpen={androidModalOpen}
        onClose={() => setAndroidModalOpen(false)}
      />
    </div>
  );
}
