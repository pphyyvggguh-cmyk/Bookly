import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Plus } from 'lucide-react';
import { DashboardLayout } from '../../layouts/DashboardLayout';
import { useBookly } from '../../hooks/useBookly';
import { Button, DashboardSkeleton, EmptyState, StatusIndicator } from '../../components/UI';
import { NewAppointmentModal } from '../../features/dashboard/NewAppointmentModal';
import {
  computeAnalytics,
  formatCurrency,
  formatDateReadable,
  formatTime12h,
  toISODate,
} from '../../utils/scheduling';

export function OverviewPage() {
  const { state, isLoading, updateAppointmentStatus } = useBookly();
  const [newModalOpen, setNewModalOpen] = useState(false);

  const todayIso = toISODate(new Date());

  const metrics = useMemo(() => {
    if (!state) return null;
    const todaysAppts = state.appointments.filter(
      (a) => a.date === todayIso && a.status !== 'cancelled'
    );
    const upcomingAppts = state.appointments
      .filter((a) => a.date >= todayIso && a.status !== 'cancelled' && a.status !== 'completed')
      .sort((a, b) => `${a.date}${a.startTime}`.localeCompare(`${b.date}${b.startTime}`));

    const pendingCount = state.appointments.filter((a) => a.status === 'pending').length;
    const analytics7d = computeAnalytics({
      appointments: state.appointments,
      services: state.services,
      staff: state.staff,
      rangeDays: 7,
    });

    return {
      todaysCount: todaysAppts.length,
      upcomingAppts,
      pendingCount,
      analytics7d,
    };
  }, [state, todayIso]);

  return (
    <DashboardLayout
      headerAction={
        <Button variant="primary" size="sm" onClick={() => setNewModalOpen(true)}>
          <Plus className="w-3.5 h-3.5" aria-hidden="true" />
          <span>New Appointment</span>
        </Button>
      }
    >
      {isLoading || !state || !metrics ? (
        <DashboardSkeleton />
      ) : (
        <div className="space-y-6">
          {/* 4 Summary KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white border border-[#17191F]/10 rounded-xl p-5">
              <p className="text-xs font-medium text-[#858A96]">Today’s Schedule</p>
              <p className="font-display text-3xl font-semibold text-[#17191F] tabular-nums mt-2">
                {metrics.todaysCount}
              </p>
              <p className="text-xs text-[#858A96] mt-1.5">
                {metrics.pendingCount} awaiting confirmation
              </p>
            </div>

            <div className="bg-white border border-[#17191F]/10 rounded-xl p-5">
              <p className="text-xs font-medium text-[#858A96]">7-Day Revenue</p>
              <p className="font-display text-3xl font-semibold text-[#17191F] tabular-nums mt-2">
                {formatCurrency(metrics.analytics7d.totalRevenueCents)}
              </p>
              <p className="text-xs text-[#858A96] mt-1.5 font-mono tabular-nums">
                {metrics.analytics7d.totalBookings} active bookings
              </p>
            </div>

            <div className="bg-white border border-[#17191F]/10 rounded-xl p-5">
              <p className="text-xs font-medium text-[#858A96]">Average Ticket</p>
              <p className="font-display text-3xl font-semibold text-[#17191F] tabular-nums mt-2">
                {formatCurrency(metrics.analytics7d.averageTicketCents)}
              </p>
              <p className="text-xs text-[#858A96] mt-1.5">Per completed or booked visit</p>
            </div>

            <div className="bg-white border border-[#17191F]/10 rounded-xl p-5">
              <p className="text-xs font-medium text-[#858A96]">Client Retention</p>
              <p className="font-display text-3xl font-semibold text-[#17191F] tabular-nums mt-2">
                {metrics.analytics7d.retentionRatePercent}%
              </p>
              <p className="text-xs text-[#858A96] mt-1.5">Repeat clients across studio</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Upcoming Appointments */}
            <div className="lg:col-span-8 bg-white border border-[#17191F]/10 rounded-xl overflow-hidden">
              <div className="px-6 py-4 border-b border-[#17191F]/10 flex items-center justify-between gap-4">
                <div>
                  <h2 className="font-display text-base font-semibold text-[#17191F]">
                    Upcoming Appointments
                  </h2>
                  <p className="text-xs text-[#858A96]">
                    Next scheduled studio visits across all specialists
                  </p>
                </div>
                <Link
                  to="/dashboard/appointments"
                  className="inline-flex items-center gap-1 text-xs font-semibold text-[#4665E8] hover:underline whitespace-nowrap shrink-0"
                >
                  <span>View all</span>
                  <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
                </Link>
              </div>

              {metrics.upcomingAppts.length === 0 ? (
                <div className="p-6">
                  <EmptyState
                    title="No upcoming appointments"
                    description="Your schedule is currently open. Add a walk-in or share your booking link."
                    actionLabel="Create Appointment"
                    onAction={() => setNewModalOpen(true)}
                  />
                </div>
              ) : (
                <div className="divide-y divide-[#17191F]/8">
                  {metrics.upcomingAppts.slice(0, 6).map((appt) => (
                    <div
                      key={appt.id}
                      className="px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-[#F8F7F3]/50 transition-colors"
                    >
                      <div className="min-w-0 space-y-1">
                        <div className="flex items-center gap-2 text-xs text-[#858A96] font-mono tabular-nums">
                          <span>{appt.date === todayIso ? 'Today' : formatDateReadable(appt.date)}</span>
                          <span aria-hidden="true">·</span>
                          <span className="text-[#17191F] font-medium">
                            {formatTime12h(appt.startTime)}
                          </span>
                          <span aria-hidden="true">·</span>
                          <span>{appt.bookingCode}</span>
                        </div>
                        <p className="text-sm font-semibold text-[#17191F] truncate">
                          {appt.customerName}
                        </p>
                        <p className="text-xs text-[#858A96] truncate">
                          {appt.serviceName} with {appt.staffName}
                        </p>
                      </div>

                      <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0">
                        <StatusIndicator status={appt.status} />
                        <div className="flex items-center gap-1.5">
                          {appt.status === 'pending' && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => updateAppointmentStatus(appt.id, 'confirmed')}
                            >
                              Confirm
                            </Button>
                          )}
                          {appt.status === 'confirmed' && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => updateAppointmentStatus(appt.id, 'completed')}
                            >
                              Complete
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Right Column: 7-Day Revenue Bars + Recent Activity */}
            <div className="lg:col-span-4 space-y-6">
              <div className="bg-white border border-[#17191F]/10 rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-display text-base font-semibold text-[#17191F]">
                    7-Day Pacing
                  </h2>
                  <Link
                    to="/dashboard/analytics"
                    className="text-xs font-semibold text-[#4665E8] hover:underline"
                  >
                    Details
                  </Link>
                </div>

                <div className="grid grid-cols-7 gap-2 items-end h-32 pt-2">
                  {(() => {
                    const maxRev = Math.max(
                      1,
                      ...metrics.analytics7d.dailySeries.map((d) => d.revenueCents)
                    );
                    return metrics.analytics7d.dailySeries.map((bucket) => {
                      const pct = Math.max(8, Math.round((bucket.revenueCents / maxRev) * 100));
                      return (
                        <div key={bucket.date} className="flex flex-col items-center gap-1.5 h-full justify-end">
                          <div className="w-full bg-[#E8EDFF] rounded-t h-24 flex items-end overflow-hidden">
                            <div
                              className="w-full bg-[#4665E8] rounded-t"
                              style={{ height: `${pct}%` }}
                              title={`${bucket.label}: ${formatCurrency(bucket.revenueCents)}`}
                            />
                          </div>
                          <span className="text-[10px] text-[#858A96] truncate max-w-full">
                            {bucket.label.split(' ')[1]}
                          </span>
                        </div>
                      );
                    });
                  })()}
                </div>
              </div>

              <div className="bg-white border border-[#17191F]/10 rounded-xl p-6">
                <h2 className="font-display text-base font-semibold text-[#17191F] mb-4">
                  Recent Activity
                </h2>
                <div className="space-y-4">
                  {state.activities.slice(0, 5).map((act) => (
                    <div key={act.id} className="pb-3 border-b border-[#17191F]/8 last:border-b-0 last:pb-0">
                      <p className="text-xs font-semibold text-[#17191F]">{act.title}</p>
                      <p className="text-xs text-[#858A96] mt-0.5 leading-relaxed">{act.detail}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <NewAppointmentModal open={newModalOpen} onClose={() => setNewModalOpen(false)} />
    </DashboardLayout>
  );
}
