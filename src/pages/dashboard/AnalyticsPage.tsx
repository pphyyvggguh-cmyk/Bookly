import React, { useMemo, useState } from 'react';
import { DashboardLayout } from '../../layouts/DashboardLayout';
import { useBookly } from '../../hooks/useBookly';
import { DashboardSkeleton } from '../../components/UI';
import { computeAnalytics, formatCurrency } from '../../utils/scheduling';

export function AnalyticsPage() {
  const { state, isLoading } = useBookly();
  const [rangeDays, setRangeDays] = useState<7 | 30 | 90>(30);

  const summary = useMemo(() => {
    if (!state) return null;
    return computeAnalytics({
      appointments: state.appointments,
      services: state.services,
      staff: state.staff,
      rangeDays,
    });
  }, [state, rangeDays]);

  return (
    <DashboardLayout
      headerAction={
        <div className="inline-flex items-center gap-1 p-1 bg-[#F8F7F3] border border-[#17191F]/10 rounded-lg">
          {([7, 30, 90] as const).map((days) => (
            <button
              key={days}
              type="button"
              onClick={() => setRangeDays(days)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                rangeDays === days
                  ? 'bg-white text-[#17191F] shadow-sm'
                  : 'text-[#858A96] hover:text-[#17191F]'
              }`}
            >
              {days}D
            </button>
          ))}
        </div>
      }
    >
      {isLoading || !state || !summary ? (
        <DashboardSkeleton />
      ) : (
        <div className="space-y-6">
          {/* Top KPI Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white border border-[#17191F]/10 rounded-xl p-5">
              <p className="text-xs font-medium text-[#858A96]">Gross Revenue ({rangeDays}d)</p>
              <p className="font-display text-3xl font-semibold text-[#17191F] tabular-nums mt-2">
                {formatCurrency(summary.totalRevenueCents)}
              </p>
              <p className="text-xs text-[#858A96] mt-1">Excludes cancelled visits</p>
            </div>
            <div className="bg-white border border-[#17191F]/10 rounded-xl p-5">
              <p className="text-xs font-medium text-[#858A96]">Active Reservations</p>
              <p className="font-display text-3xl font-semibold text-[#17191F] tabular-nums mt-2">
                {summary.totalBookings}
              </p>
              <p className="text-xs text-[#858A96] mt-1 font-mono tabular-nums">
                {summary.completedBookings} completed · {summary.cancelledBookings} cancelled
              </p>
            </div>
            <div className="bg-white border border-[#17191F]/10 rounded-xl p-5">
              <p className="text-xs font-medium text-[#858A96]">Average Ticket</p>
              <p className="font-display text-3xl font-semibold text-[#17191F] tabular-nums mt-2">
                {formatCurrency(summary.averageTicketCents)}
              </p>
              <p className="text-xs text-[#858A96] mt-1">Mean revenue per appointment</p>
            </div>
            <div className="bg-white border border-[#17191F]/10 rounded-xl p-5">
              <p className="text-xs font-medium text-[#858A96]">Repeat Retention</p>
              <p className="font-display text-3xl font-semibold text-[#17191F] tabular-nums mt-2">
                {summary.retentionRatePercent}%
              </p>
              <p className="text-xs text-[#858A96] mt-1">Clients with 2+ studio bookings</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Revenue Trend Chart */}
            <div className="lg:col-span-8 bg-white border border-[#17191F]/10 rounded-xl p-6">
              <div className="flex items-center justify-between gap-4 mb-6">
                <div>
                  <h2 className="font-display text-base font-semibold text-[#17191F]">
                    Revenue Trajectory
                  </h2>
                  <p className="text-xs text-[#858A96] mt-0.5">
                    Grouped across the past {rangeDays} days
                  </p>
                </div>
                <span className="font-mono text-sm font-semibold text-[#4665E8] tabular-nums">
                  {formatCurrency(summary.totalRevenueCents)}
                </span>
              </div>

              <div className="grid grid-cols-7 sm:grid-cols-9 lg:grid-cols-10 gap-2.5 items-end h-52 pt-4">
                {(() => {
                  const maxRev = Math.max(
                    1,
                    ...summary.dailySeries.map((b) => b.revenueCents)
                  );
                  return summary.dailySeries.map((bucket) => {
                    const pct =
                      bucket.revenueCents === 0
                        ? 4
                        : Math.max(12, Math.round((bucket.revenueCents / maxRev) * 100));
                    return (
                      <div
                        key={bucket.date}
                        className="flex flex-col items-center gap-2 h-full justify-end"
                      >
                        <span className="font-mono text-[10px] text-[#858A96] tabular-nums hidden sm:block">
                          {bucket.revenueCents > 0 ? formatCurrency(bucket.revenueCents) : '—'}
                        </span>
                        <div className="w-full max-w-[38px] bg-[#E8EDFF]/70 rounded-t-md h-36 flex items-end overflow-hidden">
                          <div
                            className="w-full bg-[#4665E8] rounded-t-md transition-all duration-300"
                            style={{ height: `${pct}%` }}
                          />
                        </div>
                        <span className="text-[10px] text-[#858A96] truncate max-w-full">
                          {bucket.label}
                        </span>
                      </div>
                    );
                  });
                })()}
              </div>
            </div>

            {/* Category Breakdown */}
            <div className="lg:col-span-4 bg-white border border-[#17191F]/10 rounded-xl p-6">
              <h2 className="font-display text-base font-semibold text-[#17191F]">
                Service Category Mix
              </h2>
              <p className="text-xs text-[#858A96] mt-0.5 mb-5">
                Share of reservations and gross revenue
              </p>
              <div className="space-y-4">
                {summary.categoryBreakdown.length === 0 ? (
                  <p className="text-sm text-[#858A96]">No bookings in selected range.</p>
                ) : (
                  summary.categoryBreakdown.map((item) => (
                    <div key={item.category} className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-medium text-[#17191F]">{item.category}</span>
                        <span className="font-mono text-[#858A96] tabular-nums">
                          {formatCurrency(item.revenueCents)} · {item.sharePercent}%
                        </span>
                      </div>
                      <div className="h-2 bg-[#F8F7F3] rounded-full overflow-hidden">
                        <div
                          className="h-full bg-[#17191F] rounded-full"
                          style={{ width: `${item.sharePercent}%` }}
                        />
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Specialist Utilization Table */}
            <div className="lg:col-span-7 bg-white border border-[#17191F]/10 rounded-xl overflow-hidden">
              <div className="px-6 py-4 border-b border-[#17191F]/10">
                <h2 className="font-display text-base font-semibold text-[#17191F]">
                  Specialist Performance
                </h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-[#17191F]/10 text-xs font-semibold text-[#858A96] bg-[#F8F7F3]/60">
                      <th className="py-3 px-6">Specialist</th>
                      <th className="py-3 px-6 text-right">Bookings</th>
                      <th className="py-3 px-6 text-right">Revenue</th>
                      <th className="py-3 px-6 text-right">Utilization</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#17191F]/8 text-sm">
                    {summary.staffUtilization.map((row) => (
                      <tr key={row.staffId}>
                        <td className="py-3.5 px-6 font-medium text-[#17191F]">{row.staffName}</td>
                        <td className="py-3.5 px-6 text-right font-mono tabular-nums">
                          {row.bookings}
                        </td>
                        <td className="py-3.5 px-6 text-right font-mono tabular-nums">
                          {formatCurrency(row.revenueCents)}
                        </td>
                        <td className="py-3.5 px-6 text-right font-mono font-semibold text-[#4665E8] tabular-nums">
                          {row.utilizationPercent}%
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Peak Hours Distribution */}
            <div className="lg:col-span-5 bg-white border border-[#17191F]/10 rounded-xl p-6">
              <h2 className="font-display text-base font-semibold text-[#17191F]">
                Peak Studio Hours
              </h2>
              <p className="text-xs text-[#858A96] mt-0.5 mb-5">
                Hourly arrival volume across open hours
              </p>
              <div className="grid grid-cols-10 gap-1.5 items-end h-36">
                {(() => {
                  const maxHour = Math.max(1, ...summary.peakHours.map((h) => h.bookings));
                  return summary.peakHours.map((h) => {
                    const pct =
                      h.bookings === 0 ? 6 : Math.max(15, Math.round((h.bookings / maxHour) * 100));
                    return (
                      <div
                        key={h.hourLabel}
                        className="flex flex-col items-center gap-1.5 h-full justify-end"
                      >
                        <div className="w-full bg-[#F8F7F3] rounded-t h-28 flex items-end overflow-hidden">
                          <div
                            className={`w-full rounded-t ${
                              h.bookings > 0 ? 'bg-[#17191F]' : 'bg-[#17191F]/15'
                            }`}
                            style={{ height: `${pct}%` }}
                          />
                        </div>
                        <span className="text-[10px] font-mono text-[#858A96]">{h.hourLabel}</span>
                      </div>
                    );
                  });
                })()}
              </div>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
