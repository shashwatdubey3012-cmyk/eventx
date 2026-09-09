import { IUser, IEvent, IBooking, INotification, AdminStats, AdminAnalytics } from '../types';

const API_BASE = '/api';

function getAuthHeader(): HeadersInit {
  const token = localStorage.getItem('eventx_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const headers = {
    'Content-Type': 'application/json',
    ...getAuthHeader(),
    ...options.headers,
  };

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || data.message || `Request failed with status ${response.status}`);
  }

  return data as T;
}

export const api = {
  // Auth
  getCurrentUser(): IUser | null {
    try {
      const stored = localStorage.getItem('eventx_user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  },

  async register(payload: { name: string; email: string; password: string; phone?: string; role?: string; city?: string }) {
    const res = await request<{ message: string; token: string; user: IUser }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    localStorage.setItem('eventx_token', res.token);
    localStorage.setItem('eventx_user', JSON.stringify(res.user));
    return res;
  },

  async login(payload: { email: string; password: string }) {
    const res = await request<{ message: string; token: string; user: IUser }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    localStorage.setItem('eventx_token', res.token);
    localStorage.setItem('eventx_user', JSON.stringify(res.user));
    return res;
  },

  logout() {
    localStorage.removeItem('eventx_token');
    localStorage.removeItem('eventx_user');
  },

  async getMe() {
    const res = await request<{ user: IUser }>('/auth/me');
    if (res.user) {
      localStorage.setItem('eventx_user', JSON.stringify(res.user));
    }
    return res;
  },

  async updateProfile(payload: Partial<IUser>) {
    const res = await request<{ message: string; user: IUser }>('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
    if (res.user) {
      localStorage.setItem('eventx_user', JSON.stringify(res.user));
    }
    return res;
  },

  // Events
  async getEvents(params: Record<string, string | number | undefined> = {}) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, val]) => {
      if (val !== undefined && val !== '') {
        searchParams.append(key, String(val));
      }
    });
    const qs = searchParams.toString();
    return request<{ events: IEvent[]; total: number }>(`/events${qs ? `?${qs}` : ''}`);
  },

  async getFeaturedEvents() {
    return request<{ events: IEvent[] }>('/events/featured');
  },

  async getEventById(id: string) {
    return request<{ event: IEvent }>(`/events/${id}`);
  },

  async createEvent(payload: Partial<IEvent> & { isDraft?: boolean }) {
    return request<{ message: string; event: IEvent }>('/events', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async updateEvent(id: string, payload: Partial<IEvent>) {
    return request<{ message: string; event: IEvent }>(`/events/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  },

  async deleteEvent(id: string) {
    return request<{ message: string }>(`/events/${id}`, {
      method: 'DELETE',
    });
  },

  async getOrganizerEvents() {
    return request<{ events: IEvent[] }>('/organizer/events');
  },

  // Bookings
  async createBooking(payload: {
    eventId: string;
    ticketType?: string;
    quantity: number;
    fullName?: string;
    email?: string;
    phone?: string;
  }) {
    return request<{ message: string; booking: IBooking }>('/bookings', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async getMyBookings() {
    return request<{ bookings: IBooking[] }>('/bookings/my');
  },

  async getBookingById(id: string) {
    return request<{ booking: IBooking }>(`/bookings/${id}`);
  },

  async cancelBooking(id: string) {
    return request<{ message: string; booking: IBooking }>(`/bookings/${id}/cancel`, {
      method: 'PUT',
    });
  },

  async getOrganizerBookings() {
    return request<{ bookings: IBooking[] }>('/organizer/bookings');
  },

  async checkInAttendee(payload: { scanData?: string; bookingId?: string }) {
    return request<{
      status: 'success' | 'already_used' | 'invalid';
      message: string;
      booking?: {
        participantName: string;
        bookingId: string;
        event: string;
        ticketType: string;
        quantity: number;
        checkedInAt?: string;
      };
    }>('/organizer/check-in', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  // Notifications
  async getNotifications() {
    return request<{ notifications: INotification[]; unreadCount: number }>('/notifications');
  },

  async markAsRead(id: string) {
    return request<{ success: boolean }>(`/notifications/${id}/read`, {
      method: 'PUT',
    });
  },

  async markNotificationAsRead(id: string) {
    return this.markAsRead(id);
  },

  async markAllAsRead() {
    return request<{ success: boolean }>('/notifications/read-all', {
      method: 'PUT',
    });
  },

  // Admin
  async getAdminStats() {
    return request<{ stats: AdminStats }>('/admin/stats');
  },

  async getAdminUsers(role?: string) {
    return request<{ users: IUser[] }>(`/admin/users${role ? `?role=${role}` : ''}`);
  },

  async updateUserStatus(id: string, status: 'active' | 'suspended') {
    return request<{ message: string; user: IUser }>(`/admin/users/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
  },

  async toggleBlockUser(id: string, block: boolean) {
    return this.updateUserStatus(id, block ? 'suspended' : 'active');
  },

  async deleteUser(id: string) {
    return request<{ message: string }>(`/admin/users/${id}`, {
      method: 'DELETE',
    });
  },

  async getAdminEvents(status?: string) {
    return request<{ events: IEvent[] }>(`/admin/events${status ? `?status=${status}` : ''}`);
  },

  async deleteAdminEvent(id: string) {
    return request<{ message: string }>(`/admin/events/${id}`, {
      method: 'DELETE',
    });
  },

  async getAdminBookings() {
    return request<{ bookings: IBooking[] }>('/admin/bookings');
  },

  async updateEventStatus(id: string, status: 'Approved' | 'Rejected' | 'Pending Approval') {
    return request<{ message: string; event: IEvent }>(`/admin/events/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
  },

  async getAdminAnalytics() {
    return request<AdminAnalytics>('/admin/analytics');
  },

  async resetDemo() {
    return request<{ message: string }>('/system/reset-demo', {
      method: 'POST',
    });
  },
};
