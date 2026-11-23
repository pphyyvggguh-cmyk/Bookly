import test from 'node:test';
import assert from 'node:assert/strict';
import {
  computeAnalytics,
  formatCurrency,
  formatTime12h,
  getAvailableSlots,
  hasBookingConflict,
  validateCustomerInfo,
} from './scheduling';
import type { Appointment, BusinessSettings, ServiceItem, StaffMember } from '../types/bookly';

const baseSettings: BusinessSettings = {
  businessName: 'Atelier Bookly',
  tagline: 'Modern Studio',
  email: 'hello@bookly.app',
  phone: '555-0199',
  address: '140 Mercer St',
  timezone: 'America/New_York',
  bufferMinutes: 15,
  minLeadHours: 1,
  cancellationWindowHours: 24,
  autoConfirmBookings: true,
  smsReminders: true,
  emailReminders: true,
  schedule: {
    mon: { open: true, start: '09:00', end: '17:00' },
    tue: { open: true, start: '09:00', end: '17:00' },
    wed: { open: true, start: '09:00', end: '17:00' },
    thu: { open: true, start: '09:00', end: '17:00' },
    fri: { open: true, start: '09:00', end: '17:00' },
    sat: { open: true, start: '10:00', end: '15:00' },
    sun: { open: false, start: '10:00', end: '15:00' },
  },
};

const sampleStaff: StaffMember[] = [
  { id: 'st-1', name: 'Marcus Vance', role: 'Director', specialty: 'Cuts', avatarUrl: '', active: true },
  { id: 'st-2', name: 'Elena Rostova', role: 'Stylist', specialty: 'Color', avatarUrl: '', active: true },
];

const sampleService: ServiceItem = {
  id: 'svc-1',
  name: 'Tailored Haircut',
  category: 'Hair & Grooming',
  durationMinutes: 45,
  priceCents: 6500,
  description: 'Precision cut and finish.',
  active: true,
  specialistIds: ['st-1'],
};

const sampleAppointments: Appointment[] = [
  {
    id: 'apt-1',
    bookingCode: 'BK-4100',
    customerId: 'c-1',
    customerName: 'Noah Brooks',
    customerEmail: 'noah@example.com',
    customerPhone: '555-0101',
    serviceId: 'svc-1',
    serviceName: 'Tailored Haircut',
    staffId: 'st-1',
    staffName: 'Marcus Vance',
    date: '2026-11-25', // Wednesday
    startTime: '10:00',
    durationMinutes: 45,
    priceCents: 6500,
    status: 'confirmed',
    createdAt: '2026-11-23T09:00:00.000Z',
  },
];

test('formatting helpers format currency and 12-hour times accurately', () => {
  assert.equal(formatCurrency(6500), '$65');
  assert.equal(formatCurrency(6550), '$65.50');
  assert.equal(formatTime12h('09:30'), '9:30 AM');
  assert.equal(formatTime12h('13:00'), '1:00 PM');
});

test('hasBookingConflict respects duration and buffer minutes', () => {
  assert.equal(
    hasBookingConflict({
      date: '2026-11-25',
      startMinutes: 10 * 60 + 30, // 10:30 overlaps 10:00-11:00 (45m + 15m buffer)
      durationMinutes: 45,
      bufferMinutes: 15,
      staffId: 'st-1',
      appointments: sampleAppointments,
    }),
    true
  );

  assert.equal(
    hasBookingConflict({
      date: '2026-11-25',
      startMinutes: 11 * 60, // 11:00 starts right after 10:00 + 45m + 15m buffer
      durationMinutes: 45,
      bufferMinutes: 15,
      staffId: 'st-1',
      appointments: sampleAppointments,
    }),
    false
  );
});

test('getAvailableSlots excludes closed days and conflicting slots', () => {
  // Sunday 2026-11-29 is closed
  const sundaySlots = getAvailableSlots({
    date: '2026-11-29',
    service: sampleService,
    staffPreference: 'any',
    staffList: sampleStaff,
    appointments: sampleAppointments,
    settings: baseSettings,
    now: new Date(2026, 10, 23, 8, 0),
  });
  assert.equal(sundaySlots.length, 0);

  // Wednesday 2026-11-25 has 10:00 booked for st-1 (45m + 15m buffer => 09:30 and 10:00 and 10:30 blocked)
  const wedSlots = getAvailableSlots({
    date: '2026-11-25',
    service: sampleService,
    staffPreference: 'st-1',
    staffList: sampleStaff,
    appointments: sampleAppointments,
    settings: baseSettings,
    now: new Date(2026, 10, 23, 8, 0),
  });
  const times = wedSlots.map((s) => s.time);
  assert.equal(times.includes('09:00'), true);
  assert.equal(times.includes('09:30'), false);
  assert.equal(times.includes('10:00'), false);
  assert.equal(times.includes('10:30'), false);
  assert.equal(times.includes('11:00'), true);
});

test('validateCustomerInfo rejects invalid inputs and passes valid inputs', () => {
  const invalid = validateCustomerInfo({
    customerName: 'A',
    customerEmail: 'not-an-email',
    customerPhone: '123',
  });
  assert.ok(invalid.customerName);
  assert.ok(invalid.customerEmail);
  assert.ok(invalid.customerPhone);

  const valid = validateCustomerInfo({
    customerName: 'Clara Chen',
    customerEmail: 'clara@studio.co',
    customerPhone: '+1 (415) 555-0144',
  });
  assert.deepEqual(valid, {});
});

test('computeAnalytics aggregates active revenue and ignores cancelled bookings', () => {
  const appointments: Appointment[] = [
    ...sampleAppointments,
    {
      ...sampleAppointments[0],
      id: 'apt-2',
      bookingCode: 'BK-4101',
      status: 'cancelled',
      priceCents: 9000,
    },
    {
      ...sampleAppointments[0],
      id: 'apt-3',
      bookingCode: 'BK-4102',
      customerEmail: 'noah@example.com',
      date: '2026-11-24',
      status: 'completed',
      priceCents: 8500,
    },
  ];

  const summary = computeAnalytics({
    appointments,
    services: [sampleService],
    staff: sampleStaff,
    rangeDays: 7,
    referenceDate: new Date(2026, 10, 25),
  });

  assert.equal(summary.totalBookings, 2);
  assert.equal(summary.cancelledBookings, 1);
  assert.equal(summary.completedBookings, 1);
  assert.equal(summary.totalRevenueCents, 15000);
  assert.equal(summary.retentionRatePercent, 100);
});
