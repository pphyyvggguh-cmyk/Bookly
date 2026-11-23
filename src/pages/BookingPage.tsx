import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  Calendar as CalendarIcon,
  Check,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  Search,
  User,
} from 'lucide-react';
import { PublicLayout } from '../layouts/PublicLayout';
import { useBookly } from '../hooks/useBookly';
import { Button, EmptyState } from '../components/UI';
import type { Appointment, BookingDraft, CustomerValidationErrors, ServiceCategory } from '../types/bookly';
import {
  addDays,
  formatCurrency,
  formatFullDate,
  formatTime12h,
  getAvailableSlots,
  getDayOfWeekKey,
  toISODate,
  validateCustomerInfo,
} from '../utils/scheduling';

const STEP_LABELS = [
  'Service',
  'Date',
  'Time',
  'Details',
  'Review',
  'Confirmed',
];

const CATEGORIES: Array<'All' | ServiceCategory> = [
  'All',
  'Hair & Grooming',
  'Color & Styling',
  'Skin & Aesthetics',
  'Consultation',
];

export function BookingPage() {
  const { state, isLoading, createAppointment } = useBookly();
  const [step, setStep] = useState<number>(1);
  const [categoryFilter, setCategoryFilter] = useState<'All' | ServiceCategory>('All');
  const [serviceSearch, setServiceSearch] = useState('');
  const [calendarMonth, setCalendarMonth] = useState<Date>(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });
  const [errors, setErrors] = useState<CustomerValidationErrors>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmedAppointment, setConfirmedAppointment] = useState<Appointment | null>(null);

  const [draft, setDraft] = useState<BookingDraft>({
    serviceId: null,
    staffId: 'any',
    date: null,
    startTime: null,
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    notes: '',
  });

  const activeServices = useMemo(
    () => (state?.services || []).filter((s) => s.active),
    [state]
  );

  const filteredServices = useMemo(() => {
    return activeServices.filter((svc) => {
      const matchesCat = categoryFilter === 'All' || svc.category === categoryFilter;
      const q = serviceSearch.trim().toLowerCase();
      const matchesQuery =
        !q ||
        svc.name.toLowerCase().includes(q) ||
        svc.description.toLowerCase().includes(q);
      return matchesCat && matchesQuery;
    });
  }, [activeServices, categoryFilter, serviceSearch]);

  const selectedService = useMemo(
    () => activeServices.find((s) => s.id === draft.serviceId) || null,
    [activeServices, draft.serviceId]
  );

  const eligibleStaff = useMemo(() => {
    if (!state || !selectedService) return [];
    return state.staff.filter(
      (member) => member.active && selectedService.specialistIds.includes(member.id)
    );
  }, [state, selectedService]);

  const availableSlots = useMemo(() => {
    if (!state || !selectedService || !draft.date) return [];
    return getAvailableSlots({
      date: draft.date,
      service: selectedService,
      staffPreference: draft.staffId,
      staffList: state.staff,
      appointments: state.appointments,
      settings: state.settings,
    });
  }, [state, selectedService, draft.date, draft.staffId]);

  const selectedSlotObj = useMemo(
    () => availableSlots.find((s) => s.time === draft.startTime) || null,
    [availableSlots, draft.startTime]
  );

  const todayIso = toISODate(new Date());

  const monthDays = useMemo(() => {
    const year = calendarMonth.getFullYear();
    const month = calendarMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const startWeekday = firstDay.getDay(); // 0=Sun
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const cells: Array<{ iso: string; dayNum: number; isSelectable: boolean } | null> = [];
    for (let i = 0; i < startWeekday; i++) {
      cells.push(null);
    }
    for (let d = 1; d <= daysInMonth; d++) {
      const dateObj = new Date(year, month, d);
      const iso = toISODate(dateObj);
      const dayKey = getDayOfWeekKey(iso);
      const isOpen = state?.settings.schedule[dayKey]?.open ?? true;
      const isPast = iso < todayIso;
      const tooFar = iso > toISODate(addDays(new Date(), 60));
      cells.push({
        iso,
        dayNum: d,
        isSelectable: isOpen && !isPast && !tooFar,
      });
    }
    return cells;
  }, [calendarMonth, state, todayIso]);

  const handleSelectService = (serviceId: string) => {
    setDraft((prev) => ({
      ...prev,
      serviceId,
      staffId: 'any',
      startTime: null,
    }));
  };

  const handleConfirmBooking = async () => {
    if (!selectedService || !draft.date || !draft.startTime || !selectedSlotObj) return;
    setSubmitError(null);
    setIsSubmitting(true);
    try {
      const created = await createAppointment({
        customerName: draft.customerName,
        customerEmail: draft.customerEmail,
        customerPhone: draft.customerPhone,
        serviceId: selectedService.id,
        staffId: selectedSlotObj.availableStaffId,
        date: draft.date,
        startTime: draft.startTime,
        notes: draft.notes,
      });
      setConfirmedAppointment(created);
      setStep(6);
    } catch {
      setSubmitError('Could not complete your reservation. Please try another time slot.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleValidateAndAdvanceFromDetails = (e: React.FormEvent) => {
    e.preventDefault();
    const validation = validateCustomerInfo({
      customerName: draft.customerName,
      customerEmail: draft.customerEmail,
      customerPhone: draft.customerPhone,
    });
    setErrors(validation);
    if (Object.keys(validation).length === 0) {
      setStep(5);
    }
  };

  const handleStartNewBooking = () => {
    setConfirmedAppointment(null);
    setDraft({
      serviceId: null,
      staffId: 'any',
      date: null,
      startTime: null,
      customerName: '',
      customerEmail: '',
      customerPhone: '',
      notes: '',
    });
    setErrors({});
    setStep(1);
  };

  if (isLoading || !state) {
    return (
      <PublicLayout>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-16">
          <div className="h-8 w-56 bg-[#17191F]/10 rounded animate-pulse mb-6" />
          <div className="h-96 bg-white border border-[#17191F]/10 rounded-xl animate-pulse" />
        </div>
      </PublicLayout>
    );
  }

  return (
    <PublicLayout>
      <section className="py-8 sm:py-12 lg:py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Studio Header & Stepper */}
          <div className="mb-8 pb-6 border-b border-[#17191F]/10 flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <p className="text-xs font-semibold text-[#4665E8]">{state.settings.businessName}</p>
              <h1 className="font-display text-2xl sm:text-3xl font-semibold tracking-tight text-[#17191F] mt-1">
                Book an appointment
              </h1>
              <p className="text-sm text-[#858A96] mt-1">
                {state.settings.address}
              </p>
            </div>

            <ol aria-label="Booking progress" className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto pb-1">
              {STEP_LABELS.map((label, idx) => {
                const stepNum = idx + 1;
                const isDone = step > stepNum;
                const isCurrent = step === stepNum;
                return (
                  <li key={label} className="flex items-center gap-1.5 shrink-0">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                        isCurrent
                          ? 'bg-[#17191F] text-white'
                          : isDone
                          ? 'bg-[#E8EDFF] text-[#4665E8]'
                          : 'bg-white border border-[#17191F]/10 text-[#858A96]'
                      }`}
                    >
                      <span className="font-mono">{stepNum}</span>
                      <span className="hidden sm:inline">{label}</span>
                    </span>
                  </li>
                );
              })}
            </ol>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Main Step Column */}
            <div className={step === 6 ? 'lg:col-span-12' : 'lg:col-span-8'}>
              {step > 1 && step < 6 && selectedService && (
                <div className="lg:hidden mb-4 bg-white border border-[#17191F]/10 rounded-xl px-4 py-3 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-[#17191F] truncate">
                      {selectedService.name}
                    </p>
                    <p className="text-[11px] text-[#858A96] font-mono tabular-nums truncate">
                      {selectedService.durationMinutes}m
                      {draft.date ? ` · ${draft.date}` : ''}
                      {draft.startTime ? ` · ${formatTime12h(draft.startTime)}` : ''}
                    </p>
                  </div>
                  <span className="font-mono text-sm font-semibold text-[#17191F] tabular-nums shrink-0">
                    {formatCurrency(selectedService.priceCents)}
                  </span>
                </div>
              )}
              {/* STEP 1: Select Service */}
              {step === 1 && (
                <div className="space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <h2 className="font-display text-xl font-semibold text-[#17191F]">
                      1. Select a service
                    </h2>
                    <div className="relative w-full sm:w-64">
                      <Search
                        className="w-4 h-4 text-[#858A96] absolute left-3 top-1/2 -translate-y-1/2"
                        aria-hidden="true"
                      />
                      <input
                        type="search"
                        value={serviceSearch}
                        onChange={(e) => setServiceSearch(e.target.value)}
                        placeholder="Search services..."
                        aria-label="Search services"
                        className="w-full h-10 pl-9 pr-3 rounded-lg bg-white border border-[#17191F]/15 text-sm text-[#17191F] placeholder:text-[#858A96]"
                      />
                    </div>
                  </div>

                  {/* Category Filter Tabs */}
                  <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                    {CATEGORIES.map((cat) => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => setCategoryFilter(cat)}
                        className={`px-3.5 py-2 rounded-lg text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                          categoryFilter === cat
                            ? 'bg-[#17191F] text-white'
                            : 'bg-white border border-[#17191F]/12 text-[#17191F]/75 hover:border-[#17191F]/30'
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>

                  {filteredServices.length === 0 ? (
                    <EmptyState
                      title="No matching services"
                      description="Try clearing your search filter or choosing another category."
                      actionLabel="Show all services"
                      onAction={() => {
                        setCategoryFilter('All');
                        setServiceSearch('');
                      }}
                    />
                  ) : (
                    <div className="space-y-3">
                      {filteredServices.map((svc) => {
                        const isSelected = draft.serviceId === svc.id;
                        return (
                          <button
                            key={svc.id}
                            type="button"
                            onClick={() => handleSelectService(svc.id)}
                            className={`w-full text-left p-5 rounded-xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                              isSelected
                                ? 'bg-white border-[#4665E8] ring-1 ring-[#4665E8]/25'
                                : 'bg-white border-[#17191F]/10 hover:border-[#17191F]/30'
                            }`}
                          >
                            <div className="space-y-1.5">
                              <div className="flex items-center gap-2 text-xs text-[#858A96]">
                                <span>{svc.category}</span>
                                <span aria-hidden="true">·</span>
                                <span className="font-mono tabular-nums">{svc.durationMinutes} min</span>
                              </div>
                              <h3 className="font-display text-base font-semibold text-[#17191F]">
                                {svc.name}
                              </h3>
                              <p className="text-sm text-[#858A96] leading-relaxed max-w-xl">
                                {svc.description}
                              </p>
                            </div>
                            <div className="flex sm:flex-col items-center sm:items-end justify-between gap-2 shrink-0">
                              <span className="font-mono text-lg font-semibold text-[#17191F] tabular-nums">
                                {formatCurrency(svc.priceCents)}
                              </span>
                              <span
                                className={`text-xs font-semibold ${
                                  isSelected ? 'text-[#4665E8]' : 'text-[#858A96]'
                                }`}
                              >
                                {isSelected ? 'Selected' : 'Select'}
                              </span>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  )}

                  {/* Optional Specialist Selector once a service is chosen */}
                  {selectedService && (
                    <div className="bg-white border border-[#17191F]/10 rounded-xl p-5 space-y-3">
                      <p className="text-sm font-semibold text-[#17191F]">
                        Preferred specialist (optional)
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        <button
                          type="button"
                          onClick={() => setDraft((p) => ({ ...p, staffId: 'any', startTime: null }))}
                          className={`p-3 rounded-lg border text-left transition-colors ${
                            draft.staffId === 'any'
                              ? 'border-[#4665E8] bg-[#E8EDFF]/40'
                              : 'border-[#17191F]/12 hover:border-[#17191F]/30'
                          }`}
                        >
                          <p className="text-xs font-semibold text-[#17191F]">Any available specialist</p>
                          <p className="text-xs text-[#858A96] mt-0.5">Maximum open times</p>
                        </button>
                        {eligibleStaff.map((member) => (
                          <button
                            key={member.id}
                            type="button"
                            onClick={() =>
                              setDraft((p) => ({ ...p, staffId: member.id, startTime: null }))
                            }
                            className={`p-3 rounded-lg border text-left flex items-center gap-3 transition-colors ${
                              draft.staffId === member.id
                                ? 'border-[#4665E8] bg-[#E8EDFF]/40'
                                : 'border-[#17191F]/12 hover:border-[#17191F]/30'
                            }`}
                          >
                            <img
                              src={member.avatarUrl}
                              alt={member.name}
                              referrerPolicy="no-referrer"
                              className="w-9 h-9 rounded-full object-cover bg-[#E8EDFF] shrink-0"
                            />
                            <div className="min-w-0">
                              <p className="text-xs font-semibold text-[#17191F] truncate">
                                {member.name}
                              </p>
                              <p className="text-[11px] text-[#858A96] truncate">{member.role}</p>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex justify-end pt-2">
                    <Button
                      variant="primary"
                      size="lg"
                      disabled={!selectedService}
                      onClick={() => setStep(2)}
                    >
                      <span>Continue to Date</span>
                      <ArrowRight className="w-4 h-4" aria-hidden="true" />
                    </Button>
                  </div>
                </div>
              )}

              {/* STEP 2: Choose Available Date */}
              {step === 2 && (
                <div className="bg-white border border-[#17191F]/10 rounded-xl p-5 sm:p-8 space-y-6">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <h2 className="font-display text-xl font-semibold text-[#17191F]">
                        2. Choose an available date
                      </h2>
                      <p className="text-xs text-[#858A96] mt-1">
                        Closed studio days and past dates are automatically disabled.
                      </p>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        aria-label="Previous month"
                        onClick={() =>
                          setCalendarMonth(
                            (m) => new Date(m.getFullYear(), m.getMonth() - 1, 1)
                          )
                        }
                        className="w-9 h-9 rounded-lg border border-[#17191F]/15 flex items-center justify-center hover:bg-[#F8F7F3]"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                      <span className="font-display text-sm font-semibold px-2 min-w-[125px] text-center">
                        {new Intl.DateTimeFormat('en-US', {
                          month: 'long',
                          year: 'numeric',
                        }).format(calendarMonth)}
                      </span>
                      <button
                        type="button"
                        aria-label="Next month"
                        onClick={() =>
                          setCalendarMonth(
                            (m) => new Date(m.getFullYear(), m.getMonth() + 1, 1)
                          )
                        }
                        className="w-9 h-9 rounded-lg border border-[#17191F]/15 flex items-center justify-center hover:bg-[#F8F7F3]"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div>
                    <div className="grid grid-cols-7 gap-1 text-center text-xs font-medium text-[#858A96] pb-2">
                      {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
                        <div key={d} className="py-1">
                          {d}
                        </div>
                      ))}
                    </div>
                    <div className="grid grid-cols-7 gap-1.5">
                      {monthDays.map((cell, i) => {
                        if (!cell) {
                          return <div key={`empty-${i}`} className="h-11" />;
                        }
                        const isSelected = draft.date === cell.iso;
                        const isToday = cell.iso === todayIso;
                        return (
                          <button
                            key={cell.iso}
                            type="button"
                            disabled={!cell.isSelectable}
                            aria-label={`Select ${cell.iso}`}
                            aria-pressed={isSelected}
                            onClick={() =>
                              setDraft((prev) => ({
                                ...prev,
                                date: cell.iso,
                                startTime: null,
                              }))
                            }
                            className={`h-11 rounded-lg font-mono text-sm tabular-nums transition-colors flex flex-col items-center justify-center ${
                              isSelected
                                ? 'bg-[#4665E8] text-white font-semibold'
                                : cell.isSelectable
                                ? 'bg-[#F8F7F3] text-[#17191F] hover:bg-[#E8EDFF] hover:text-[#4665E8]'
                                : 'text-[#858A96]/40 cursor-not-allowed'
                            } ${isToday && !isSelected ? 'ring-1 ring-[#17191F]/30' : ''}`}
                          >
                            <span>{cell.dayNum}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-[#17191F]/10">
                    <Button variant="outline" onClick={() => setStep(1)}>
                      <ArrowLeft className="w-4 h-4" aria-hidden="true" />
                      <span>Back</span>
                    </Button>
                    <Button
                      variant="primary"
                      disabled={!draft.date}
                      onClick={() => setStep(3)}
                    >
                      <span>Choose Time</span>
                      <ArrowRight className="w-4 h-4" aria-hidden="true" />
                    </Button>
                  </div>
                </div>
              )}

              {/* STEP 3: Select Available Time */}
              {step === 3 && (
                <div className="bg-white border border-[#17191F]/10 rounded-xl p-5 sm:p-8 space-y-6">
                  <div>
                    <h2 className="font-display text-xl font-semibold text-[#17191F]">
                      3. Select an available time
                    </h2>
                    <p className="text-sm text-[#858A96] mt-1">
                      Showing open slots for{' '}
                      <span className="font-medium text-[#17191F]">
                        {draft.date ? formatFullDate(draft.date) : ''}
                      </span>
                    </p>
                  </div>

                  {availableSlots.length === 0 ? (
                    <EmptyState
                      title="No open times on this date"
                      description="All specialist slots are booked or the lead-time window has passed for today. Please choose another date."
                      actionLabel="Pick another date"
                      onAction={() => setStep(2)}
                    />
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
                      {availableSlots.map((slot) => {
                        const isSelected = draft.startTime === slot.time;
                        return (
                          <button
                            key={slot.time}
                            type="button"
                            onClick={() =>
                              setDraft((prev) => ({ ...prev, startTime: slot.time }))
                            }
                            className={`p-3 rounded-lg border text-left transition-all ${
                              isSelected
                                ? 'bg-[#17191F] text-white border-[#17191F]'
                                : 'bg-white text-[#17191F] border-[#17191F]/15 hover:border-[#4665E8]'
                            }`}
                          >
                            <p className="font-mono text-sm font-semibold tabular-nums">
                              {slot.label}
                            </p>
                            <p
                              className={`text-[11px] truncate mt-0.5 ${
                                isSelected ? 'text-white/75' : 'text-[#858A96]'
                              }`}
                            >
                              {slot.availableStaffName}
                            </p>
                          </button>
                        );
                      })}
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-4 border-t border-[#17191F]/10">
                    <Button variant="outline" onClick={() => setStep(2)}>
                      <ArrowLeft className="w-4 h-4" aria-hidden="true" />
                      <span>Back</span>
                    </Button>
                    <Button
                      variant="primary"
                      disabled={!draft.startTime}
                      onClick={() => setStep(4)}
                    >
                      <span>Enter Your Details</span>
                      <ArrowRight className="w-4 h-4" aria-hidden="true" />
                    </Button>
                  </div>
                </div>
              )}

              {/* STEP 4: Customer Information */}
              {step === 4 && (
                <form
                  onSubmit={handleValidateAndAdvanceFromDetails}
                  noValidate
                  className="bg-white border border-[#17191F]/10 rounded-xl p-5 sm:p-8 space-y-5"
                >
                  <div>
                    <h2 className="font-display text-xl font-semibold text-[#17191F]">
                      4. Your contact details
                    </h2>
                    <p className="text-sm text-[#858A96] mt-1">
                      We will send your confirmation code and calendar reminder here.
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label
                        htmlFor="booking-name"
                        className="block text-xs font-semibold text-[#17191F] mb-1.5"
                      >
                        Full Name *
                      </label>
                      <input
                        id="booking-name"
                        type="text"
                        required
                        value={draft.customerName}
                        onChange={(e) => {
                          setDraft((p) => ({ ...p, customerName: e.target.value }));
                          if (errors.customerName) setErrors((er) => ({ ...er, customerName: undefined }));
                        }}
                        placeholder="e.g. Maya Lin"
                        className="w-full h-11 px-3.5 rounded-lg border border-[#17191F]/15 bg-white text-sm text-[#17191F]"
                      />
                      {errors.customerName && (
                        <p className="text-xs text-[#DC2626] mt-1.5" role="alert">
                          {errors.customerName}
                        </p>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label
                          htmlFor="booking-email"
                          className="block text-xs font-semibold text-[#17191F] mb-1.5"
                        >
                          Email Address *
                        </label>
                        <input
                          id="booking-email"
                          type="email"
                          required
                          value={draft.customerEmail}
                          onChange={(e) => {
                            setDraft((p) => ({ ...p, customerEmail: e.target.value }));
                            if (errors.customerEmail) setErrors((er) => ({ ...er, customerEmail: undefined }));
                          }}
                          placeholder="maya@example.com"
                          className="w-full h-11 px-3.5 rounded-lg border border-[#17191F]/15 bg-white text-sm text-[#17191F]"
                        />
                        {errors.customerEmail && (
                          <p className="text-xs text-[#DC2626] mt-1.5" role="alert">
                            {errors.customerEmail}
                          </p>
                        )}
                      </div>

                      <div>
                        <label
                          htmlFor="booking-phone"
                          className="block text-xs font-semibold text-[#17191F] mb-1.5"
                        >
                          Phone Number *
                        </label>
                        <input
                          id="booking-phone"
                          type="tel"
                          required
                          value={draft.customerPhone}
                          onChange={(e) => {
                            setDraft((p) => ({ ...p, customerPhone: e.target.value }));
                            if (errors.customerPhone) setErrors((er) => ({ ...er, customerPhone: undefined }));
                          }}
                          placeholder="+1 (415) 555-0192"
                          className="w-full h-11 px-3.5 rounded-lg border border-[#17191F]/15 bg-white text-sm text-[#17191F]"
                        />
                        {errors.customerPhone && (
                          <p className="text-xs text-[#DC2626] mt-1.5" role="alert">
                            {errors.customerPhone}
                          </p>
                        )}
                      </div>
                    </div>

                    <div>
                      <label
                        htmlFor="booking-notes"
                        className="block text-xs font-semibold text-[#17191F] mb-1.5"
                      >
                        Visit Notes (optional)
                      </label>
                      <textarea
                        id="booking-notes"
                        rows={3}
                        value={draft.notes}
                        onChange={(e) => setDraft((p) => ({ ...p, notes: e.target.value }))}
                        placeholder="Any styling preferences, sensitivities, or arrival notes..."
                        className="w-full p-3.5 rounded-lg border border-[#17191F]/15 bg-white text-sm text-[#17191F]"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-[#17191F]/10">
                    <Button type="button" variant="outline" onClick={() => setStep(3)}>
                      <ArrowLeft className="w-4 h-4" aria-hidden="true" />
                      <span>Back</span>
                    </Button>
                    <Button type="submit" variant="primary">
                      <span>Review Booking</span>
                      <ArrowRight className="w-4 h-4" aria-hidden="true" />
                    </Button>
                  </div>
                </form>
              )}

              {/* STEP 5: Review Booking Details */}
              {step === 5 && selectedService && draft.date && draft.startTime && (
                <div className="bg-white border border-[#17191F]/10 rounded-xl p-5 sm:p-8 space-y-6">
                  <div>
                    <h2 className="font-display text-xl font-semibold text-[#17191F]">
                      5. Review your reservation
                    </h2>
                    <p className="text-sm text-[#858A96] mt-1">
                      Confirm every detail below before locking in your time slot.
                    </p>
                  </div>

                  <div className="divide-y divide-[#17191F]/10 border-y border-[#17191F]/10">
                    <div className="py-4 flex items-start justify-between gap-4">
                      <div>
                        <p className="text-xs text-[#858A96]">Service & Price</p>
                        <p className="font-display text-base font-semibold text-[#17191F] mt-0.5">
                          {selectedService.name}
                        </p>
                        <p className="text-xs text-[#858A96] mt-0.5 font-mono tabular-nums">
                          {selectedService.durationMinutes} min · {formatCurrency(selectedService.priceCents)}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setStep(1)}
                        className="text-xs font-semibold text-[#4665E8] hover:underline"
                      >
                        Edit
                      </button>
                    </div>

                    <div className="py-4 flex items-start justify-between gap-4">
                      <div>
                        <p className="text-xs text-[#858A96]">Date, Time & Specialist</p>
                        <p className="text-sm font-semibold text-[#17191F] mt-0.5">
                          {formatFullDate(draft.date)} at {formatTime12h(draft.startTime)}
                        </p>
                        <p className="text-xs text-[#858A96] mt-0.5">
                          With {selectedSlotObj?.availableStaffName}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setStep(2)}
                        className="text-xs font-semibold text-[#4665E8] hover:underline"
                      >
                        Edit
                      </button>
                    </div>

                    <div className="py-4 flex items-start justify-between gap-4">
                      <div>
                        <p className="text-xs text-[#858A96]">Client Information</p>
                        <p className="text-sm font-semibold text-[#17191F] mt-0.5">
                          {draft.customerName}
                        </p>
                        <p className="text-xs text-[#858A96] mt-0.5">
                          {draft.customerEmail} · {draft.customerPhone}
                        </p>
                        {draft.notes && (
                          <p className="text-xs text-[#17191F]/80 mt-1.5 italic">
                            “{draft.notes}”
                          </p>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => setStep(4)}
                        className="text-xs font-semibold text-[#4665E8] hover:underline"
                      >
                        Edit
                      </button>
                    </div>
                  </div>

                  <p className="text-xs text-[#858A96] bg-[#F8F7F3] p-3.5 rounded-lg">
                    Cancellation policy: Free rescheduling up to {state.settings.cancellationWindowHours} hours prior to your scheduled time.
                  </p>

                  {submitError && (
                    <p className="text-xs text-[#DC2626]" role="alert">
                      {submitError}
                    </p>
                  )}

                  <div className="flex items-center justify-between pt-2">
                    <Button variant="outline" onClick={() => setStep(4)}>
                      <ArrowLeft className="w-4 h-4" aria-hidden="true" />
                      <span>Back</span>
                    </Button>
                    <Button
                      variant="primary"
                      size="lg"
                      disabled={isSubmitting}
                      onClick={handleConfirmBooking}
                    >
                      <Check className="w-4 h-4" aria-hidden="true" />
                      <span>{isSubmitting ? 'Confirming...' : 'Confirm Appointment'}</span>
                    </Button>
                  </div>
                </div>
              )}

              {/* STEP 6: Confirmation */}
              {step === 6 && confirmedAppointment && (
                <div className="max-w-2xl mx-auto bg-white border border-[#17191F]/12 rounded-xl p-6 sm:p-10 text-center space-y-6">
                  <div className="w-12 h-12 rounded-full bg-[#E8EDFF] text-[#4665E8] flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-6 h-6" aria-hidden="true" />
                  </div>

                  <div>
                    <p className="font-mono text-xs font-semibold text-[#4665E8]">
                      Booking Reference · {confirmedAppointment.bookingCode}
                    </p>
                    <h2 className="font-display text-2xl sm:text-3xl font-semibold text-[#17191F] mt-2">
                      You’re booked, {confirmedAppointment.customerName.split(' ')[0]}.
                    </h2>
                    <p className="text-sm text-[#858A96] mt-2">
                      A confirmation has been logged for {confirmedAppointment.customerEmail}.
                    </p>
                  </div>

                  <div className="bg-[#F8F7F3] border border-[#17191F]/10 rounded-xl p-5 text-left grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-xs text-[#858A96]">Service</p>
                      <p className="font-semibold text-[#17191F] mt-0.5">
                        {confirmedAppointment.serviceName}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-[#858A96]">Specialist</p>
                      <p className="font-semibold text-[#17191F] mt-0.5">
                        {confirmedAppointment.staffName}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-[#858A96]">Date & Time</p>
                      <p className="font-semibold text-[#17191F] mt-0.5 font-mono text-xs tabular-nums">
                        {formatFullDate(confirmedAppointment.date)} ·{' '}
                        {formatTime12h(confirmedAppointment.startTime)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-[#858A96]">Studio Total</p>
                      <p className="font-semibold text-[#17191F] mt-0.5 font-mono tabular-nums">
                        {formatCurrency(confirmedAppointment.priceCents)} ({confirmedAppointment.durationMinutes} min)
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                    <Link
                      to="/dashboard/appointments"
                      className="w-full sm:w-auto inline-flex items-center justify-center h-11 px-6 rounded-lg bg-[#17191F] text-white text-sm font-semibold hover:bg-[#2A2D37] transition-colors"
                    >
                      View in Admin Dashboard
                    </Link>
                    <Button
                      variant="outline"
                      size="lg"
                      onClick={handleStartNewBooking}
                      className="w-full sm:w-auto"
                    >
                      Book Another Visit
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {/* Persistent Desktop / Tablet Summary Sidebar */}
            {step < 6 && (
              <aside className="lg:col-span-4 bg-white border border-[#17191F]/10 rounded-xl p-5 sm:p-6 lg:sticky lg:top-24 space-y-5">
                <div>
                  <p className="text-xs font-semibold text-[#4665E8]">Appointment Summary</p>
                  <h3 className="font-display text-lg font-semibold text-[#17191F] mt-1">
                    {selectedService ? selectedService.name : 'No service selected yet'}
                  </h3>
                </div>

                <div className="space-y-3 pt-4 border-t border-[#17191F]/10 text-sm">
                  <div className="flex items-center justify-between gap-3">
                    <span className="inline-flex items-center gap-2 text-[#858A96]">
                      <Clock className="w-4 h-4 shrink-0" aria-hidden="true" />
                      <span>Duration</span>
                    </span>
                    <span className="font-mono text-xs font-medium text-[#17191F] tabular-nums">
                      {selectedService ? `${selectedService.durationMinutes} min` : '—'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-3">
                    <span className="inline-flex items-center gap-2 text-[#858A96]">
                      <CalendarIcon className="w-4 h-4 shrink-0" aria-hidden="true" />
                      <span>Date & Time</span>
                    </span>
                    <span className="font-mono text-xs font-medium text-[#17191F] text-right tabular-nums">
                      {draft.date
                        ? `${draft.date}${draft.startTime ? ` · ${formatTime12h(draft.startTime)}` : ''}`
                        : '—'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-3">
                    <span className="inline-flex items-center gap-2 text-[#858A96]">
                      <User className="w-4 h-4 shrink-0" aria-hidden="true" />
                      <span>Specialist</span>
                    </span>
                    <span className="text-xs font-medium text-[#17191F] text-right">
                      {selectedSlotObj
                        ? selectedSlotObj.availableStaffName
                        : draft.staffId === 'any'
                        ? 'Any available'
                        : state.staff.find((s) => s.id === draft.staffId)?.name || '—'}
                    </span>
                  </div>
                </div>

                <div className="pt-4 border-t border-[#17191F]/10 flex items-center justify-between">
                  <span className="text-sm font-medium text-[#17191F]">Estimated Total</span>
                  <span className="font-mono text-lg font-semibold text-[#17191F] tabular-nums">
                    {selectedService ? formatCurrency(selectedService.priceCents) : '$0'}
                  </span>
                </div>
              </aside>
            )}
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
