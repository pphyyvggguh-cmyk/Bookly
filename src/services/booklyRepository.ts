import { createSeedData } from '../data/seedData';
import type {
  ActivityEvent,
  Appointment,
  AppointmentStatus,
  BooklyStoreState,
  BusinessSettings,
  Customer,
  ServiceItem,
} from '../types/bookly';
import { generateBookingCode } from '../utils/scheduling';

const STORAGE_KEY = 'bookly_workspace_state_v1';

export interface CreateAppointmentInput {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  serviceId: string;
  staffId: string;
  date: string;
  startTime: string;
  notes?: string;
  status?: AppointmentStatus;
}

export interface BooklyRepository {
  loadState(): Promise<BooklyStoreState>;
  saveState(state: BooklyStoreState): Promise<void>;
  resetDemoState(): Promise<BooklyStoreState>;
}

/**
 * Local browser storage repository.
 * Designed behind BooklyRepository so a SupabaseBooklyRepository
 * backed by @supabase/supabase-js can replace it without UI changes.
 */
class LocalBooklyRepository implements BooklyRepository {
  async loadState(): Promise<BooklyStoreState> {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as BooklyStoreState;
        if (parsed && Array.isArray(parsed.services) && Array.isArray(parsed.appointments)) {
          return parsed;
        }
      }
    } catch {
      // Fallback safely to seed data if storage is unavailable or corrupted
    }
    const seed = createSeedData();
    await this.saveState(seed);
    return seed;
  }

  async saveState(state: BooklyStoreState): Promise<void> {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // Ignore quota errors in constrained environments
    }
  }

  async resetDemoState(): Promise<BooklyStoreState> {
    const seed = createSeedData();
    await this.saveState(seed);
    return seed;
  }
}

export const booklyRepository: BooklyRepository = new LocalBooklyRepository();

export function createAppointmentInState(
  prev: BooklyStoreState,
  input: CreateAppointmentInput
): { nextState: BooklyStoreState; created: Appointment } {
  const service = prev.services.find((s) => s.id === input.serviceId);
  const staff = prev.staff.find((m) => m.id === input.staffId) || prev.staff[0];
  if (!service || !staff) {
    throw new Error('Selected service or specialist could not be found.');
  }

  const normalizedEmail = input.customerEmail.trim().toLowerCase();
  let existingCustomer = prev.customers.find((c) => c.email.toLowerCase() === normalizedEmail);
  let customers = prev.customers;

  if (!existingCustomer) {
    const newCustomer: Customer = {
      id: `cust-${Date.now()}`,
      name: input.customerName.trim(),
      email: input.customerEmail.trim(),
      phone: input.customerPhone.trim(),
      joinedDate: new Date().toISOString().slice(0, 10),
      notes: input.notes?.trim() || undefined,
    };
    existingCustomer = newCustomer;
    customers = [newCustomer, ...prev.customers];
  }

  const bookingCode = generateBookingCode(prev.appointments.length + 1);
  const resolvedStatus: AppointmentStatus =
    input.status ?? (prev.settings.autoConfirmBookings ? 'confirmed' : 'pending');

  const created: Appointment = {
    id: `apt-${Date.now()}`,
    bookingCode,
    customerId: existingCustomer.id,
    customerName: input.customerName.trim(),
    customerEmail: input.customerEmail.trim(),
    customerPhone: input.customerPhone.trim(),
    serviceId: service.id,
    serviceName: service.name,
    staffId: staff.id,
    staffName: staff.name,
    date: input.date,
    startTime: input.startTime,
    durationMinutes: service.durationMinutes,
    priceCents: service.priceCents,
    status: resolvedStatus,
    notes: input.notes?.trim() || undefined,
    createdAt: new Date().toISOString(),
  };

  const activity: ActivityEvent = {
    id: `act-${Date.now()}`,
    type: 'booking_created',
    title: `New booking · ${bookingCode}`,
    detail: `${created.customerName} booked ${service.name} with ${staff.name}.`,
    timestamp: new Date().toISOString(),
  };

  return {
    created,
    nextState: {
      ...prev,
      customers,
      appointments: [created, ...prev.appointments],
      activities: [activity, ...prev.activities].slice(0, 20),
    },
  };
}

export function updateAppointmentStatusInState(
  prev: BooklyStoreState,
  appointmentId: string,
  status: AppointmentStatus
): BooklyStoreState {
  const target = prev.appointments.find((a) => a.id === appointmentId);
  if (!target) return prev;

  const appointments = prev.appointments.map((a) =>
    a.id === appointmentId ? { ...a, status } : a
  );

  const eventTypeMap: Record<AppointmentStatus, ActivityEvent['type']> = {
    confirmed: 'booking_confirmed',
    completed: 'booking_completed',
    cancelled: 'booking_cancelled',
    pending: 'booking_created',
  };

  const verbMap: Record<AppointmentStatus, string> = {
    confirmed: 'Confirmed',
    completed: 'Completed',
    cancelled: 'Cancelled',
    pending: 'Marked pending',
  };

  const activity: ActivityEvent = {
    id: `act-${Date.now()}`,
    type: eventTypeMap[status],
    title: `${verbMap[status]} · ${target.bookingCode}`,
    detail: `${target.customerName} — ${target.serviceName}`,
    timestamp: new Date().toISOString(),
  };

  return {
    ...prev,
    appointments,
    activities: [activity, ...prev.activities].slice(0, 20),
  };
}

export function upsertServiceInState(
  prev: BooklyStoreState,
  service: Omit<ServiceItem, 'id'> & { id?: string }
): BooklyStoreState {
  const isEdit = Boolean(service.id);
  const resolved: ServiceItem = {
    ...service,
    id: service.id || `svc-${Date.now()}`,
  };

  const services = isEdit
    ? prev.services.map((s) => (s.id === resolved.id ? resolved : s))
    : [resolved, ...prev.services];

  const activity: ActivityEvent = {
    id: `act-${Date.now()}`,
    type: 'service_updated',
    title: isEdit ? `Service updated · ${resolved.name}` : `New service added · ${resolved.name}`,
    detail: `${resolved.durationMinutes} min · $${(resolved.priceCents / 100).toFixed(0)}`,
    timestamp: new Date().toISOString(),
  };

  return {
    ...prev,
    services,
    activities: [activity, ...prev.activities].slice(0, 20),
  };
}

export function addCustomerInState(
  prev: BooklyStoreState,
  customer: Omit<Customer, 'id' | 'joinedDate'>
): BooklyStoreState {
  const created: Customer = {
    ...customer,
    id: `cust-${Date.now()}`,
    joinedDate: new Date().toISOString().slice(0, 10),
  };

  return {
    ...prev,
    customers: [created, ...prev.customers],
  };
}

export function updateSettingsInState(
  prev: BooklyStoreState,
  settings: BusinessSettings
): BooklyStoreState {
  return {
    ...prev,
    settings,
  };
}
