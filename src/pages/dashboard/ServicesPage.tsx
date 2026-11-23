import React, { useMemo, useState } from 'react';
import { Edit3, Plus, Search } from 'lucide-react';
import { DashboardLayout } from '../../layouts/DashboardLayout';
import { useBookly } from '../../hooks/useBookly';
import { Button, DashboardSkeleton, EmptyState, Modal } from '../../components/UI';
import type { ServiceCategory, ServiceItem } from '../../types/bookly';
import { formatCurrency } from '../../utils/scheduling';

const CATEGORIES: Array<'All' | ServiceCategory> = [
  'All',
  'Hair & Grooming',
  'Color & Styling',
  'Skin & Aesthetics',
  'Consultation',
];

export function ServicesPage() {
  const { state, isLoading, upsertService, toggleServiceActive } = useBookly();
  const [categoryFilter, setCategoryFilter] = useState<'All' | ServiceCategory>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<ServiceItem | null>(null);

  // Modal Form state
  const [name, setName] = useState('');
  const [category, setCategory] = useState<ServiceCategory>('Hair & Grooming');
  const [durationMinutes, setDurationMinutes] = useState('45');
  const [priceDollars, setPriceDollars] = useState('75');
  const [description, setDescription] = useState('');
  const [specialistIds, setSpecialistIds] = useState<string[]>(['st-marcus']);
  const [formError, setFormError] = useState<string | null>(null);

  const openCreateModal = () => {
    setEditingService(null);
    setName('');
    setCategory('Hair & Grooming');
    setDurationMinutes('45');
    setPriceDollars('75');
    setDescription('');
    setSpecialistIds(state?.staff.map((s) => s.id) || ['st-marcus']);
    setFormError(null);
    setModalOpen(true);
  };

  const openEditModal = (svc: ServiceItem) => {
    setEditingService(svc);
    setName(svc.name);
    setCategory(svc.category);
    setDurationMinutes(String(svc.durationMinutes));
    setPriceDollars(String(Math.round(svc.priceCents / 100)));
    setDescription(svc.description);
    setSpecialistIds(svc.specialistIds);
    setFormError(null);
    setModalOpen(true);
  };

  const handleSaveService = async (e: React.FormEvent) => {
    e.preventDefault();
    const duration = Number(durationMinutes);
    const price = Number(priceDollars);

    if (name.trim().length < 2) {
      setFormError('Service name must be at least 2 characters.');
      return;
    }
    if (!Number.isFinite(duration) || duration < 15 || duration > 300) {
      setFormError('Duration must be between 15 and 300 minutes.');
      return;
    }
    if (!Number.isFinite(price) || price <= 0) {
      setFormError('Price must be greater than $0.');
      return;
    }
    if (specialistIds.length === 0) {
      setFormError('Select at least one specialist.');
      return;
    }

    await upsertService({
      id: editingService?.id,
      name: name.trim(),
      category,
      durationMinutes: duration,
      priceCents: Math.round(price * 100),
      description: description.trim() || 'Studio appointment service.',
      active: editingService ? editingService.active : true,
      specialistIds,
    });
    setModalOpen(false);
  };

  const filteredServices = useMemo(() => {
    if (!state) return [];
    const q = searchQuery.trim().toLowerCase();
    return state.services.filter((svc) => {
      if (categoryFilter !== 'All' && svc.category !== categoryFilter) return false;
      if (q && !svc.name.toLowerCase().includes(q) && !svc.description.toLowerCase().includes(q)) {
        return false;
      }
      return true;
    });
  }, [state, categoryFilter, searchQuery]);

  const toggleSpecialist = (id: string) => {
    setSpecialistIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  return (
    <DashboardLayout
      headerAction={
        <Button variant="primary" size="sm" onClick={openCreateModal}>
          <Plus className="w-3.5 h-3.5" aria-hidden="true" />
          <span>Add Service</span>
        </Button>
      }
    >
      {isLoading || !state ? (
        <DashboardSkeleton />
      ) : (
        <div className="space-y-5">
          <div className="bg-white border border-[#17191F]/10 rounded-xl p-4 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="flex items-center gap-1 p-1 bg-[#F8F7F3] rounded-lg overflow-x-auto max-w-full">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategoryFilter(cat)}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                    categoryFilter === cat
                      ? 'bg-white text-[#17191F] shadow-sm'
                      : 'text-[#858A96] hover:text-[#17191F]'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            <div className="relative w-full lg:w-64">
              <Search
                className="w-4 h-4 text-[#858A96] absolute left-3 top-1/2 -translate-y-1/2"
                aria-hidden="true"
              />
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search service catalog..."
                aria-label="Search service catalog"
                className="w-full h-9 pl-9 pr-3 rounded-lg border border-[#17191F]/15 text-sm"
              />
            </div>
          </div>

          {filteredServices.length === 0 ? (
            <EmptyState
              title="No services found"
              description="Adjust your search filter or add a new studio service."
              actionLabel="Add Service"
              onAction={openCreateModal}
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
              {filteredServices.map((svc) => {
                const assignedNames = state.staff
                  .filter((m) => svc.specialistIds.includes(m.id))
                  .map((m) => m.name.split(' ')[0])
                  .join(', ');

                return (
                  <article
                    key={svc.id}
                    className={`bg-white border rounded-xl p-6 flex flex-col justify-between transition-opacity ${
                      svc.active ? 'border-[#17191F]/10' : 'border-[#17191F]/8 opacity-65'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 text-xs text-[#858A96]">
                        <span>{svc.category}</span>
                        <span className="font-mono tabular-nums">{svc.durationMinutes} min</span>
                      </div>
                      <h2 className="font-display text-lg font-semibold text-[#17191F] mt-2">
                        {svc.name}
                      </h2>
                      <p className="text-sm text-[#858A96] mt-2 leading-relaxed">
                        {svc.description}
                      </p>
                      <p className="text-xs text-[#17191F]/70 mt-3">
                        Specialists: {assignedNames || 'Unassigned'}
                      </p>
                    </div>

                    <div className="mt-6 pt-4 border-t border-[#17191F]/8 flex items-center justify-between gap-3">
                      <span className="font-mono text-lg font-semibold text-[#17191F] tabular-nums">
                        {formatCurrency(svc.priceCents)}
                      </span>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => toggleServiceActive(svc.id)}
                          className={`px-2.5 py-1.5 rounded-md text-xs font-medium border transition-colors ${
                            svc.active
                              ? 'border-[#15803D]/25 text-[#15803D] bg-emerald-50/60 hover:bg-emerald-50'
                              : 'border-[#17191F]/15 text-[#858A96] bg-[#F8F7F3]'
                          }`}
                        >
                          {svc.active ? 'Active' : 'Paused'}
                        </button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openEditModal(svc)}
                          aria-label={`Edit ${svc.name}`}
                        >
                          <Edit3 className="w-3.5 h-3.5" aria-hidden="true" />
                          <span>Edit</span>
                        </Button>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      )}

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingService ? 'Edit Service' : 'Add Studio Service'}
        subtitle="Changes immediately reflect on your public customer booking page."
      >
        <form onSubmit={handleSaveService} noValidate className="space-y-4">
          <div>
            <label htmlFor="svc-name" className="block text-xs font-semibold text-[#17191F] mb-1">
              Service Name *
            </label>
            <input
              id="svc-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Executive Haircut"
              className="w-full h-10 px-3 rounded-lg border border-[#17191F]/15 text-sm"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label htmlFor="svc-category" className="block text-xs font-semibold text-[#17191F] mb-1">
                Category
              </label>
              <select
                id="svc-category"
                value={category}
                onChange={(e) => setCategory(e.target.value as ServiceCategory)}
                className="w-full h-10 px-2.5 rounded-lg border border-[#17191F]/15 text-sm bg-white"
              >
                {CATEGORIES.filter((c) => c !== 'All').map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="svc-duration" className="block text-xs font-semibold text-[#17191F] mb-1">
                Duration (min)
              </label>
              <input
                id="svc-duration"
                type="number"
                min={15}
                max={300}
                step={15}
                value={durationMinutes}
                onChange={(e) => setDurationMinutes(e.target.value)}
                className="w-full h-10 px-3 rounded-lg border border-[#17191F]/15 text-sm font-mono"
              />
            </div>
            <div>
              <label htmlFor="svc-price" className="block text-xs font-semibold text-[#17191F] mb-1">
                Price (USD)
              </label>
              <input
                id="svc-price"
                type="number"
                min={1}
                value={priceDollars}
                onChange={(e) => setPriceDollars(e.target.value)}
                className="w-full h-10 px-3 rounded-lg border border-[#17191F]/15 text-sm font-mono"
              />
            </div>
          </div>

          <div>
            <label htmlFor="svc-desc" className="block text-xs font-semibold text-[#17191F] mb-1">
              Description
            </label>
            <textarea
              id="svc-desc"
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-3 rounded-lg border border-[#17191F]/15 text-sm"
            />
          </div>

          <div>
            <p className="text-xs font-semibold text-[#17191F] mb-2">Assigned Specialists *</p>
            <div className="flex flex-wrap gap-2">
              {state?.staff.map((m) => {
                const checked = specialistIds.includes(m.id);
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => toggleSpecialist(m.id)}
                    className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors ${
                      checked
                        ? 'bg-[#E8EDFF] border-[#4665E8] text-[#4665E8]'
                        : 'bg-white border-[#17191F]/15 text-[#858A96]'
                    }`}
                  >
                    {m.name}
                  </button>
                );
              })}
            </div>
          </div>

          {formError && (
            <p className="text-xs text-[#DC2626]" role="alert">
              {formError}
            </p>
          )}

          <div className="flex justify-end gap-2.5 pt-3 border-t border-[#17191F]/10">
            <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              {editingService ? 'Save Changes' : 'Create Service'}
            </Button>
          </div>
        </form>
      </Modal>
    </DashboardLayout>
  );
}
