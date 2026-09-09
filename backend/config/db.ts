import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';
import { IUser, IEvent, IBooking, INotification } from '../models/index.js';

interface DatabaseSchema {
  users: IUser[];
  events: IEvent[];
  bookings: IBooking[];
  notifications: INotification[];
}

const DB_FILE = path.join(process.cwd(), 'data', 'eventx-db.json');

class DatabaseStore {
  private data: DatabaseSchema = {
    users: [],
    events: [],
    bookings: [],
    notifications: [],
  };
  private initialized = false;

  constructor() {
    this.init();
  }

  private ensureDir() {
    const dir = path.dirname(DB_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }

  private save() {
    try {
      this.ensureDir();
      fs.writeFileSync(DB_FILE, JSON.stringify(this.data, null, 2), 'utf8');
    } catch (err) {
      console.error('Failed to persist database file:', err);
    }
  }

  public async init() {
    if (this.initialized) return;

    try {
      this.ensureDir();
      if (fs.existsSync(DB_FILE)) {
        const content = fs.readFileSync(DB_FILE, 'utf8');
        this.data = JSON.parse(content);
      }
    } catch (err) {
      console.warn('Could not read existing database file, seeding defaults:', err);
    }

    if (!this.data.users || this.data.users.length === 0) {
      await this.seedInitialData();
    }

    this.initialized = true;
  }

  public async seedInitialData(force = false) {
    if (!force && this.data.users.length > 0) return;

    const salt = bcrypt.genSaltSync(10);
    const userPass = bcrypt.hashSync('User123!', salt);
    const orgPass = bcrypt.hashSync('Organizer123!', salt);
    const adminPass = bcrypt.hashSync('Admin123!', salt);

    const now = new Date().toISOString();

    const users: IUser[] = [
      {
        _id: 'usr_admin_1',
        name: 'Alex Vance',
        email: 'admin@eventx.com',
        passwordHash: adminPass,
        phone: '+1 (555) 019-2834',
        role: 'admin',
        city: 'San Francisco, CA',
        status: 'active',
        profileImage: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
        createdAt: now,
      },
      {
        _id: 'usr_org_1',
        name: 'Sarah Chen',
        email: 'organizer@eventx.com',
        passwordHash: orgPass,
        phone: '+1 (555) 438-9201',
        role: 'organizer',
        city: 'Seattle, WA',
        status: 'active',
        profileImage: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=300&q=80',
        createdAt: now,
      },
      {
        _id: 'usr_cust_1',
        name: 'Jordan Miller',
        email: 'user@eventx.com',
        passwordHash: userPass,
        phone: '+1 (555) 839-1144',
        role: 'user',
        city: 'Austin, TX',
        status: 'active',
        profileImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
        createdAt: now,
      },
    ];

    const events: IEvent[] = [
      {
        _id: 'evt_tech_2026',
        organizerId: 'usr_org_1',
        organizerName: 'Sarah Chen (Apex Tech Media)',
        title: 'Tech Innovators Summit 2026',
        description: 'Join the premier gathering of global tech leaders, disruptive startup founders, and visionary software architects. Explore keynotes on quantum computing, decentralized systems, intelligent agents, and sustainable tech infrastructure.',
        category: 'Technology',
        banner: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1200&q=80',
        date: '2026-10-15',
        startTime: '09:00',
        endTime: '17:30',
        venue: 'Moscone Center, Grand Hall A',
        city: 'San Francisco, CA',
        location: '747 Howard St, San Francisco, CA 94103',
        eventType: 'In-person',
        ticketPrice: 199,
        capacity: 500,
        availableSeats: 24, // Trigger "Only 25 seats remaining" rule
        status: 'Approved',
        featured: true,
        speakers: [
          { name: 'Dr. Elena Rostova', role: 'Head of Neural AI, Horizon Lab', avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80' },
          { name: 'Marcus Sterling', role: 'CTO, Apex Cloud Platform', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80' },
          { name: 'Aaliyah Patel', role: 'Founding Partner, ZeroOne Ventures', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80' }
        ],
        schedule: [
          { time: '09:00 AM', activity: 'Opening Keynote & Breakfast', description: 'Welcome addresses and registration coffee' },
          { time: '11:00 AM', activity: 'Panel: Next-Gen Autonomous Architectures', description: 'Industry leaders dissect real-world scaling' },
          { time: '02:00 PM', activity: 'Breakout Deep Dives & Demos', description: 'Interactive product workshops and showcases' },
          { time: '04:30 PM', activity: 'Closing Reception & Networking Gala', description: 'Drinks, appetizers and executive mixer' }
        ],
        terms: 'All attendees must bring government ID. Non-refundable within 48 hours of event date. Badges required for entry.',
        createdAt: now,
      },
      {
        _id: 'evt_cult_2026',
        organizerId: 'usr_org_1',
        organizerName: 'Sarah Chen (Campus Cultural Board)',
        title: 'College Cultural Fest 2026',
        description: 'The most anticipated university arts, music, and dance extravaganza of the academic year. Featuring inter-college battle of the bands, street theatre championships, fashion choreography, and live DJ sets.',
        category: 'College Events',
        banner: 'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1200&q=80',
        date: '2026-11-04',
        startTime: '10:00',
        endTime: '22:00',
        venue: 'St. Xavier Open Air Amphitheatre',
        city: 'Austin, TX',
        location: '2101 Speedway, Austin, TX 78712',
        eventType: 'In-person',
        ticketPrice: 25,
        capacity: 1200,
        availableSeats: 480,
        status: 'Approved',
        featured: true,
        speakers: [
          { name: 'Rohan Deshmukh', role: 'Indie Rock Vocalist & Songwriter', avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=200&q=80' },
          { name: 'Kylie Brooks', role: 'Contemporary Dance Director', avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=200&q=80' }
        ],
        schedule: [
          { time: '10:00 AM', activity: 'Opening Ceremony & Drum Showcase', description: 'Grand inauguration parade' },
          { time: '02:00 PM', activity: 'Acoustic & Battle of the Bands', description: '12 finalist bands competing live' },
          { time: '07:00 PM', activity: 'Star Night Concert & EDM Finale', description: 'Headliner performances under the stars' }
        ],
        terms: 'Valid student ID or guest pass mandatory. Backpack checks enforced at all security gates.',
        createdAt: now,
      },
      {
        _id: 'evt_ai_workshop',
        organizerId: 'usr_org_1',
        organizerName: 'Sarah Chen (DataCrafters)',
        title: 'AI & Machine Learning Workshop',
        description: 'Hands-on intensive masterclass on building enterprise LLM pipelines, fine-tuning multimodal models, vector indexing, and deploying real-time generative agents into production pipelines.',
        category: 'Workshops',
        banner: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=1200&q=80',
        date: '2026-09-28',
        startTime: '13:00',
        endTime: '18:00',
        venue: 'Virtual Innovation Labs (Interactive Zoom / Live Stream)',
        city: 'Online / Global',
        location: 'https://eventx.com/stream/ai-workshop-2026',
        eventType: 'Online',
        ticketPrice: 0, // Free event test
        capacity: 350,
        availableSeats: 88,
        status: 'Approved',
        featured: true,
        speakers: [
          { name: 'Devon Wright', role: 'Staff ML Engineer & Author', avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80' }
        ],
        schedule: [
          { time: '01:00 PM', activity: 'Foundations of Agentic Workflows', description: 'Architecture patterns for reliable execution' },
          { time: '03:00 PM', activity: 'Hands-On Code Lab: Vector & RAG Tuning', description: 'Live coding with GitHub repo provided' },
          { time: '05:00 PM', activity: 'Q&A and Architecture Review', description: 'Individual debugging and project feedback' }
        ],
        terms: 'High-speed internet and laptop with Python 3.10+ required. Access link emailed 2 hours before session.',
        createdAt: now,
      },
      {
        _id: 'evt_startup_night',
        organizerId: 'usr_org_1',
        organizerName: 'Sarah Chen (VentureBridge)',
        title: 'Startup Networking Night',
        description: 'Connect with seed-stage investors, angel syndicates, technical co-founders, and growth advisors over craft cocktails and gourmet canapés in an intimate rooftop setting.',
        category: 'Business',
        banner: 'https://images.unsplash.com/photo-1515187029135-18ee286d815b?auto=format&fit=crop&w=1200&q=80',
        date: '2026-10-22',
        startTime: '18:30',
        endTime: '22:00',
        venue: 'Skyline Terrace & Lounge',
        city: 'Seattle, WA',
        location: '1201 3rd Ave, Seattle, WA 98101',
        eventType: 'In-person',
        ticketPrice: 45,
        capacity: 120,
        availableSeats: 18, // Also trigger low-seats warning
        status: 'Approved',
        featured: false,
        speakers: [
          { name: 'Kavita Roy', role: 'General Partner, Cascade Capital', avatar: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&w=200&q=80' }
        ],
        schedule: [
          { time: '06:30 PM', activity: 'Arrival & Welcome Drinks', description: 'Name badge and founder tag distribution' },
          { time: '07:30 PM', activity: 'Lightning 60-Second Pitches', description: '10 curated founders pitch to audience' },
          { time: '08:30 PM', activity: 'Open Lounge Networking', description: 'Speed meetings and 1-on-1 breakout tables' }
        ],
        terms: 'Smart casual dress code. Strictly 21+ with photo ID.',
        createdAt: now,
      },
      {
        _id: 'evt_music_fest',
        organizerId: 'usr_org_1',
        organizerName: 'Sarah Chen (SoundWave Live)',
        title: 'Live Music Festival',
        description: 'Two days of non-stop acoustic, electronic, indie, and alternative music with two stages, food truck pavilions, interactive art installations, and artisanal vendors.',
        category: 'Music',
        banner: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=1200&q=80',
        date: '2026-11-14',
        startTime: '14:00',
        endTime: '23:30',
        venue: 'Riverfront Green Festival Grounds',
        city: 'Austin, TX',
        location: '701 W Riverside Dr, Austin, TX 78704',
        eventType: 'In-person',
        ticketPrice: 89,
        capacity: 2500,
        availableSeats: 920,
        status: 'Approved',
        featured: true,
        speakers: [
          { name: 'The Neon Echoes', role: 'Headlining Electro-Rock Band', avatar: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=200&q=80' },
          { name: 'DJ Solaris', role: 'Producer & Ambient Soundscaper', avatar: 'https://images.unsplash.com/photo-1520523839898-5071282543e1?auto=format&fit=crop&w=200&q=80' }
        ],
        schedule: [
          { time: '02:00 PM', activity: 'Gates Open & Indie Stage', description: 'Emerging indie songwriters' },
          { time: '06:00 PM', activity: 'Sunset Acoustic Session', description: 'Chill acoustic vibes with food pairing' },
          { time: '08:30 PM', activity: 'Main Stage Headliners & Laser Show', description: 'Epic audiovisual performance' }
        ],
        terms: 'Rain or shine event. Re-entry allowed with wristband. No outside glass containers.',
        createdAt: now,
      },
      {
        _id: 'evt_cyber_conf',
        organizerId: 'usr_org_1',
        organizerName: 'Sarah Chen (SecureNet Institute)',
        title: 'Cybersecurity Conference 2026',
        description: 'Deep-dive security conference addressing zero-trust architecture, cloud-native vulnerability mitigation, offensive red-teaming, threat intelligence, and post-quantum cryptography.',
        category: 'Conferences',
        banner: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=1200&q=80',
        date: '2026-12-03',
        startTime: '08:30',
        endTime: '17:00',
        venue: 'Metro Convention Center, Hall B',
        city: 'Seattle, WA',
        location: '800 Pike St, Seattle, WA 98101',
        eventType: 'Hybrid',
        ticketPrice: 249,
        capacity: 400,
        availableSeats: 160,
        status: 'Approved',
        featured: false,
        speakers: [
          { name: 'Vikram Mehta', role: 'Chief Information Security Officer, Sentinel Shield', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80' },
          { name: 'Claire Dubois', role: 'Principal Cryptanalyst', avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80' }
        ],
        schedule: [
          { time: '08:30 AM', activity: 'Check-in & Threat Briefing Breakfast', description: 'State of Global Cyber Warfare 2026' },
          { time: '10:30 AM', activity: 'Zero-Trust Defense Case Studies', description: 'Lessons from Fortune 50 incident responses' },
          { time: '01:30 PM', activity: 'Live Red Team vs Blue Team CTF', description: 'Real-time competitive simulation' }
        ],
        terms: 'NDA signature required at check-in for confidential red team disclosures.',
        createdAt: now,
      },
      {
        _id: 'evt_pending_demo',
        organizerId: 'usr_org_1',
        organizerName: 'Sarah Chen',
        title: 'NextGen Autonomous Drone Racing Championship',
        description: 'High-speed FPV drone racing through neon obstacle tunnels. Submitted for admin approval.',
        category: 'Sports',
        banner: 'https://images.unsplash.com/photo-1508614589041-895b88991e3e?auto=format&fit=crop&w=1200&q=80',
        date: '2026-12-18',
        startTime: '15:00',
        endTime: '21:00',
        venue: 'Exposition Dome Arena',
        city: 'San Francisco, CA',
        location: '999 Exposition Blvd, San Francisco, CA',
        eventType: 'In-person',
        ticketPrice: 35,
        capacity: 600,
        availableSeats: 600,
        status: 'Pending Approval', // To test Admin approve/reject flow!
        featured: false,
        createdAt: now,
      }
    ];

    const bookings: IBooking[] = [
      {
        _id: 'bkg_seed_1',
        bookingId: 'EVX-2026-8F72K',
        userId: 'usr_cust_1',
        userName: 'Jordan Miller',
        userEmail: 'user@eventx.com',
        userPhone: '+1 (555) 839-1144',
        eventId: 'evt_tech_2026',
        eventTitle: 'Tech Innovators Summit 2026',
        eventDate: '2026-10-15',
        eventTime: '09:00 AM',
        eventVenue: 'Moscone Center, Grand Hall A, San Francisco, CA',
        eventBanner: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1200&q=80',
        ticketType: 'VIP All-Access',
        quantity: 1,
        ticketPrice: 199,
        subtotal: 199,
        serviceFee: 9.95,
        totalAmount: 208.95,
        paymentStatus: 'paid',
        bookingStatus: 'confirmed',
        qrCode: '', // Generated dynamically or stored
        checkedIn: false,
        createdAt: now,
      }
    ];

    const notifications: INotification[] = [
      {
        _id: 'notif_1',
        userId: 'usr_cust_1',
        title: 'Booking Confirmed!',
        message: 'Your booking EVX-2026-8F72K for Tech Innovators Summit 2026 is confirmed. Digital pass is ready.',
        read: false,
        createdAt: now,
      },
      {
        _id: 'notif_2',
        userId: 'usr_org_1',
        title: 'New Event Under Review',
        message: 'Your event "NextGen Autonomous Drone Racing Championship" is awaiting Admin approval.',
        read: false,
        createdAt: now,
      },
      {
        _id: 'notif_3',
        userId: 'usr_admin_1',
        title: 'Event Approval Needed',
        message: '1 new event submitted by Sarah Chen is waiting in the moderation queue.',
        read: false,
        createdAt: now,
      }
    ];

    this.data = { users, events, bookings, notifications };
    this.save();
    console.log('EventX: Database seeded successfully with test users, realistic events, and initial booking.');
  }

  // Collections accessors
  public getUsers(): IUser[] {
    return this.data.users;
  }

  public getEvents(): IEvent[] {
    return this.data.events;
  }

  public getBookings(): IBooking[] {
    return this.data.bookings;
  }

  public getNotifications(): INotification[] {
    return this.data.notifications;
  }

  // Persistence methods
  public commit() {
    this.save();
  }
}

export const db = new DatabaseStore();
