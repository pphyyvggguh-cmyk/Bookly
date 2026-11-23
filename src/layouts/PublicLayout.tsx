import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { BrandMark } from '../components/BrandMark';

export function PublicLayout({ children }: { children: React.ReactNode }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const isHome = location.pathname === '/';

  const scrollOrLink = (hash: string) => {
    setMobileMenuOpen(false);
    if (isHome) {
      const el = document.getElementById(hash);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F8F7F3] text-[#17191F] overflow-x-hidden">
      <header className="sticky top-0 z-40 bg-[#F8F7F3]/95 backdrop-blur-sm border-b border-[#17191F]/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
          {/* Zone 1: Single-line Brand wordmark */}
          <BrandMark to="/" />

          {/* Zone 2: 5 concise single-line text nav links */}
          <nav
            aria-label="Primary navigation"
            className="hidden md:flex items-center gap-7 text-sm font-medium text-[#17191F]/75"
          >
            <Link
              to="/#features"
              onClick={() => scrollOrLink('features')}
              className="hover:text-[#17191F] hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
            >
              Features
            </Link>
            <Link
              to="/#workflow"
              onClick={() => scrollOrLink('workflow')}
              className="hover:text-[#17191F] hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
            >
              How it Works
            </Link>
            <Link
              to="/#pricing"
              onClick={() => scrollOrLink('pricing')}
              className="hover:text-[#17191F] hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
            >
              Pricing
            </Link>
            <Link
              to="/#faq"
              onClick={() => scrollOrLink('faq')}
              className="hover:text-[#17191F] hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
            >
              FAQ
            </Link>
            <Link
              to="/book"
              className={`hover:text-[#17191F] hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0 ${
                location.pathname === '/book' ? 'text-[#4665E8] font-semibold' : ''
              }`}
            >
              Book Online
            </Link>
          </nav>

          {/* Zone 3: 1 primary action (+ mobile menu trigger on <md) */}
          <div className="flex items-center gap-3 shrink-0">
            <Link
              to="/dashboard"
              className="hidden sm:inline-flex items-center justify-center h-9 px-4 rounded-lg bg-[#17191F] text-white text-xs font-medium hover:bg-[#2A2D37] transition-colors whitespace-nowrap shrink-0"
            >
              Admin Workspace
            </Link>
            <button
              type="button"
              onClick={() => setMobileMenuOpen((v) => !v)}
              aria-expanded={mobileMenuOpen}
              aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
              className="md:hidden w-10 h-10 rounded-lg border border-[#17191F]/15 bg-white flex items-center justify-center text-[#17191F]"
            >
              {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-[#17191F]/10 bg-white px-4 py-4 space-y-1">
            <Link
              to="/#features"
              onClick={() => scrollOrLink('features')}
              className="block py-2.5 px-3 rounded-lg text-sm font-medium text-[#17191F] hover:bg-[#F8F7F3]"
            >
              Features
            </Link>
            <Link
              to="/#workflow"
              onClick={() => scrollOrLink('workflow')}
              className="block py-2.5 px-3 rounded-lg text-sm font-medium text-[#17191F] hover:bg-[#F8F7F3]"
            >
              How it Works
            </Link>
            <Link
              to="/#pricing"
              onClick={() => scrollOrLink('pricing')}
              className="block py-2.5 px-3 rounded-lg text-sm font-medium text-[#17191F] hover:bg-[#F8F7F3]"
            >
              Pricing
            </Link>
            <Link
              to="/#faq"
              onClick={() => scrollOrLink('faq')}
              className="block py-2.5 px-3 rounded-lg text-sm font-medium text-[#17191F] hover:bg-[#F8F7F3]"
            >
              FAQ
            </Link>
            <div className="pt-2 mt-2 border-t border-[#17191F]/10 flex flex-col gap-2">
              <Link
                to="/book"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full h-11 rounded-lg bg-[#4665E8] text-white text-sm font-medium flex items-center justify-center"
              >
                Book Online
              </Link>
              <Link
                to="/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full h-11 rounded-lg bg-[#17191F] text-white text-sm font-medium flex items-center justify-center"
              >
                Admin Workspace
              </Link>
            </div>
          </div>
        )}
      </header>

      <main className="flex-1">{children}</main>

      <footer className="border-t border-[#17191F]/10 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-10">
            <div className="md:col-span-5 space-y-3">
              <BrandMark to="/" />
              <p className="text-sm text-[#858A96] max-w-sm leading-relaxed">
                Scheduling, beautifully simplified. Built for barbershops, salons, creative studios, and independent consultancies.
              </p>
            </div>
            <div className="md:col-span-2 space-y-2.5">
              <p className="text-xs font-semibold text-[#17191F]">Platform</p>
              <ul className="space-y-2 text-sm text-[#858A96]">
                <li>
                  <Link to="/book" className="hover:text-[#17191F] transition-colors">
                    Customer Booking
                  </Link>
                </li>
                <li>
                  <Link to="/dashboard" className="hover:text-[#17191F] transition-colors">
                    Admin Dashboard
                  </Link>
                </li>
                <li>
                  <Link to="/dashboard/calendar" className="hover:text-[#17191F] transition-colors">
                    Team Calendar
                  </Link>
                </li>
                <li>
                  <Link to="/dashboard/analytics" className="hover:text-[#17191F] transition-colors">
                    Revenue Analytics
                  </Link>
                </li>
              </ul>
            </div>
            <div className="md:col-span-2 space-y-2.5">
              <p className="text-xs font-semibold text-[#17191F]">Product</p>
              <ul className="space-y-2 text-sm text-[#858A96]">
                <li>
                  <Link to="/#features" onClick={() => scrollOrLink('features')} className="hover:text-[#17191F] transition-colors">
                    Features
                  </Link>
                </li>
                <li>
                  <Link to="/#workflow" onClick={() => scrollOrLink('workflow')} className="hover:text-[#17191F] transition-colors">
                    How it Works
                  </Link>
                </li>
                <li>
                  <Link to="/#pricing" onClick={() => scrollOrLink('pricing')} className="hover:text-[#17191F] transition-colors">
                    Pricing
                  </Link>
                </li>
                <li>
                  <Link to="/#faq" onClick={() => scrollOrLink('faq')} className="hover:text-[#17191F] transition-colors">
                    FAQ
                  </Link>
                </li>
              </ul>
            </div>
            <div className="md:col-span-3 space-y-2.5">
              <p className="text-xs font-semibold text-[#17191F]">Studio Contact</p>
              <p className="text-sm text-[#858A96]">concierge@bookly.app</p>
              <p className="text-sm text-[#858A96]">218 Mercer Street, New York</p>
            </div>
          </div>

          <div className="mt-10 pt-6 border-t border-[#17191F]/8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs text-[#858A96]">
            <p>© {new Date().getFullYear()} BOOKLY Inc. All rights reserved.</p>
            <p>Crafted for modern service businesses.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
