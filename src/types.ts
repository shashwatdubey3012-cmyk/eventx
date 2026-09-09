export interface IUser {
  _id: string;
  name: string;
  email: string;
  phone: string;
  role: 'user' | 'organizer' | 'admin';
  profileImage?: string;
  city: string;
  status: 'active' | 'suspended';
  isBlocked?: boolean;
  createdAt: string;
  eventCount?: number;
  bookingCount?: number;
}

export interface IEvent {
  _id: string;
  organizerId: string;
  organizerName?: string;
  title: string;
  description: string;
  category: string;
  banner: string;
  date: string;
  startTime: string;
  endTime: string;
  venue: string;
  city: string;
  location: string;
  eventType: 'In-person' | 'Online' | 'Hybrid';
  ticketPrice: number;
  capacity: number;
  availableSeats: number;
  status: 'Pending Approval' | 'Approved' | 'Rejected' | 'Draft';
  speakers?: Array<{ name: string; role: string; avatar?: string }>;
  schedule?: Array<{ time: string; activity: string; description?: string }>;
  terms?: string;
  featured?: boolean;
  createdAt: string;
  totalBookings?: number;
  totalTicketsSold?: number;
  totalRevenue?: number;
  checkedInCount?: number;
}

export interface IBooking {
  _id: string;
  bookingId: string;
  userId: string;
  userName: string;
  userEmail: string;
  userPhone: string;
  eventId: string;
  eventTitle: string;
  eventDate: string;
  eventTime: string;
  eventVenue: string;
  eventBanner?: string;
  ticketType: string;
  quantity: number;
  ticketPrice: number;
  subtotal: number;
  serviceFee: number;
  totalAmount: number;
  paymentStatus: 'paid' | 'pending' | 'refunded';
  bookingStatus: 'confirmed' | 'cancelled';
  qrCode: string;
  checkedIn: boolean;
  checkedInAt?: string;
  createdAt: string;
}

export interface INotification {
  _id: string;
  userId: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
}

export interface AdminStats {
  totalUsers: number;
  totalOrganizers: number;
  totalEvents: number;
  pendingEvents: number;
  approvedEvents: number;
  totalBookings: number;
  totalRevenue: number;
  platformFees: number;
}

export interface AdminAnalytics {
  categoryCounts: Record<string, number>;
  categoryRevenue: Record<string, number>;
  monthTrends: Array<{ month: string; registrations: number; revenue: number }>;
}
