import React, { useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { DashboardLayout } from '../../layouts/DashboardLayout';
import { useBookly } from '../../hooks/useBookly';
import { Button, DashboardSkeleton, Drawer, StatusIndicator } from '../../components/UI';
import { NewAppointmentModal } from '../../features/dashboard/NewAppointmentModal';
import type { Appointment } from '../../types/bookly';
import {
  addDays,
  formatCurrency,
  formatFullDate,
  formatTime12h,
  parseISODate,
  timeToMinutes,
  toISODate,
} from '../../utils/scheduling';

const HOURS = [9, 10, 11, 12, 13, 14, 15, 16, 17, 18];

export function CalendarPage() {
  const { state, isLoading, updateAppointmentStatus } = useBookly();
  const [viewMode, setViewMode] = useState<'week' | 'day'>('week');
  const [anchorDate, setAnchorDate] = useState<string>(() => toISODate(new Date()));
  const [staffFilter, setStaffFilter] = useState<string>('all');
  const [selectedAppt, setSelectedAppt] = useState<Appointment | null>(null);
  const [newModalOpen, setNewModalOpen] = useState(false);
  const [prefillDate, setPrefillDate] = useState<string | undefined>(undefined);
  const [prefillTime, setPrefillTime] = useState<string | undefined>(undefined);

  const visibleDays = useMemo(() => {
    const base = parseISODate(anchorDate);
    if (viewMode === 'day') {
      return [anchorDate];
    }
    const dayOfWeek = base.getDay(); // 0=Sun
    const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    const monday = addDays(base, mondayOffset);
    return Array.from({ length: 7 }, (_, i) => toISODate(addDays(monday, i)));
  }, [anchorDate, viewMode]);

  const appointmentsByDay = useMemo(() => {
    const map = new Map<string, Appointment[]>();
    visibleDays.forEach((d) => map.set(d, []));
    if (!state) return map;

    state.appointments.forEach((appt) => {
      if (!map.has(appt.date)) return;
      if (appt.status === 'cancelled') return;
      if (staffFilter !== 'all' && appt.staffId !== staffFilter) return;
      map.get(appt.date)!.push(appt);
    });

    map.forEach((list) => list.sort((a, b) => a.startTime.localeCompare(b.startTime)));
    return map;
  }, [state, visibleDays, staffFilter]);

  const activeSelected = useMemo(() => {
    if (!selectedAppt || !state) return null;
    return state.appointments.find((a) => a.id === selectedAppt.id) || null;
  }, [selectedAppt, state]);

  const shiftDate = (direction: -1 | 1) => {
    const step = viewMode === 'week' ? 7 * direction : direction;
    setAnchorDate(toISODate(addDays(parseISODate(anchorDate), step)));
  };

  const openSlotModal = (date: string, hour: number) => {
    setPrefillDate(date);
    setPrefillTime(`${String(hour).padStart(2, '0')}:00`);
    setNewModalOpen(true);
  };

  return (
    <DashboardLayout
      headerAction={
        <Button
          variant="primary"
          size="sm"
          onClick={() => {
            setPrefillDate(anchorDate);
            setPrefillTime('12:00');
            setNewModalOpen(true);
          }}
        >
          <Plus className="w-3.5 h-3.5" aria-hidden="true" />
          <span>New Appointment</span>
        </Button>
      }
    >
      {isLoading || !state ? (
        <DashboardSkeleton />
      ) : (
        <div className="space-y-5">
          {/* Calendar Toolbar */}
          <div className="bg-white border border-[#17191F]/10 rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-2">
              <div className="inline-flex items-center rounded-lg border border-[#17191F]/15 overflow-hidden bg-white">
                <button
                  type="button"
                  aria-label="Previous period"
                  onClick={() => shiftDate(-1)}
                  className="h-9 px-2.5 hover:bg-[#F8F7F3] border-r border-[#17191F]/10"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setAnchorDate(toISODate(new Date()))}
                  className="h-9 px-3.5 text-xs font-semibold hover:bg-[#F8F7F3]"
                >
                  Today
                </button>
                <button
                  type="button"
                  aria-label="Next period"
                  onClick={() => shiftDate(1)}
                  className="h-9 px-2.5 hover:bg-[#F8F7F3] border-l border-[#17191F]/10"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              <span className="font-display text-sm sm:text-base font-semibold text-[#17191F] ml-1">
                {new Intl.DateTimeFormat('en-US', {
                  month: 'long',
                  year: 'numeric',
                }).format(parseISODate(visibleDays[0]))}
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <select
                aria-label="Filter calendar by specialist"
                value={staffFilter}
                onChange={(e) => setStaffFilter(e.target.value)}
                className="h-9 px-3 rounded-lg border border-[#17191F]/15 bg-white text-xs font-medium text-[#17191F]"
              >
                <option value="all">All specialists</option>
                {state.staff.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name}
                  </option>
                ))}
              </select>

              <div className="inline-flex items-center gap-1 p-1 bg-[#F8F7F3] rounded-lg">
                <button
                  type="button"
                  onClick={() => setViewMode('week')}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                    viewMode === 'week'
                      ? 'bg-white text-[#17191F] shadow-sm'
                      : 'text-[#858A96] hover:text-[#17191F]'
                  }`}
                >
                  Week
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('day')}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                    viewMode === 'day'
                      ? 'bg-white text-[#17191F] shadow-sm'
                      : 'text-[#858A96] hover:text-[#17191F]'
                  }`}
                >
                  Day
                </button>
              </div>
            </div>
          </div>

          {/* Calendar Grid */}
          <div className="bg-white border border-[#17191F]/10 rounded-xl overflow-x-auto">
            <div className={viewMode === 'week' ? 'min-w-[820px]' : 'w-full'}>
              {/* Column Headers */}
              <div
                className={`grid border-b border-[#17191F]/10 bg-[#F8F7F3]/70 ${
                  viewMode === 'week' ? 'grid-cols-[72px_repeat(7,minmax(0,1fr))]' : 'grid-cols-[72px_1fr]'
                }`}
              >
                <div className="py-3 px-3 text-[11px] font-mono text-[#858A96]">Time</div>
                {visibleDays.map((iso) => {
                  const d = parseISODate(iso);
                  const isToday = iso === toISODate(new Date());
                  return (
                    <button
                      key={iso}
                      type="button"
                      onClick={() => {
                        setAnchorDate(iso);
                        if (viewMode === 'week') setViewMode('day');
                      }}
                      className={`py-3 px-3 text-left border-l border-[#17191F]/8 transition-colors hover:bg-[#E8EDFF]/40 ${
                        isToday ? 'bg-[#E8EDFF]/55' : ''
                      }`}
                    >
                      <p className="text-[11px] font-medium text-[#858A96]">
                        {new Intl.DateTimeFormat('en-US', { weekday: 'short' }).format(d)}
                      </p>
                      <p
                        className={`font-display text-sm font-semibold tabular-nums ${
                          isToday ? 'text-[#4665E8]' : 'text-[#17191F]'
                        }`}
                      >
                        {new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }).format(d)}
                      </p>
                    </button>
                  );
                })}
              </div>

              {/* Time Rows */}
              <div className="divide-y divide-[#17191F]/8">
                {HOURS.map((hour) => (
                  <div
                    key={hour}
                    className={`grid min-h-[72px] ${
                      viewMode === 'week'
                        ? 'grid-cols-[72px_repeat(7,minmax(0,1fr))]'
                        : 'grid-cols-[72px_1fr]'
                    }`}
                  >
                    <div className="py-2 px-3 text-[11px] font-mono text-[#858A96] tabular-nums">
                      {formatTime12h(`${String(hour).padStart(2, '0')}:00`)}
                    </div>

                    {visibleDays.map((iso) => {
                      const appts = (appointmentsByDay.get(iso) || []).filter((a) => {
                        const startH = Math.floor(timeToMinutes(a.startTime) / 60);
                        return startH === hour;
                      });

                      return (
                        <div
                          key={`${iso}-${hour}`}
                          className="border-l border-[#17191F]/8 p-1.5 space-y-1.5 relative group"
                        >
                          {appts.length === 0 && (
                            <button
                              type="button"
                              aria-label={`Add appointment on ${iso} at ${hour}:00`}
                              onClick={() => openSlotModal(iso, hour)}
                              className="w-full h-full min-h-[56px] rounded-md opacity-0 group-hover:opacity-100 focus:opacity-100 border border-dashed border-[#4665E8]/40 bg-[#E8EDFF]/30 text-[11px] font-medium text-[#4665E8] flex items-center justify-center transition-opacity"
                            >
                              + Add
                            </button>
                          )}

                          {appts.map((appt) => (
                            <button
                              key={appt.id}
                              type="button"
                              onClick={() => setSelectedAppt(appt)}
                              className={`w-full text-left p-2 rounded-lg border text-xs transition-all ${
                                appt.status === 'pending'
                                  ? 'bg-amber-50 border-amber-300 text-[#17191F]'
                                  : appt.status === 'completed'
                                  ? 'bg-[#F8F7F3] border-[#17191F]/15 text-[#17191F]'
                                  : 'bg-[#E8EDFF] border-[#4665E8]/30 text-[#17191F]'
                              }`}
                            >
                              <p className="font-mono text-[10px] font-semibold text-[#4665E8] tabular-nums">
                                {formatTime12h(appt.startTime)} · {appt.durationMinutes}m
                              </p>
                              <p className="font-semibold truncate mt-0.5">{appt.customerName}</p>
                              <p className="text-[11px] text-[#858A96] truncate">
                                {appt.serviceName}
                              </p>
                            </button>
                          ))}
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      <Drawer
        open={Boolean(activeSelected)}
        onClose={() => setSelectedAppt(null)}
        title={activeSelected ? `Booking ${activeSelected.bookingCode}` : 'Appointment'}
        subtitle={activeSelected ? formatFullDate(activeSelected.date) : undefined}
      >
        {activeSelected && (
          <div className="space-y-5">
            <div className="flex items-center justify-between pb-4 border-b border-[#17191F]/10">
              <StatusIndicator status={activeSelected.status} />
              <span className="font-mono text-base font-semibold tabular-nums">
                {formatCurrency(activeSelected.priceCents)}
              </span>
            </div>
            <div className="space-y-2 text-sm">
              <p className="font-semibold text-[#17191F]">{activeSelected.customerName}</p>
              <p className="text-xs text-[#858A96]">
                {activeSelected.serviceName} with {activeSelected.staffName}
              </p>
              <p className="font-mono text-xs text-[#17191F]">
                {formatTime12h(activeSelected.startTime)} ({activeSelected.durationMinutes} min)
              </p>
            </div>
            <div className="grid grid-cols-2 gap-2 pt-3 border-t border-[#17191F]/10">
              <Button
                size="sm"
                variant="outline"
                onClick={() => updateAppointmentStatus(activeSelected.id, 'confirmed')}
              >
                Confirm
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => updateAppointmentStatus(activeSelected.id, 'completed')}
              >
                Complete
              </Button>
              <Button
                size="sm"
                variant="danger"
                onClick={() => updateAppointmentStatus(activeSelected.id, 'cancelled')}
                className="col-span-2"
              >
                Cancel Appointment
              </Button>
            </div>
          </div>
        )}
      </Drawer>

      <NewAppointmentModal
        key={`${prefillDate}-${prefillTime}-${newModalOpen}`}
        open={newModalOpen}
        onClose={() => setNewModalOpen(false)}
        initialDate={prefillDate}
        initialTime={prefillTime}
      />
    </DashboardLayout>
  );
}
