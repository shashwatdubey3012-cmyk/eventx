export interface IUser {
  _id: string;
  name: string;
  email: string;
  passwordHash: string;
  phone: string;
  role: 'user' | 'organizer' | 'admin';
  profileImage?: string;
  city: string;
  status: 'active' | 'suspended';
  createdAt: string;
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
  location: string; // Google maps or address string
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
}

export interface IBooking {
  _id: string;
  bookingId: string; // e.g. EVX-2026-8F72K
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
  qrCode: string; // Base64 data URL
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
