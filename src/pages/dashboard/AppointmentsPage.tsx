import React, { useMemo, useState } from 'react';
import { Plus, Search } from 'lucide-react';
import { DashboardLayout } from '../../layouts/DashboardLayout';
import { useBookly } from '../../hooks/useBookly';
import {
  Button,
  DashboardSkeleton,
  Drawer,
  EmptyState,
  StatusIndicator,
} from '../../components/UI';
import { NewAppointmentModal } from '../../features/dashboard/NewAppointmentModal';
import type { Appointment, AppointmentStatus } from '../../types/bookly';
import {
  formatCurrency,
  formatDateReadable,
  formatFullDate,
  formatTime12h,
} from '../../utils/scheduling';

const STATUS_TABS: Array<'all' | AppointmentStatus> = [
  'all',
  'confirmed',
  'pending',
  'completed',
  'cancelled',
];

export function AppointmentsPage() {
  const { state, isLoading, updateAppointmentStatus } = useBookly();
  const [statusFilter, setStatusFilter] = useState<'all' | AppointmentStatus>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [staffFilter, setStaffFilter] = useState<string>('all');
  const [selectedAppt, setSelectedAppt] = useState<Appointment | null>(null);
  const [newModalOpen, setNewModalOpen] = useState(false);

  const filteredAppointments = useMemo(() => {
    if (!state) return [];
    const q = searchQuery.trim().toLowerCase();

    return [...state.appointments]
      .filter((a) => {
        if (statusFilter !== 'all' && a.status !== statusFilter) return false;
        if (staffFilter !== 'all' && a.staffId !== staffFilter) return false;
        if (
          q &&
          !a.customerName.toLowerCase().includes(q) &&
          !a.bookingCode.toLowerCase().includes(q) &&
          !a.serviceName.toLowerCase().includes(q) &&
          !a.staffName.toLowerCase().includes(q)
        ) {
          return false;
        }
        return true;
      })
      .sort((a, b) => `${b.date}${b.startTime}`.localeCompare(`${a.date}${a.startTime}`));
  }, [state, statusFilter, staffFilter, searchQuery]);

  const activeSelected = useMemo(() => {
    if (!selectedAppt || !state) return null;
    return state.appointments.find((a) => a.id === selectedAppt.id) || null;
  }, [selectedAppt, state]);

  return (
    <DashboardLayout
      headerAction={
        <Button variant="primary" size="sm" onClick={() => setNewModalOpen(true)}>
          <Plus className="w-3.5 h-3.5" aria-hidden="true" />
          <span>New Appointment</span>
        </Button>
      }
    >
      {isLoading || !state ? (
        <DashboardSkeleton />
      ) : (
        <div className="space-y-5">
          {/* Search & Filter Toolbar */}
          <div className="bg-white border border-[#17191F]/10 rounded-xl p-4 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="flex items-center gap-1 p-1 bg-[#F8F7F3] rounded-lg overflow-x-auto max-w-full">
              {STATUS_TABS.map((tab) => {
                const active = statusFilter === tab;
                const label = tab === 'all' ? 'All' : tab.charAt(0).toUpperCase() + tab.slice(1);
                return (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => setStatusFilter(tab)}
                    className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                      active
                        ? 'bg-white text-[#17191F] shadow-sm'
                        : 'text-[#858A96] hover:text-[#17191F]'
                    }`}
                  >
                    {label}
                  </button>
                );
              })}
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <div className="relative flex-1 sm:w-64">
                <Search
                  className="w-4 h-4 text-[#858A96] absolute left-3 top-1/2 -translate-y-1/2"
                  aria-hidden="true"
                />
                <input
                  type="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search client, code, service..."
                  aria-label="Search appointments"
                  className="w-full h-9 pl-9 pr-3 rounded-lg border border-[#17191F]/15 text-sm text-[#17191F]"
                />
              </div>
              <select
                aria-label="Filter by specialist"
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
            </div>
          </div>

          {filteredAppointments.length === 0 ? (
            <EmptyState
              title="No matching appointments"
              description="Try adjusting your status tab, specialist filter, or search query."
              actionLabel="Reset Filters"
              onAction={() => {
                setStatusFilter('all');
                setStaffFilter('all');
                setSearchQuery('');
              }}
            />
          ) : (
            <div className="bg-white border border-[#17191F]/10 rounded-xl overflow-hidden">
              {/* Desktop Table */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-[#17191F]/10 text-xs font-semibold text-[#858A96] bg-[#F8F7F3]/60">
                      <th className="py-3 px-5">Code</th>
                      <th className="py-3 px-5">Client</th>
                      <th className="py-3 px-5">Service</th>
                      <th className="py-3 px-5">Specialist</th>
                      <th className="py-3 px-5">Date & Time</th>
                      <th className="py-3 px-5 text-right">Amount</th>
                      <th className="py-3 px-5">Status</th>
                      <th className="py-3 px-5 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#17191F]/8 text-sm">
                    {filteredAppointments.map((appt) => (
                      <tr
                        key={appt.id}
                        className="hover:bg-[#F8F7F3]/60 transition-colors"
                      >
                        <td className="py-3.5 px-5 font-mono text-xs text-[#858A96] tabular-nums">
                          {appt.bookingCode}
                        </td>
                        <td className="py-3.5 px-5">
                          <p className="font-semibold text-[#17191F]">{appt.customerName}</p>
                          <p className="text-xs text-[#858A96]">{appt.customerEmail}</p>
                        </td>
                        <td className="py-3.5 px-5">
                          <p className="text-[#17191F]">{appt.serviceName}</p>
                          <p className="text-xs text-[#858A96] font-mono tabular-nums">
                            {appt.durationMinutes} min
                          </p>
                        </td>
                        <td className="py-3.5 px-5 text-[#17191F]/85">{appt.staffName}</td>
                        <td className="py-3.5 px-5 font-mono text-xs tabular-nums">
                          <p className="text-[#17191F]">{formatDateReadable(appt.date)}</p>
                          <p className="text-[#858A96]">{formatTime12h(appt.startTime)}</p>
                        </td>
                        <td className="py-3.5 px-5 text-right font-mono font-medium tabular-nums">
                          {formatCurrency(appt.priceCents)}
                        </td>
                        <td className="py-3.5 px-5">
                          <StatusIndicator status={appt.status} />
                        </td>
                        <td className="py-3.5 px-5 text-right">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setSelectedAppt(appt)}
                          >
                            Manage
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Card List */}
              <div className="md:hidden divide-y divide-[#17191F]/8">
                {filteredAppointments.map((appt) => (
                  <div key={appt.id} className="p-4 space-y-2.5">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-mono text-xs text-[#858A96]">{appt.bookingCode}</span>
                      <StatusIndicator status={appt.status} />
                    </div>
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-[#17191F]">{appt.customerName}</p>
                        <p className="text-xs text-[#858A96]">
                          {appt.serviceName} · {appt.staffName}
                        </p>
                      </div>
                      <span className="font-mono text-sm font-semibold tabular-nums">
                        {formatCurrency(appt.priceCents)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between pt-1">
                      <span className="font-mono text-xs text-[#858A96] tabular-nums">
                        {formatDateReadable(appt.date)} · {formatTime12h(appt.startTime)}
                      </span>
                      <Button size="sm" variant="outline" onClick={() => setSelectedAppt(appt)}>
                        Manage
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Appointment Detail Drawer */}
      <Drawer
        open={Boolean(activeSelected)}
        onClose={() => setSelectedAppt(null)}
        title={activeSelected ? `Booking ${activeSelected.bookingCode}` : 'Appointment Details'}
        subtitle={activeSelected ? formatFullDate(activeSelected.date) : undefined}
      >
        {activeSelected && (
          <div className="space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-[#17191F]/10">
              <StatusIndicator status={activeSelected.status} />
              <span className="font-mono text-lg font-semibold text-[#17191F] tabular-nums">
                {formatCurrency(activeSelected.priceCents)}
              </span>
            </div>

            <div className="space-y-4 text-sm">
              <div>
                <p className="text-xs text-[#858A96]">Client</p>
                <p className="font-semibold text-[#17191F] mt-0.5">{activeSelected.customerName}</p>
                <p className="text-xs text-[#858A96]">{activeSelected.customerEmail}</p>
                <p className="text-xs text-[#858A96]">{activeSelected.customerPhone}</p>
              </div>

              <div>
                <p className="text-xs text-[#858A96]">Service & Specialist</p>
                <p className="font-semibold text-[#17191F] mt-0.5">{activeSelected.serviceName}</p>
                <p className="text-xs text-[#858A96]">
                  With {activeSelected.staffName} · {activeSelected.durationMinutes} min at{' '}
                  {formatTime12h(activeSelected.startTime)}
                </p>
              </div>

              {activeSelected.notes && (
                <div>
                  <p className="text-xs text-[#858A96]">Client Notes</p>
                  <p className="text-sm text-[#17191F] bg-[#F8F7F3] p-3 rounded-lg mt-1">
                    {activeSelected.notes}
                  </p>
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-[#17191F]/10 space-y-2.5">
              <p className="text-xs font-semibold text-[#17191F]">Update Reservation Status</p>
              <div className="grid grid-cols-2 gap-2.5">
                <Button
                  variant={activeSelected.status === 'confirmed' ? 'primary' : 'outline'}
                  size="sm"
                  onClick={() => updateAppointmentStatus(activeSelected.id, 'confirmed')}
                >
                  Confirm
                </Button>
                <Button
                  variant={activeSelected.status === 'completed' ? 'secondary' : 'outline'}
                  size="sm"
                  onClick={() => updateAppointmentStatus(activeSelected.id, 'completed')}
                >
                  Mark Completed
                </Button>
                <Button
                  variant={activeSelected.status === 'pending' ? 'secondary' : 'outline'}
                  size="sm"
                  onClick={() => updateAppointmentStatus(activeSelected.id, 'pending')}
                >
                  Mark Pending
                </Button>
                <Button
                  variant={activeSelected.status === 'cancelled' ? 'danger' : 'outline'}
                  size="sm"
                  onClick={() => updateAppointmentStatus(activeSelected.id, 'cancelled')}
                >
                  Cancel Visit
                </Button>
              </div>
            </div>
          </div>
        )}
      </Drawer>

      <NewAppointmentModal open={newModalOpen} onClose={() => setNewModalOpen(false)} />
    </DashboardLayout>
  );
}
