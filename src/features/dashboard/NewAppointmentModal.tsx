import React, { useMemo, useState } from 'react';
import { Button, Modal } from '../../components/UI';
import { useBookly } from '../../hooks/useBookly';
import {
  formatCurrency,
  formatTime12h,
  hasBookingConflict,
  timeToMinutes,
  toISODate,
  validateCustomerInfo,
} from '../../utils/scheduling';

export function NewAppointmentModal({
  open,
  onClose,
  initialDate,
  initialTime,
}: {
  open: boolean;
  onClose: () => void;
  initialDate?: string;
  initialTime?: string;
}) {
  const { state, createAppointment } = useBookly();
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [serviceId, setServiceId] = useState(() => state?.services[0]?.id || 'svc-cut');
  const [staffId, setStaffId] = useState(() => state?.staff[0]?.id || 'st-marcus');
  const [date, setDate] = useState(() => initialDate || toISODate(new Date()));
  const [startTime, setStartTime] = useState(() => initialTime || '12:00');
  const [notes, setNotes] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const selectedService = useMemo(
    () => state?.services.find((s) => s.id === serviceId) || state?.services[0],
    [state, serviceId]
  );

  const conflict = useMemo(() => {
    if (!state || !selectedService) return false;
    return hasBookingConflict({
      date,
      startMinutes: timeToMinutes(startTime),
      durationMinutes: selectedService.durationMinutes,
      bufferMinutes: state.settings.bufferMinutes,
      staffId,
      appointments: state.appointments,
    });
  }, [state, selectedService, date, startTime, staffId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const fieldErrors = validateCustomerInfo({
      customerName,
      customerEmail,
      customerPhone,
    });
    const firstError =
      fieldErrors.customerName || fieldErrors.customerEmail || fieldErrors.customerPhone;
    if (firstError) {
      setErrorMsg(firstError);
      return;
    }
    if (conflict) {
      setErrorMsg('This specialist already has an overlapping appointment or buffer window.');
      return;
    }

    setSaving(true);
    setErrorMsg(null);
    try {
      await createAppointment({
        customerName,
        customerEmail,
        customerPhone,
        serviceId,
        staffId,
        date,
        startTime,
        notes,
        status: 'confirmed',
      });
      setCustomerName('');
      setCustomerEmail('');
      setCustomerPhone('');
      setNotes('');
      onClose();
    } catch {
      setErrorMsg('Unable to create appointment. Check selected service and specialist.');
    } finally {
      setSaving(false);
    }
  };

  if (!state) return null;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="New Appointment"
      subtitle="Add a walk-in or phone reservation directly to the studio calendar."
    >
      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        <div>
          <label htmlFor="modal-client-name" className="block text-xs font-semibold text-[#17191F] mb-1">
            Client Full Name *
          </label>
          <input
            id="modal-client-name"
            type="text"
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            placeholder="e.g. Jordan Mercer"
            className="w-full h-10 px-3 rounded-lg border border-[#17191F]/15 text-sm"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label htmlFor="modal-client-email" className="block text-xs font-semibold text-[#17191F] mb-1">
              Email *
            </label>
            <input
              id="modal-client-email"
              type="email"
              value={customerEmail}
              onChange={(e) => setCustomerEmail(e.target.value)}
              placeholder="jordan@example.com"
              className="w-full h-10 px-3 rounded-lg border border-[#17191F]/15 text-sm"
            />
          </div>
          <div>
            <label htmlFor="modal-client-phone" className="block text-xs font-semibold text-[#17191F] mb-1">
              Phone *
            </label>
            <input
              id="modal-client-phone"
              type="tel"
              value={customerPhone}
              onChange={(e) => setCustomerPhone(e.target.value)}
              placeholder="+1 (415) 555-0190"
              className="w-full h-10 px-3 rounded-lg border border-[#17191F]/15 text-sm"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label htmlFor="modal-service" className="block text-xs font-semibold text-[#17191F] mb-1">
              Service
            </label>
            <select
              id="modal-service"
              value={serviceId}
              onChange={(e) => setServiceId(e.target.value)}
              className="w-full h-10 px-3 rounded-lg border border-[#17191F]/15 text-sm bg-white"
            >
              {state.services.map((svc) => (
                <option key={svc.id} value={svc.id}>
                  {svc.name} ({svc.durationMinutes}m · {formatCurrency(svc.priceCents)})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="modal-staff" className="block text-xs font-semibold text-[#17191F] mb-1">
              Specialist
            </label>
            <select
              id="modal-staff"
              value={staffId}
              onChange={(e) => setStaffId(e.target.value)}
              className="w-full h-10 px-3 rounded-lg border border-[#17191F]/15 text-sm bg-white"
            >
              {state.staff.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label htmlFor="modal-date" className="block text-xs font-semibold text-[#17191F] mb-1">
              Date
            </label>
            <input
              id="modal-date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full h-10 px-3 rounded-lg border border-[#17191F]/15 text-sm font-mono"
            />
          </div>
          <div>
            <label htmlFor="modal-time" className="block text-xs font-semibold text-[#17191F] mb-1">
              Start Time
            </label>
            <select
              id="modal-time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="w-full h-10 px-3 rounded-lg border border-[#17191F]/15 text-sm bg-white font-mono"
            >
              {[
                '09:00',
                '09:30',
                '10:00',
                '10:30',
                '11:00',
                '11:30',
                '12:00',
                '12:30',
                '13:00',
                '13:30',
                '14:00',
                '14:30',
                '15:00',
                '15:30',
                '16:00',
                '16:30',
                '17:00',
                '17:30',
              ].map((t) => (
                <option key={t} value={t}>
                  {formatTime12h(t)}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label htmlFor="modal-notes" className="block text-xs font-semibold text-[#17191F] mb-1">
            Notes (optional)
          </label>
          <input
            id="modal-notes"
            type="text"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Walk-in preference or consultation notes"
            className="w-full h-10 px-3 rounded-lg border border-[#17191F]/15 text-sm"
          />
        </div>

        {conflict && (
          <p className="text-xs text-[#B45309] bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
            Heads up: this time overlaps with an existing reservation or turnaround buffer for the selected specialist.
          </p>
        )}

        {errorMsg && (
          <p className="text-xs text-[#DC2626]" role="alert">
            {errorMsg}
          </p>
        )}

        <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[#17191F]/10">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" disabled={saving}>
            {saving ? 'Saving...' : 'Create Appointment'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
