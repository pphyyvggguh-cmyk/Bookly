import type {
  AnalyticsRangeSummary,
  Appointment,
  BusinessSettings,
  CustomerValidationErrors,
  DayOfWeek,
  ServiceItem,
  StaffMember,
  TimeSlotOption,
} from '../types/bookly';

const DAY_KEYS: DayOfWeek[] = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];

export function toISODate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function parseISODate(isoDate: string): Date {
  const [y, m, d] = isoDate.split('-').map(Number);
  return new Date(y, (m || 1) - 1, d || 1);
}

export function addDays(base: Date, days: number): Date {
  const copy = new Date(base.getFullYear(), base.getMonth(), base.getDate());
  copy.setDate(copy.getDate() + days);
  return copy;
}

export function getDayOfWeekKey(isoDate: string): DayOfWeek {
  const d = parseISODate(isoDate);
  return DAY_KEYS[d.getDay()];
}

export function timeToMinutes(hhmm: string): number {
  const [h, m] = hhmm.split(':').map(Number);
  return (h || 0) * 60 + (m || 0);
}

export function minutesToTime(totalMinutes: number): string {
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

export function formatTime12h(hhmm: string): string {
  const [hRaw, mRaw] = hhmm.split(':').map(Number);
  const h = hRaw || 0;
  const m = mRaw || 0;
  const suffix = h >= 12 ? 'PM' : 'AM';
  const hour12 = h % 12 === 0 ? 12 : h % 12;
  return `${hour12}:${String(m).padStart(2, '0')} ${suffix}`;
}

export function formatCurrency(cents: number): string {
  const dollars = cents / 100;
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: cents % 100 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(dollars);
}

export function formatDateReadable(isoDate: string): string {
  const date = parseISODate(isoDate);
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  }).format(date);
}

export function formatFullDate(isoDate: string): string {
  const date = parseISODate(isoDate);
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  }).format(date);
}

export function hasBookingConflict(params: {
  date: string;
  startMinutes: number;
  durationMinutes: number;
  bufferMinutes: number;
  staffId: string;
  appointments: Appointment[];
  ignoreAppointmentId?: string;
}): boolean {
  const { date, startMinutes, durationMinutes, bufferMinutes, staffId, appointments, ignoreAppointmentId } = params;
  const proposedEnd = startMinutes + durationMinutes + bufferMinutes;

  return appointments.some((appt) => {
    if (appt.id === ignoreAppointmentId) return false;
    if (appt.date !== date) return false;
    if (appt.status === 'cancelled') return false;
    if (appt.staffId !== staffId) return false;

    const existingStart = timeToMinutes(appt.startTime);
    const existingEnd = existingStart + appt.durationMinutes + bufferMinutes;
    return startMinutes < existingEnd && proposedEnd > existingStart;
  });
}

export function getAvailableSlots(params: {
  date: string;
  service: ServiceItem;
  staffPreference: string | 'any';
  staffList: StaffMember[];
  appointments: Appointment[];
  settings: BusinessSettings;
  now?: Date;
}): TimeSlotOption[] {
  const { date, service, staffPreference, staffList, appointments, settings, now = new Date() } = params;

  const dayKey = getDayOfWeekKey(date);
  const daySchedule = settings.schedule[dayKey];
  if (!daySchedule || !daySchedule.open) return [];

  const todayIso = toISODate(now);
  if (date < todayIso) return [];

  const openMin = timeToMinutes(daySchedule.start);
  const closeMin = timeToMinutes(daySchedule.end);
  const slotStep = 30;

  const eligibleStaff = staffList.filter((member) => {
    if (!member.active) return false;
    if (!service.specialistIds.includes(member.id)) return false;
    if (staffPreference !== 'any' && member.id !== staffPreference) return false;
    return true;
  });

  if (eligibleStaff.length === 0) return [];

  const currentMinutesToday = now.getHours() * 60 + now.getMinutes() + settings.minLeadHours * 60;
  const slots: TimeSlotOption[] = [];

  for (let startMin = openMin; startMin + service.durationMinutes <= closeMin; startMin += slotStep) {
    if (date === todayIso && startMin < currentMinutesToday) {
      continue;
    }

    const freeStaff = eligibleStaff.find(
      (member) =>
        !hasBookingConflict({
          date,
          startMinutes: startMin,
          durationMinutes: service.durationMinutes,
          bufferMinutes: settings.bufferMinutes,
          staffId: member.id,
          appointments,
        })
    );

    if (freeStaff) {
      const hhmm = minutesToTime(startMin);
      slots.push({
        time: hhmm,
        label: formatTime12h(hhmm),
        availableStaffId: freeStaff.id,
        availableStaffName: freeStaff.name,
      });
    }
  }

  return slots;
}

export function validateCustomerInfo(input: {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
}): CustomerValidationErrors {
  const errors: CustomerValidationErrors = {};
  const trimmedName = input.customerName.trim();
  const trimmedEmail = input.customerEmail.trim();
  const trimmedPhone = input.customerPhone.trim();

  if (trimmedName.length < 2) {
    errors.customerName = 'Please enter your full name (at least 2 characters).';
  }

  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailPattern.test(trimmedEmail)) {
    errors.customerEmail = 'Enter a valid email address for your booking confirmation.';
  }

  const digitsOnly = trimmedPhone.replace(/\D/g, '');
  if (digitsOnly.length < 7) {
    errors.customerPhone = 'Enter a valid phone number (at least 7 digits).';
  }

  return errors;
}

