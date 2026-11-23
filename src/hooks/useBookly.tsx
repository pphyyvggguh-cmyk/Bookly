import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import {
  addCustomerInState,
  booklyRepository,
  createAppointmentInState,
  type CreateAppointmentInput,
  updateAppointmentStatusInState,
  updateSettingsInState,
  upsertServiceInState,
} from '../services/booklyRepository';
import type {
  Appointment,
  AppointmentStatus,
  BooklyStoreState,
  BusinessSettings,
  Customer,
  ServiceItem,
} from '../types/bookly';

interface BooklyContextValue {
  state: BooklyStoreState | null;
  isLoading: boolean;
  error: string | null;
  createAppointment: (input: CreateAppointmentInput) => Promise<Appointment>;
  updateAppointmentStatus: (id: string, status: AppointmentStatus) => Promise<void>;
  upsertService: (service: Omit<ServiceItem, 'id'> & { id?: string }) => Promise<void>;
  toggleServiceActive: (serviceId: string) => Promise<void>;
  addCustomer: (customer: Omit<Customer, 'id' | 'joinedDate'>) => Promise<void>;
  updateSettings: (settings: BusinessSettings) => Promise<void>;
  resetDemoData: () => Promise<void>;
}

const BooklyContext = createContext<BooklyContextValue | null>(null);

export function BooklyProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<BooklyStoreState | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    booklyRepository
      .loadState()
      .then((loaded) => {
        if (active) {
          setState(loaded);
          setIsLoading(false);
        }
      })
      .catch(() => {
        if (active) {
          setError('Unable to load studio scheduling data.');
          setIsLoading(false);
        }
      });
    return () => {
      active = false;
    };
  }, []);

  const persist = useCallback(async (next: BooklyStoreState) => {
    setState(next);
    await booklyRepository.saveState(next);
  }, []);

  const createAppointment = useCallback(
    async (input: CreateAppointmentInput) => {
      if (!state) throw new Error('Workspace not initialized');
      const { nextState, created } = createAppointmentInState(state, input);
      await persist(nextState);
      return created;
    },
    [state, persist]
  );

  const updateAppointmentStatus = useCallback(
    async (id: string, status: AppointmentStatus) => {
      if (!state) return;
      const nextState = updateAppointmentStatusInState(state, id, status);
      await persist(nextState);
    },
    [state, persist]
  );

  const upsertService = useCallback(
    async (service: Omit<ServiceItem, 'id'> & { id?: string }) => {
      if (!state) return;
      const nextState = upsertServiceInState(state, service);
      await persist(nextState);
    },
    [state, persist]
  );

  const toggleServiceActive = useCallback(
    async (serviceId: string) => {
      if (!state) return;
      const target = state.services.find((s) => s.id === serviceId);
      if (!target) return;
      const nextState = upsertServiceInState(state, { ...target, active: !target.active });
      await persist(nextState);
    },
    [state, persist]
  );

  const addCustomer = useCallback(
    async (customer: Omit<Customer, 'id' | 'joinedDate'>) => {
      if (!state) return;
      const nextState = addCustomerInState(state, customer);
      await persist(nextState);
    },
    [state, persist]
  );

  const updateSettings = useCallback(
    async (settings: BusinessSettings) => {
      if (!state) return;
      const nextState = updateSettingsInState(state, settings);
      await persist(nextState);
    },
    [state, persist]
  );

  const resetDemoData = useCallback(async () => {
    const fresh = await booklyRepository.resetDemoState();
    setState(fresh);
  }, []);

  return (
    <BooklyContext.Provider
      value={{
        state,
        isLoading,
        error,
        createAppointment,
        updateAppointmentStatus,
        upsertService,
        toggleServiceActive,
        addCustomer,
        updateSettings,
        resetDemoData,
      }}
    >
      {children}
    </BooklyContext.Provider>
  );
}

export function useBookly(): BooklyContextValue {
  const ctx = useContext(BooklyContext);
  if (!ctx) {
    throw new Error('useBookly must be used inside BooklyProvider');
  }
  return ctx;
}
