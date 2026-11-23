import React, { useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import {
  BarChart3,
  Briefcase,
  CalendarDays,
  ChevronRight,
  Clock,
  ExternalLink,
  LayoutDashboard,
  Menu,
  Settings,
  Users,
  X,
} from 'lucide-react';
import { BrandMark } from '../components/BrandMark';
import { useBookly } from '../hooks/useBookly';

const NAV_ITEMS = [
  { to: '/dashboard', label: 'Overview', icon: LayoutDashboard, end: true },
  { to: '/dashboard/appointments', label: 'Appointments', icon: Clock, end: false },
  { to: '/dashboard/calendar', label: 'Calendar', icon: CalendarDays, end: false },
  { to: '/dashboard/services', label: 'Services', icon: Briefcase, end: false },
  { to: '/dashboard/customers', label: 'Customers', icon: Users, end: false },
  { to: '/dashboard/analytics', label: 'Analytics', icon: BarChart3, end: false },
  { to: '/dashboard/settings', label: 'Settings', icon: Settings, end: false },
];

const ROUTE_TITLES: Record<string, string> = {
  '/dashboard': 'Overview',
  '/dashboard/appointments': 'Appointments',
  '/dashboard/calendar': 'Calendar',
  '/dashboard/services': 'Services',
  '/dashboard/customers': 'Customers',
  '/dashboard/analytics': 'Analytics',
  '/dashboard/settings': 'Settings',
};

export function DashboardLayout({
  children,
  headerAction,
}: {
  children: React.ReactNode;
  headerAction?: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const { state } = useBookly();

  const currentTitle = ROUTE_TITLES[location.pathname] || 'Overview';
  const studioName = state?.settings.businessName || 'Atelier Mercer';

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      <div className="h-16 px-6 flex items-center justify-between border-b border-[#17191F]/10 shrink-0">
        <BrandMark to="/" />
        <button
          type="button"
          onClick={() => setSidebarOpen(false)}
          aria-label="Close sidebar"
          className="lg:hidden w-9 h-9 rounded-lg flex items-center justify-center text-[#858A96] hover:text-[#17191F]"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="px-6 py-4 border-b border-[#17191F]/8">
        <p className="text-xs font-medium text-[#858A96]">Studio Workspace</p>
        <p className="text-sm font-semibold text-[#17191F] truncate mt-0.5">{studioName}</p>
      </div>

      <nav aria-label="Dashboard navigation" className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                  isActive
                    ? 'bg-[#E8EDFF] text-[#4665E8]'
                    : 'text-[#17191F]/75 hover:text-[#17191F] hover:bg-[#F8F7F3]'
                }`
              }
            >
              <Icon className="w-4 h-4 shrink-0" aria-hidden="true" />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      <div className="p-4 border-t border-[#17191F]/10 space-y-2 shrink-0">
        <Link
          to="/book"
          className="flex items-center justify-between px-3 py-2.5 rounded-lg bg-[#F8F7F3] border border-[#17191F]/10 text-xs font-medium text-[#17191F] hover:border-[#4665E8]/40 transition-colors"
        >
          <span>Customer Booking Page</span>
          <ExternalLink className="w-3.5 h-3.5 text-[#858A96]" aria-hidden="true" />
        </Link>
        <Link
          to="/"
          className="block px-3 py-1.5 text-xs text-[#858A96] hover:text-[#17191F] transition-colors"
        >
          Back to Public Landing
        </Link>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F8F7F3] text-[#17191F] flex overflow-x-hidden">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:block w-64 shrink-0 bg-white border-r border-[#17191F]/10 sticky top-0 h-screen">
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar Drawer */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-[#17191F]/40"
            onClick={() => setSidebarOpen(false)}
            aria-hidden="true"
          />
          <aside className="relative z-10 w-68 max-w-[82vw] bg-white h-full border-r border-[#17191F]/10 shadow-2xl">
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* Main Content Viewport */}
      <div className="flex-1 min-w-0 flex flex-col">
        <header className="sticky top-0 z-30 h-16 bg-white/95 backdrop-blur-sm border-b border-[#17191F]/10 px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open navigation sidebar"
              className="lg:hidden w-10 h-10 rounded-lg border border-[#17191F]/12 bg-white flex items-center justify-center text-[#17191F] shrink-0"
            >
              <Menu className="w-4 h-4" />
            </button>
            <div className="flex items-center gap-2 text-sm min-w-0">
              <span className="hidden sm:inline text-[#858A96] whitespace-nowrap">{studioName}</span>
              <ChevronRight className="hidden sm:inline w-3.5 h-3.5 text-[#858A96] shrink-0" aria-hidden="true" />
              <h1 className="font-display text-base sm:text-lg font-semibold text-[#17191F] truncate">
                {currentTitle}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            {headerAction}
            <Link
              to="/book"
              className="hidden sm:inline-flex items-center justify-center h-9 px-3.5 rounded-lg border border-[#17191F]/15 bg-white text-xs font-medium text-[#17191F] hover:bg-[#F8F7F3] transition-colors whitespace-nowrap shrink-0"
            >
              Booking View
            </Link>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-[1400px] w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
