import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Calendar, Clock, CheckCircle2 } from 'lucide-react';
import { useBookly } from '../../hooks/useBookly';
import { formatCurrency, formatTime12h, toISODate } from '../../utils/scheduling';
import { StatusIndicator } from '../../components/UI';

type PreviewTab = 'schedule' | 'booking' | 'revenue';

export function InteractivePreview() {
  const [activeTab, setActiveTab] = useState<PreviewTab>('schedule');
  const [selectedSlot, setSelectedSlot] = useState('11:30');
  const [selectedServiceId, setSelectedServiceId] = useState('svc-cut');
  const { state } = useBookly();

  const todayIso = toISODate(new Date());
  const todaysAppointments =
    state?.appointments
      .filter((a) => a.date === todayIso)
      .sort((a, b) => a.startTime.localeCompare(b.startTime))
      .slice(0, 4) || [];

  const services = state?.services.slice(0, 3) || [];
  const activeService = services.find((s) => s.id === selectedServiceId) || services[0];

  const previewSlots = ['09:30', '10:30', '11:30', '14:00', '15:30', '16:30'];

  const revenueBars = [
    { day: 'Mon', amount: 640, height: 54 },
    { day: 'Tue', amount: 820, height: 68 },
    { day: 'Wed', amount: 1140, height: 92 },
    { day: 'Thu', amount: 960, height: 78 },
    { day: 'Fri', amount: 1290, height: 100 },
    { day: 'Sat', amount: 1080, height: 86 },
  ];

  return (
    <section className="py-16 lg:py-24 border-t border-[#17191F]/10 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-10">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold text-[#4665E8] mb-2">Interactive Workspace Preview</p>
            <h2 className="font-display text-2xl sm:text-3xl lg:text-4xl font-semibold tracking-tight text-[#17191F] text-balance">
              One connected system for your front desk and your clients.
            </h2>
          </div>

          <div
            role="tablist"
            aria-label="Preview modes"
            className="inline-flex items-center gap-1 p-1 bg-[#F8F7F3] border border-[#17191F]/10 rounded-lg self-start lg:self-auto overflow-x-auto max-w-full"
          >
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'schedule'}
              onClick={() => setActiveTab('schedule')}
              className={`px-3.5 py-2 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
                activeTab === 'schedule'
                  ? 'bg-white text-[#17191F] shadow-sm'
                  : 'text-[#858A96] hover:text-[#17191F]'
              }`}
            >
              Day Schedule
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'booking'}
              onClick={() => setActiveTab('booking')}
              className={`px-3.5 py-2 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
                activeTab === 'booking'
                  ? 'bg-white text-[#17191F] shadow-sm'
                  : 'text-[#858A96] hover:text-[#17191F]'
              }`}
            >
              Client Booking
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'revenue'}
              onClick={() => setActiveTab('revenue')}
              className={`px-3.5 py-2 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
                activeTab === 'revenue'
                  ? 'bg-white text-[#17191F] shadow-sm'
                  : 'text-[#858A96] hover:text-[#17191F]'
              }`}
            >
              Studio Revenue
            </button>
          </div>
        </div>

        <div className="rounded-xl border border-[#17191F]/12 bg-[#F8F7F3] overflow-hidden">
          {/* Minimal Chrome Bar */}
          <div className="px-5 py-3.5 bg-white border-b border-[#17191F]/10 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 text-xs text-[#858A96]">
              <span className="font-semibold text-[#17191F]">Atelier Mercer</span>
              <span aria-hidden="true">·</span>
              <span>
                {activeTab === 'schedule' && 'Floor Queue & Daily Appointments'}
                {activeTab === 'booking' && 'Self-Serve Client Scheduling'}
                {activeTab === 'revenue' && 'Weekly Utilization & Ticket Summary'}
              </span>
            </div>
            <Link
              to={activeTab === 'booking' ? '/book' : '/dashboard'}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#4665E8] hover:underline whitespace-nowrap shrink-0"
            >
              <span>{activeTab === 'booking' ? 'Launch Full Booking Flow' : 'Open Live Dashboard'}</span>
              <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
            </Link>
          </div>

          {/* Preview Body */}
          <div className="p-5 sm:p-8">
            {activeTab === 'schedule' && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <div className="lg:col-span-8 bg-white border border-[#17191F]/10 rounded-xl overflow-hidden">
                  <div className="px-5 py-4 border-b border-[#17191F]/8 flex items-center justify-between">
                    <h3 className="font-display text-sm font-semibold text-[#17191F]">
                      Today’s Appointments
                    </h3>
                    <span className="text-xs font-mono tabular-nums text-[#858A96]">
                      {todaysAppointments.length} scheduled
                    </span>
                  </div>
                  <div className="divide-y divide-[#17191F]/8">
                    {todaysAppointments.map((appt) => (
                      <div
                        key={appt.id}
                        className="px-5 py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 hover:bg-[#F8F7F3]/60 transition-colors"
                      >
                        <div className="flex items-center gap-4 min-w-0">
                          <span className="font-mono text-xs font-medium text-[#17191F] tabular-nums w-16 shrink-0">
                            {formatTime12h(appt.startTime)}
                          </span>
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-[#17191F] truncate">
                              {appt.customerName}
                            </p>
                            <p className="text-xs text-[#858A96] truncate">
                              {appt.serviceName} · {appt.staffName}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center justify-between sm:justify-end gap-5">
                          <span className="font-mono text-xs font-medium text-[#17191F] tabular-nums">
                            {formatCurrency(appt.priceCents)}
                          </span>
                          <StatusIndicator status={appt.status} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="lg:col-span-4 space-y-4">
                  <div className="bg-white border border-[#17191F]/10 rounded-xl p-5">
                    <p className="text-xs font-medium text-[#858A96]">Chair Utilization Today</p>
                    <p className="font-display text-3xl font-semibold text-[#17191F] tabular-nums mt-2">
                      84%
                    </p>
                    <div className="mt-3 h-2 bg-[#F8F7F3] rounded-full overflow-hidden">
                      <div className="h-full bg-[#4665E8] rounded-full w-[84%]" />
                    </div>
                    <p className="text-xs text-[#858A96] mt-3">
                      15-minute sanitization buffers automatically enforced between visits.
                    </p>
                  </div>
                  <div className="bg-white border border-[#17191F]/10 rounded-xl p-5">
                    <p className="text-xs font-medium text-[#858A96]">On-Time Confirmation Rate</p>
                    <p className="font-display text-3xl font-semibold text-[#17191F] tabular-nums mt-2">
                      96.4%
                    </p>
                    <p className="text-xs text-[#858A96] mt-2">
                      Automated SMS & email reminders sent 24 hours prior.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'booking' && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <div className="lg:col-span-7 bg-white border border-[#17191F]/10 rounded-xl p-5 sm:p-6 space-y-5">
                  <div>
                    <h3 className="font-display text-sm font-semibold text-[#17191F]">
                      1. Choose a studio service
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-3">
                      {services.map((svc) => {
                        const selected = svc.id === activeService?.id;
                        return (
                          <button
                            key={svc.id}
                            type="button"
                            onClick={() => setSelectedServiceId(svc.id)}
                            className={`text-left p-3.5 rounded-lg border transition-all ${
                              selected
                                ? 'border-[#4665E8] bg-[#E8EDFF]/45'
                                : 'border-[#17191F]/12 bg-white hover:border-[#17191F]/30'
                            }`}
                          >
                            <p className="text-xs font-semibold text-[#17191F] leading-snug">
                              {svc.name}
                            </p>
                            <p className="text-xs text-[#858A96] mt-1.5 font-mono tabular-nums">
                              {svc.durationMinutes}m · {formatCurrency(svc.priceCents)}
                            </p>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <h3 className="font-display text-sm font-semibold text-[#17191F]">
                      2. Pick an open time
                    </h3>
                    <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 mt-3">
                      {previewSlots.map((slot) => {
                        const active = slot === selectedSlot;
                        return (
                          <button
                            key={slot}
                            type="button"
                            onClick={() => setSelectedSlot(slot)}
                            className={`h-10 rounded-lg border font-mono text-xs tabular-nums transition-colors ${
                              active
                                ? 'bg-[#17191F] text-white border-[#17191F]'
                                : 'bg-white text-[#17191F] border-[#17191F]/12 hover:border-[#4665E8]'
                            }`}
                          >
                            {formatTime12h(slot)}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                <div className="lg:col-span-5 bg-white border border-[#17191F]/10 rounded-xl p-5 sm:p-6 flex flex-col justify-between">
                  <div>
                    <p className="text-xs font-semibold text-[#4665E8]">Live Summary</p>
                    <h4 className="font-display text-lg font-semibold text-[#17191F] mt-1">
                      {activeService?.name || 'Signature Precision Cut'}
                    </h4>
                    <div className="mt-4 space-y-2.5 text-sm text-[#17191F]/80 border-t border-[#17191F]/8 pt-4">
                      <div className="flex items-center justify-between">
                        <span className="inline-flex items-center gap-2 text-[#858A96]">
                          <Calendar className="w-4 h-4" aria-hidden="true" />
                          Selected Time
                        </span>
                        <span className="font-mono text-xs font-medium text-[#17191F] tabular-nums">
                          Today, {formatTime12h(selectedSlot)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="inline-flex items-center gap-2 text-[#858A96]">
                          <Clock className="w-4 h-4" aria-hidden="true" />
                          Duration
                        </span>
                        <span className="font-mono text-xs font-medium text-[#17191F] tabular-nums">
                          {activeService?.durationMinutes || 45} minutes
                        </span>
                      </div>
                      <div className="flex items-center justify-between pt-2 border-t border-[#17191F]/8">
                        <span className="font-medium text-[#17191F]">Total</span>
                        <span className="font-mono text-base font-semibold text-[#17191F] tabular-nums">
                          {formatCurrency(activeService?.priceCents || 7500)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <Link
                    to="/book"
                    className="mt-6 w-full h-10 rounded-lg bg-[#4665E8] text-white text-xs font-semibold flex items-center justify-center gap-2 hover:bg-[#3754D4] transition-colors"
                  >
                    <CheckCircle2 className="w-4 h-4" aria-hidden="true" />
                    <span>Continue to Full Booking</span>
                  </Link>
                </div>
              </div>
            )}

            {activeTab === 'revenue' && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <div className="lg:col-span-8 bg-white border border-[#17191F]/10 rounded-xl p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="font-display text-sm font-semibold text-[#17191F]">
                        Weekly Gross Bookings
                      </h3>
                      <p className="text-xs text-[#858A96] mt-0.5">
                        Monday through Saturday studio throughput
                      </p>
                    </div>
                    <span className="font-mono text-lg font-semibold text-[#17191F] tabular-nums">
                      $5,930
                    </span>
                  </div>
                  <div className="grid grid-cols-6 gap-3 sm:gap-4 items-end h-44 pt-4">
                    {revenueBars.map((bar) => (
                      <div key={bar.day} className="flex flex-col items-center gap-2 h-full justify-end">
                        <span className="font-mono text-[11px] text-[#858A96] tabular-nums">
                          ${bar.amount}
                        </span>
                        <div className="w-full max-w-[44px] bg-[#E8EDFF] rounded-t-md h-32 flex items-end overflow-hidden">
                          <div
                            className="w-full bg-[#4665E8] rounded-t-md transition-all duration-300"
                            style={{ height: `${bar.height}%` }}
                          />
                        </div>
                        <span className="text-xs font-medium text-[#17191F]">{bar.day}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="lg:col-span-4 bg-white border border-[#17191F]/10 rounded-xl p-6 flex flex-col justify-between">
                  <div className="space-y-4">
                    <div>
                      <p className="text-xs text-[#858A96]">Average Ticket Value</p>
                      <p className="font-display text-2xl font-semibold text-[#17191F] tabular-nums mt-1">
                        $98.80
                      </p>
                    </div>
                    <div className="pt-4 border-t border-[#17191F]/8">
                      <p className="text-xs text-[#858A96]">Repeat Client Ratio</p>
                      <p className="font-display text-2xl font-semibold text-[#17191F] tabular-nums mt-1">
                        71.4%
                      </p>
                    </div>
                    <div className="pt-4 border-t border-[#17191F]/8">
                      <p className="text-xs text-[#858A96]">Top Category</p>
                      <p className="text-sm font-semibold text-[#17191F] mt-1">
                        Hair & Grooming · 48% share
                      </p>
                    </div>
                  </div>
                  <Link
                    to="/dashboard/analytics"
                    className="mt-6 text-xs font-semibold text-[#4665E8] inline-flex items-center gap-1.5 hover:underline"
                  >
                    <span>Explore full analytics</span>
                    <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