export function generateBookingCode(existingCount: number): string {
  const suffix = 4100 + ((existingCount * 137) % 5800);
  return `BK-${suffix}`;
}

export function computeAnalytics(params: {
  appointments: Appointment[];
  services: ServiceItem[];
  staff: StaffMember[];
  rangeDays: 7 | 30 | 90;
  referenceDate?: Date;
}): AnalyticsRangeSummary {
  const { appointments, services, staff, rangeDays, referenceDate = new Date() } = params;
  const endIso = toISODate(referenceDate);
  const startDate = addDays(referenceDate, -(rangeDays - 1));
  const startIso = toISODate(startDate);

  const inRange = appointments.filter((a) => a.date >= startIso && a.date <= endIso);
  const activeAppointments = inRange.filter((a) => a.status !== 'cancelled');
  const completedBookings = inRange.filter((a) => a.status === 'completed').length;
  const cancelledBookings = inRange.filter((a) => a.status === 'cancelled').length;

  const totalRevenueCents = activeAppointments.reduce((sum, a) => sum + a.priceCents, 0);
  const totalBookings = activeAppointments.length;
  const averageTicketCents = totalBookings > 0 ? Math.round(totalRevenueCents / totalBookings) : 0;

  const customerVisitCounts = new Map<string, number>();
  appointments
    .filter((a) => a.status !== 'cancelled')
    .forEach((a) => {
      customerVisitCounts.set(a.customerEmail.toLowerCase(), (customerVisitCounts.get(a.customerEmail.toLowerCase()) || 0) + 1);
    });
  const totalUniqueCustomers = customerVisitCounts.size;
  const repeatCustomers = Array.from(customerVisitCounts.values()).filter((count) => count > 1).length;
  const retentionRatePercent = totalUniqueCustomers > 0 ? Math.round((repeatCustomers / totalUniqueCustomers) * 100) : 0;

  const buckets = rangeDays === 7 ? 7 : rangeDays === 30 ? 10 : 9;
  const daysPerBucket = Math.ceil(rangeDays / buckets);
  const dailySeries: AnalyticsRangeSummary['dailySeries'] = [];

  for (let i = 0; i < buckets; i++) {
    const bucketStart = addDays(startDate, i * daysPerBucket);
    const bucketEnd = addDays(startDate, Math.min(rangeDays - 1, (i + 1) * daysPerBucket - 1));
    const bStartIso = toISODate(bucketStart);
    const bEndIso = toISODate(bucketEnd);

    const bucketAppts = activeAppointments.filter((a) => a.date >= bStartIso && a.date <= bEndIso);
    const label = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }).format(bucketStart);
    dailySeries.push({
      date: bStartIso,
      label,
      revenueCents: bucketAppts.reduce((s, a) => s + a.priceCents, 0),
      bookings: bucketAppts.length,
    });
  }

  const serviceById = new Map(services.map((s) => [s.id, s]));
  const categoryMap = new Map<string, { bookings: number; revenueCents: number }>();

  activeAppointments.forEach((a) => {
    const svc = serviceById.get(a.serviceId);
    const cat = svc?.category || 'Other';
    const current = categoryMap.get(cat) || { bookings: 0, revenueCents: 0 };
    current.bookings += 1;
    current.revenueCents += a.priceCents;
    categoryMap.set(cat, current);
  });

  const categoryBreakdown = Array.from(categoryMap.entries())
    .map(([category, stats]) => ({
      category,
      bookings: stats.bookings,
      revenueCents: stats.revenueCents,
      sharePercent: totalBookings > 0 ? Math.round((stats.bookings / totalBookings) * 100) : 0,
    }))
    .sort((a, b) => b.revenueCents - a.revenueCents);

  const staffUtilization = staff.map((member) => {
    const memberAppts = activeAppointments.filter((a) => a.staffId === member.id);
    const bookedMinutes = memberAppts.reduce((sum, a) => sum + a.durationMinutes, 0);
    const capacityMinutes = Math.max(1, Math.round((rangeDays / 7) * 5 * 7 * 60));
    const utilizationPercent = Math.min(98, Math.round((bookedMinutes / capacityMinutes) * 100));
    return {
      staffId: member.id,
      staffName: member.name,
      bookings: memberAppts.length,
      revenueCents: memberAppts.reduce((sum, a) => sum + a.priceCents, 0),
      utilizationPercent,
    };
  });

  const hourCounts = new Map<number, number>();
  for (let h = 9; h <= 18; h++) hourCounts.set(h, 0);
  activeAppointments.forEach((a) => {
    const hour = Math.floor(timeToMinutes(a.startTime) / 60);
    if (hourCounts.has(hour)) {
      hourCounts.set(hour, (hourCounts.get(hour) || 0) + 1);
    }
  });

  const peakHours = Array.from(hourCounts.entries()).map(([h, bookings]) => ({
    hourLabel: h === 12 ? '12p' : h > 12 ? `${h - 12}p` : `${h}a`,
    bookings,
  }));

  return {
    totalRevenueCents,
    totalBookings,
    completedBookings,
    cancelledBookings,
    averageTicketCents,
    retentionRatePercent,
    dailySeries,
    categoryBreakdown,
    staffUtilization,
    peakHours,
  };
}
