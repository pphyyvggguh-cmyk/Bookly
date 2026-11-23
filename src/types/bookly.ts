export type AppointmentStatus = 'confirmed' | 'pending' | 'completed' | 'cancelled';

export type ServiceCategory = 'Hair & Grooming' | 'Skin & Aesthetics' | 'Color & Styling' | 'Consultation';

export type DayOfWeek = 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun';

export interface ServiceItem {
  id: string;
  name: string;
  category: ServiceCategory;
  durationMinutes: number;
  priceCents: number;
  description: string;
  active: boolean;
  specialistIds: string[];
}

export interface StaffMember {
  id: string;
  name: string;
  role: string;
  specialty: string;
  avatarUrl: string;
  active: boolean;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  joinedDate: string; // YYYY-MM-DD
  notes?: string;
}

export interface Appointment {
  id: string;
  bookingCode: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  serviceId: string;
  serviceName: string;
  staffId: string;
  staffName: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm (24h)
  durationMinutes: number;
  priceCents: number;
  status: AppointmentStatus;
  notes?: string;
  createdAt: string; // ISO string
}

export interface DaySchedule {
  open: boolean;
  start: string; // HH:mm
  end: string; // HH:mm
}

export type WeeklySchedule = Record<DayOfWeek, DaySchedule>;

export interface BusinessSettings {
  businessName: string;
  tagline: string;
  email: string;
  phone: string;
  address: string;
  timezone: string;
  bufferMinutes: number;
  minLeadHours: number;
  cancellationWindowHours: number;
  autoConfirmBookings: boolean;
  smsReminders: boolean;
  emailReminders: boolean;
  schedule: WeeklySchedule;
}

export interface ActivityEvent {
  id: string;
  type: 'booking_created' | 'booking_confirmed' | 'booking_completed' | 'booking_cancelled' | 'service_updated';
  title: string;
  detail: string;
  timestamp: string; // ISO string
}

export interface BookingDraft {
  serviceId: string | null;
  staffId: string | 'any';
  date: string | null; // YYYY-MM-DD
  startTime: string | null; // HH:mm
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  notes: string;
}

export interface BooklyStoreState {
  services: ServiceItem[];
  staff: StaffMember[];
  customers: Customer[];
  appointments: Appointment[];
  activities: ActivityEvent[];
  settings: BusinessSettings;
}

export interface TimeSlotOption {
  time: string; // HH:mm
  label: string; // e.g. 9:30 AM
  availableStaffId: string;
  availableStaffName: string;
}

export interface CustomerValidationErrors {
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
}

export interface AnalyticsRangeSummary {
  totalRevenueCents: number;
  totalBookings: number;
  completedBookings: number;
  cancelledBookings: number;
  averageTicketCents: number;
  retentionRatePercent: number;
  dailySeries: Array<{
    date: string;
    label: string;
    revenueCents: number;
    bookings: number;
  }>;
  categoryBreakdown: Array<{
    category: string;
    bookings: number;
    revenueCents: number;
    sharePercent: number;
  }>;
  staffUtilization: Array<{
    staffId: string;
    staffName: string;
    bookings: number;
    revenueCents: number;
    utilizationPercent: number;
  }>;
  peakHours: Array<{
    hourLabel: string;
    bookings: number;
  }>;
}
