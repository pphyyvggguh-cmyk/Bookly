import React, { useEffect } from 'react';
import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { BooklyProvider } from './hooks/useBookly';
import { LandingPage } from './pages/LandingPage';
import { BookingPage } from './pages/BookingPage';
import { OverviewPage } from './pages/dashboard/OverviewPage';
import { AppointmentsPage } from './pages/dashboard/AppointmentsPage';
import { CalendarPage } from './pages/dashboard/CalendarPage';
import { ServicesPage } from './pages/dashboard/ServicesPage';
import { CustomersPage } from './pages/dashboard/CustomersPage';
import { AnalyticsPage } from './pages/dashboard/AnalyticsPage';
import { SettingsPage } from './pages/dashboard/SettingsPage';

function ScrollToTop() {
  const { pathname, hash } = useLocation();
  useEffect(() => {
    if (!hash) {
      window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
    }
  }, [pathname, hash]);
  return null;
}

export default function App() {
  return (
    <BooklyProvider>
      <BrowserRouter>
        <ScrollToTop />
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/book" element={<BookingPage />} />
          <Route path="/dashboard" element={<OverviewPage />} />
          <Route path="/dashboard/appointments" element={<AppointmentsPage />} />
          <Route path="/dashboard/calendar" element={<CalendarPage />} />
          <Route path="/dashboard/services" element={<ServicesPage />} />
          <Route path="/dashboard/customers" element={<CustomersPage />} />
          <Route path="/dashboard/analytics" element={<AnalyticsPage />} />
          <Route path="/dashboard/settings" element={<SettingsPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </BooklyProvider>
  );
}
