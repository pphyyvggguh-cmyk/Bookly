import React, { useEffect, useState } from 'react';
import { Check, RotateCcw } from 'lucide-react';
import { DashboardLayout } from '../../layouts/DashboardLayout';
import { useBookly } from '../../hooks/useBookly';
import { Button, DashboardSkeleton } from '../../components/UI';
import type { BusinessSettings, DayOfWeek } from '../../types/bookly';

const DAYS: Array<{ key: DayOfWeek; label: string }> = [
  { key: 'mon', label: 'Monday' },
  { key: 'tue', label: 'Tuesday' },
  { key: 'wed', label: 'Wednesday' },
  { key: 'thu', label: 'Thursday' },
  { key: 'fri', label: 'Friday' },
  { key: 'sat', label: 'Saturday' },
  { key: 'sun', label: 'Sunday' },
];

export function SettingsPage() {
  const { state, isLoading, updateSettings, resetDemoData } = useBookly();
  const [form, setForm] = useState<BusinessSettings | null>(null);
  const [savedNotice, setSavedNotice] = useState(false);

  useEffect(() => {
    if (state?.settings) {
      setForm(state.settings);
    }
  }, [state]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form) return;
    await updateSettings(form);
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 2500);
  };

  return (
    <DashboardLayout>
      {isLoading || !form ? (
        <DashboardSkeleton />
      ) : (
        <form onSubmit={handleSave} className="max-w-4xl space-y-6">
          {/* Business Identity */}
          <section className="bg-white border border-[#17191F]/10 rounded-xl p-6 space-y-4">
            <div>
              <h2 className="font-display text-base font-semibold text-[#17191F]">
                Studio Profile
              </h2>
              <p className="text-xs text-[#858A96] mt-0.5">
                Displayed on your customer booking storefront and confirmation notices.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="set-name" className="block text-xs font-semibold text-[#17191F] mb-1">
                  Business Name
                </label>
                <input
                  id="set-name"
                  type="text"
                  value={form.businessName}
                  onChange={(e) => setForm({ ...form, businessName: e.target.value })}
                  className="w-full h-10 px-3 rounded-lg border border-[#17191F]/15 text-sm"
                />
              </div>
              <div>
                <label htmlFor="set-tagline" className="block text-xs font-semibold text-[#17191F] mb-1">
                  Tagline
                </label>
                <input
                  id="set-tagline"
                  type="text"
                  value={form.tagline}
                  onChange={(e) => setForm({ ...form, tagline: e.target.value })}
                  className="w-full h-10 px-3 rounded-lg border border-[#17191F]/15 text-sm"
                />
              </div>
              <div>
                <label htmlFor="set-email" className="block text-xs font-semibold text-[#17191F] mb-1">
                  Contact Email
                </label>
                <input
                  id="set-email"
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full h-10 px-3 rounded-lg border border-[#17191F]/15 text-sm"
                />
              </div>
              <div>
                <label htmlFor="set-phone" className="block text-xs font-semibold text-[#17191F] mb-1">
                  Studio Phone
                </label>
                <input
                  id="set-phone"
                  type="tel"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className="w-full h-10 px-3 rounded-lg border border-[#17191F]/15 text-sm"
                />
              </div>
              <div className="sm:col-span-2">
                <label htmlFor="set-address" className="block text-xs font-semibold text-[#17191F] mb-1">
                  Street Address
                </label>
                <input
                  id="set-address"
                  type="text"
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                  className="w-full h-10 px-3 rounded-lg border border-[#17191F]/15 text-sm"
                />
              </div>
            </div>
          </section>

          {/* Operating Hours */}
          <section className="bg-white border border-[#17191F]/10 rounded-xl p-6 space-y-4">
            <div>
              <h2 className="font-display text-base font-semibold text-[#17191F]">
                Operating Hours
              </h2>
              <p className="text-xs text-[#858A96] mt-0.5">
                Closed days are automatically disabled in the customer date picker.
              </p>
            </div>

            <div className="divide-y divide-[#17191F]/8">
              {DAYS.map(({ key, label }) => {
                const day = form.schedule[key];
                return (
                  <div
                    key={key}
                    className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <label className="inline-flex items-center gap-3 text-sm font-medium text-[#17191F]">
                      <input
                        type="checkbox"
                        checked={day.open}
                        onChange={(e) =>
                          setForm({
                            ...form,
                            schedule: {
                              ...form.schedule,
                              [key]: { ...day, open: e.target.checked },
                            },
                          })
                        }
                        className="w-4 h-4 accent-[#4665E8]"
                      />
                      <span className="w-24">{label}</span>
                    </label>

                    {day.open ? (
                      <div className="flex items-center gap-2 text-xs font-mono">
                        <input
                          type="time"
                          aria-label={`${label} open time`}
                          value={day.start}
                          onChange={(e) =>
                            setForm({
                              ...form,
                              schedule: {
                                ...form.schedule,
                                [key]: { ...day, start: e.target.value },
                              },
                            })
                          }
                          className="h-9 px-2.5 rounded-lg border border-[#17191F]/15"
                        />
                        <span className="text-[#858A96]">to</span>
                        <input
                          type="time"
                          aria-label={`${label} close time`}
                          value={day.end}
                          onChange={(e) =>
                            setForm({
                              ...form,
                              schedule: {
                                ...form.schedule,
                                [key]: { ...day, end: e.target.value },
                              },
                            })
                          }
                          className="h-9 px-2.5 rounded-lg border border-[#17191F]/15"
                        />
                      </div>
                    ) : (
                      <span className="text-xs text-[#858A96]">Closed</span>
                    )}
                  </div>
                );
              })}
            </div>
          </section>

          {/* Scheduling Rules */}
          <section className="bg-white border border-[#17191F]/10 rounded-xl p-6 space-y-4">
            <h2 className="font-display text-base font-semibold text-[#17191F]">
              Booking Rules & Notifications
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label htmlFor="set-buffer" className="block text-xs font-semibold text-[#17191F] mb-1">
                  Turnaround Buffer (min)
                </label>
                <input
                  id="set-buffer"
                  type="number"
                  min={0}
                  max={60}
                  step={5}
                  value={form.bufferMinutes}
                  onChange={(e) =>
                    setForm({ ...form, bufferMinutes: Number(e.target.value) || 0 })
                  }
                  className="w-full h-10 px-3 rounded-lg border border-[#17191F]/15 text-sm font-mono"
                />
              </div>
              <div>
                <label htmlFor="set-lead" className="block text-xs font-semibold text-[#17191F] mb-1">
                  Minimum Lead Time (hrs)
                </label>
                <input
                  id="set-lead"
                  type="number"
                  min={0}
                  max={48}
                  value={form.minLeadHours}
                  onChange={(e) =>
                    setForm({ ...form, minLeadHours: Number(e.target.value) || 0 })
                  }
                  className="w-full h-10 px-3 rounded-lg border border-[#17191F]/15 text-sm font-mono"
                />
              </div>
              <div>
                <label htmlFor="set-cancel" className="block text-xs font-semibold text-[#17191F] mb-1">
                  Cancellation Window (hrs)
                </label>
                <input
                  id="set-cancel"
                  type="number"
                  min={0}
                  max={72}
                  value={form.cancellationWindowHours}
                  onChange={(e) =>
                    setForm({ ...form, cancellationWindowHours: Number(e.target.value) || 0 })
                  }
                  className="w-full h-10 px-3 rounded-lg border border-[#17191F]/15 text-sm font-mono"
                />
              </div>
            </div>

            <div className="pt-2 space-y-2.5 text-sm">
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={form.autoConfirmBookings}
                  onChange={(e) => setForm({ ...form, autoConfirmBookings: e.target.checked })}
                  className="w-4 h-4 accent-[#4665E8]"
                />
                <span>Automatically confirm new online bookings</span>
              </label>
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={form.emailReminders}
                  onChange={(e) => setForm({ ...form, emailReminders: e.target.checked })}
                  className="w-4 h-4 accent-[#4665E8]"
                />
                <span>Send client email reminders 24 hours before visit</span>
              </label>
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={form.smsReminders}
                  onChange={(e) => setForm({ ...form, smsReminders: e.target.checked })}
                  className="w-4 h-4 accent-[#4665E8]"
                />
                <span>Send SMS confirmation alerts</span>
              </label>
            </div>
          </section>

          {/* Data Architecture Note + Save Controls */}
          <section className="bg-[#F8F7F3] border border-[#17191F]/12 rounded-xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="max-w-lg">
              <p className="text-xs font-semibold text-[#17191F]">
                Storage & Supabase Readiness
              </p>
              <p className="text-xs text-[#858A96] mt-1 leading-relaxed">
                Workspace changes persist in your browser via the BooklyRepository adapter. Swap in Supabase client credentials via environment variables when deploying your production database.
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={resetDemoData}
            >
              <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Reset Sample Data</span>
            </Button>
          </section>

          <div className="flex items-center justify-end gap-3">
            {savedNotice && (
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#15803D]">
                <Check className="w-4 h-4" aria-hidden="true" />
                Settings saved
              </span>
            )}
            <Button type="submit" variant="primary" size="lg">
              Save Workspace Settings
            </Button>
          </div>
        </form>
      )}
    </DashboardLayout>
  );
}
