import React, { useMemo, useState } from 'react';
import { Plus, Search } from 'lucide-react';
import { DashboardLayout } from '../../layouts/DashboardLayout';
import { useBookly } from '../../hooks/useBookly';
import {
  Button,
  DashboardSkeleton,
  Drawer,
  EmptyState,
  Modal,
  StatusIndicator,
} from '../../components/UI';
import type { Customer } from '../../types/bookly';
import {
  formatCurrency,
  formatDateReadable,
  formatTime12h,
  validateCustomerInfo,
} from '../../utils/scheduling';

export function CustomersPage() {
  const { state, isLoading, addCustomer } = useBookly();
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'recent' | 'spend' | 'visits'>('spend');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [addModalOpen, setAddModalOpen] = useState(false);

  // Add client form
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [notes, setNotes] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  const enrichedCustomers = useMemo(() => {
    if (!state) return [];
    const q = searchQuery.trim().toLowerCase();

    return state.customers
      .map((cust) => {
        const visits = state.appointments.filter(
          (a) =>
            (a.customerId === cust.id ||
              a.customerEmail.toLowerCase() === cust.email.toLowerCase()) &&
            a.status !== 'cancelled'
        );
        const totalSpendCents = visits.reduce((s, a) => s + a.priceCents, 0);
        const sortedDates = visits.map((v) => v.date).sort().reverse();
        return {
          ...cust,
          visitCount: visits.length,
          totalSpendCents,
          lastVisitDate: sortedDates[0] || null,
          appointments: visits.sort((a, b) =>
            `${b.date}${b.startTime}`.localeCompare(`${a.date}${a.startTime}`)
          ),
        };
      })
      .filter((c) => {
        if (!q) return true;
        return (
          c.name.toLowerCase().includes(q) ||
          c.email.toLowerCase().includes(q) ||
          c.phone.toLowerCase().includes(q)
        );
      })
      .sort((a, b) => {
        if (sortBy === 'spend') return b.totalSpendCents - a.totalSpendCents;
        if (sortBy === 'visits') return b.visitCount - a.visitCount;
        return (b.lastVisitDate || b.joinedDate).localeCompare(a.lastVisitDate || a.joinedDate);
      });
  }, [state, searchQuery, sortBy]);

  const activeCustomerDetail = useMemo(() => {
    if (!selectedCustomer) return null;
    return enrichedCustomers.find((c) => c.id === selectedCustomer.id) || null;
  }, [selectedCustomer, enrichedCustomers]);

  const handleAddClient = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validateCustomerInfo({
      customerName: name,
      customerEmail: email,
      customerPhone: phone,
    });
    const first = errs.customerName || errs.customerEmail || errs.customerPhone;
    if (first) {
      setFormError(first);
      return;
    }
    await addCustomer({
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim(),
      notes: notes.trim() || undefined,
    });
    setName('');
    setEmail('');
    setPhone('');
    setNotes('');
    setFormError(null);
    setAddModalOpen(false);
  };

  return (
    <DashboardLayout
      headerAction={
        <Button variant="primary" size="sm" onClick={() => setAddModalOpen(true)}>
          <Plus className="w-3.5 h-3.5" aria-hidden="true" />
          <span>Add Client</span>
        </Button>
      }
    >
      {isLoading || !state ? (
        <DashboardSkeleton />
      ) : (
        <div className="space-y-5">
          <div className="bg-white border border-[#17191F]/10 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="relative flex-1 sm:max-w-xs">
              <Search
                className="w-4 h-4 text-[#858A96] absolute left-3 top-1/2 -translate-y-1/2"
                aria-hidden="true"
              />
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search clients by name, email..."
                aria-label="Search clients"
                className="w-full h-9 pl-9 pr-3 rounded-lg border border-[#17191F]/15 text-sm"
              />
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-[#858A96]">Sort by:</span>
              <select
                aria-label="Sort clients"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'recent' | 'spend' | 'visits')}
                className="h-9 px-3 rounded-lg border border-[#17191F]/15 bg-white text-xs font-medium text-[#17191F]"
              >
                <option value="spend">Highest Spend</option>
                <option value="visits">Most Visits</option>
                <option value="recent">Most Recent</option>
              </select>
            </div>
          </div>

          {enrichedCustomers.length === 0 ? (
            <EmptyState
              title="No clients match your search"
              description="Try a different name or email, or add a new client profile."
              actionLabel="Add Client"
              onAction={() => setAddModalOpen(true)}
            />
          ) : (
            <div className="bg-white border border-[#17191F]/10 rounded-xl overflow-hidden">
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-[#17191F]/10 text-xs font-semibold text-[#858A96] bg-[#F8F7F3]/60">
                      <th className="py-3 px-5">Client</th>
                      <th className="py-3 px-5">Contact</th>
                      <th className="py-3 px-5 text-right">Visits</th>
                      <th className="py-3 px-5 text-right">Lifetime Spend</th>
                      <th className="py-3 px-5">Last Visit</th>
                      <th className="py-3 px-5 text-right">Profile</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#17191F]/8 text-sm">
                    {enrichedCustomers.map((cust) => (
                      <tr key={cust.id} className="hover:bg-[#F8F7F3]/60 transition-colors">
                        <td className="py-3.5 px-5">
                          <p className="font-semibold text-[#17191F]">{cust.name}</p>
                          {cust.notes && (
                            <p className="text-xs text-[#858A96] truncate max-w-xs">{cust.notes}</p>
                          )}
                        </td>
                        <td className="py-3.5 px-5 text-xs text-[#858A96]">
                          <p className="text-[#17191F]">{cust.email}</p>
                          <p>{cust.phone}</p>
                        </td>
                        <td className="py-3.5 px-5 text-right font-mono tabular-nums">
                          {cust.visitCount}
                        </td>
                        <td className="py-3.5 px-5 text-right font-mono font-medium tabular-nums">
                          {formatCurrency(cust.totalSpendCents)}
                        </td>
                        <td className="py-3.5 px-5 font-mono text-xs text-[#858A96] tabular-nums">
                          {cust.lastVisitDate ? formatDateReadable(cust.lastVisitDate) : '—'}
                        </td>
                        <td className="py-3.5 px-5 text-right">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setSelectedCustomer(cust)}
                          >
                            History
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="md:hidden divide-y divide-[#17191F]/8">
                {enrichedCustomers.map((cust) => (
                  <div key={cust.id} className="p-4 space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-semibold text-sm text-[#17191F]">{cust.name}</p>
                        <p className="text-xs text-[#858A96]">{cust.email}</p>
                      </div>
                      <span className="font-mono text-sm font-semibold tabular-nums">
                        {formatCurrency(cust.totalSpendCents)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs text-[#858A96]">
                      <span className="font-mono tabular-nums">{cust.visitCount} visits</span>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setSelectedCustomer(cust)}
                      >
                        History
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <Drawer
        open={Boolean(activeCustomerDetail)}
        onClose={() => setSelectedCustomer(null)}
        title={activeCustomerDetail?.name || 'Client Profile'}
        subtitle={activeCustomerDetail?.email}
      >
        {activeCustomerDetail && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-3">
              <div className="p-4 rounded-xl bg-[#F8F7F3] border border-[#17191F]/10">
                <p className="text-xs text-[#858A96]">Lifetime Spend</p>
                <p className="font-display text-2xl font-semibold text-[#17191F] tabular-nums mt-1">
                  {formatCurrency(activeCustomerDetail.totalSpendCents)}
                </p>
              </div>
              <div className="p-4 rounded-xl bg-[#F8F7F3] border border-[#17191F]/10">
                <p className="text-xs text-[#858A96]">Total Visits</p>
                <p className="font-display text-2xl font-semibold text-[#17191F] tabular-nums mt-1">
                  {activeCustomerDetail.visitCount}
                </p>
              </div>
            </div>

            {activeCustomerDetail.notes && (
              <div>
                <p className="text-xs font-semibold text-[#17191F]">Studio Notes</p>
                <p className="text-sm text-[#858A96] mt-1">{activeCustomerDetail.notes}</p>
              </div>
            )}

            <div>
              <p className="text-xs font-semibold text-[#17191F] mb-3">Reservation History</p>
              {activeCustomerDetail.appointments.length === 0 ? (
                <p className="text-sm text-[#858A96]">No visits logged yet.</p>
              ) : (
                <div className="divide-y divide-[#17191F]/8 border-y border-[#17191F]/8">
                  {activeCustomerDetail.appointments.map((appt) => (
                    <div key={appt.id} className="py-3 flex items-center justify-between gap-3">
                      <div>
                        <p className="text-sm font-medium text-[#17191F]">{appt.serviceName}</p>
                        <p className="text-xs text-[#858A96] font-mono tabular-nums">
                          {formatDateReadable(appt.date)} · {formatTime12h(appt.startTime)}
                        </p>
                      </div>
                      <div className="text-right space-y-1">
                        <p className="font-mono text-xs font-semibold tabular-nums">
                          {formatCurrency(appt.priceCents)}
                        </p>
                        <StatusIndicator status={appt.status} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </Drawer>

      <Modal
        open={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        title="Add Client Profile"
        subtitle="Create a new client record in your directory."
      >
        <form onSubmit={handleAddClient} noValidate className="space-y-4">
          <div>
            <label htmlFor="cust-name" className="block text-xs font-semibold text-[#17191F] mb-1">
              Full Name *
            </label>
            <input
              id="cust-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full h-10 px-3 rounded-lg border border-[#17191F]/15 text-sm"
            />
          </div>
          <div>
            <label htmlFor="cust-email" className="block text-xs font-semibold text-[#17191F] mb-1">
              Email *
            </label>
            <input
              id="cust-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full h-10 px-3 rounded-lg border border-[#17191F]/15 text-sm"
            />
          </div>
          <div>
            <label htmlFor="cust-phone" className="block text-xs font-semibold text-[#17191F] mb-1">
              Phone *
            </label>
            <input
              id="cust-phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full h-10 px-3 rounded-lg border border-[#17191F]/15 text-sm"
            />
          </div>
          <div>
            <label htmlFor="cust-notes" className="block text-xs font-semibold text-[#17191F] mb-1">
              Preferences / Notes
            </label>
            <textarea
              id="cust-notes"
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full p-3 rounded-lg border border-[#17191F]/15 text-sm"
            />
          </div>
          {formError && (
            <p className="text-xs text-[#DC2626]" role="alert">
              {formError}
            </p>
          )}
          <div className="flex justify-end gap-2.5 pt-3 border-t border-[#17191F]/10">
            <Button type="button" variant="outline" onClick={() => setAddModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Save Client
            </Button>
          </div>
        </form>
      </Modal>
    </DashboardLayout>
  );
}
