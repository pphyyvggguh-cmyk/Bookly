import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, CalendarCheck } from 'lucide-react';
import { PublicLayout } from '../layouts/PublicLayout';
import { InteractivePreview } from '../features/landing/InteractivePreview';
import {
  BenefitsSection,
  FaqSection,
  FeaturesSection,
  HowItWorksSection,
  PricingSection,
} from '../features/landing/LandingSections';

export function LandingPage() {
  const [heroImageError, setHeroImageError] = useState(false);

  return (
    <PublicLayout>
      {/* Hero Section */}
      <section className="py-12 sm:py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-stretch">
            <div className="lg:col-span-6 flex flex-col justify-between py-2">
              <div>
                <p className="text-xs font-semibold text-[#4665E8] mb-4">
                  Editorial Appointment Platform
                </p>
                <h1
                  className="font-display font-semibold tracking-[-0.03em] text-[#17191F] leading-[1.05] text-balance"
                  style={{ fontSize: 'clamp(2.45rem, 4.4vw, 3.85rem)' }}
                >
                  Scheduling, beautifully simplified.
                </h1>
                <p className="text-base sm:text-lg text-[#858A96] mt-6 max-w-xl leading-relaxed">
                  BOOKLY gives barbershops, salons, creative studios, and consultancies a calm booking storefront for clients and a sharp operational workspace for your team.
                </p>

                <div className="mt-8 flex flex-wrap items-center gap-3.5">
                  <Link
                    to="/book"
                    className="inline-flex items-center justify-center gap-2 h-12 px-6 rounded-lg bg-[#4665E8] text-white text-sm font-semibold hover:bg-[#3754D4] transition-colors whitespace-nowrap"
                  >
                    <CalendarCheck className="w-4 h-4" aria-hidden="true" />
                    <span>Book an Appointment</span>
                  </Link>
                  <Link
                    to="/dashboard"
                    className="inline-flex items-center justify-center gap-2 h-12 px-6 rounded-lg bg-white border border-[#17191F]/15 text-[#17191F] text-sm font-semibold hover:bg-[#17191F] hover:text-white transition-colors whitespace-nowrap"
                  >
                    <span>Open Admin Dashboard</span>
                    <ArrowRight className="w-4 h-4" aria-hidden="true" />
                  </Link>
                </div>
              </div>

              <div className="mt-10 pt-6 border-t border-[#17191F]/10 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-[#858A96]">
                <span className="font-medium text-[#17191F]">Trusted by independent studios</span>
                <span aria-hidden="true">·</span>
                <span>Zero per-booking fees</span>
                <span aria-hidden="true">·</span>
                <span>Mobile-ready client flow</span>
              </div>
            </div>

            <div className="lg:col-span-6">
              <div className="h-full min-h-[300px] lg:min-h-[460px] rounded-xl overflow-hidden border border-[#17191F]/12 bg-[#E8EDFF]/40 relative">
                {!heroImageError ? (
                  <img
                    src="/src/assets/images/hero_editorial_studio_1795431175882.jpg"
                    alt="Modern grooming and aesthetics studio interior powered by BOOKLY"
                    referrerPolicy="no-referrer"
                    onError={() => setHeroImageError(true)}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center p-8 text-center bg-gradient-to-br from-[#E8EDFF] via-[#F8F7F3] to-white">
                    <p className="font-display text-xl font-semibold text-[#17191F]">
                      Atelier Mercer · New York
                    </p>
                    <p className="text-sm text-[#858A96] mt-1">
                      Appointment scheduling & floor management
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Full-width 4-column operational proof strip */}
          <div className="mt-12 grid grid-cols-2 lg:grid-cols-4 border border-[#17191F]/10 rounded-xl bg-white divide-y sm:divide-y-0 sm:divide-x divide-[#17191F]/10 overflow-hidden">
            <div className="p-5 sm:p-6">
              <p className="font-display text-2xl sm:text-3xl font-semibold text-[#17191F] tabular-nums">
                42s
              </p>
              <p className="text-xs text-[#858A96] mt-1">Median client booking completion</p>
            </div>
            <div className="p-5 sm:p-6">
              <p className="font-display text-2xl sm:text-3xl font-semibold text-[#17191F] tabular-nums">
                62%
              </p>
              <p className="text-xs text-[#858A96] mt-1">Reduction in missed appointments</p>
            </div>
            <div className="p-5 sm:p-6">
              <p className="font-display text-2xl sm:text-3xl font-semibold text-[#17191F] tabular-nums">
                +38%
              </p>
              <p className="text-xs text-[#858A96] mt-1">Repeat client rebooking rate</p>
            </div>
            <div className="p-5 sm:p-6">
              <p className="font-display text-2xl sm:text-3xl font-semibold text-[#17191F] tabular-nums">
                0%
              </p>
              <p className="text-xs text-[#858A96] mt-1">Commission on studio bookings</p>
            </div>
          </div>
        </div>
      </section>

      <InteractivePreview />
      <FeaturesSection />
      <HowItWorksSection />
      <BenefitsSection />
      <PricingSection />
      <FaqSection />

      {/* Closing CTA */}
      <section className="py-16 lg:py-20 border-t border-[#17191F]/10 bg-[#17191F] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
          <div className="max-w-xl">
            <h2 className="font-display text-2xl sm:text-3xl lg:text-4xl font-semibold tracking-tight text-balance">
              Ready to see BOOKLY in action?
            </h2>
            <p className="text-sm sm:text-base text-white/75 mt-3 leading-relaxed">
              Reserve a test visit as a customer, then open the Admin Workspace to see the booking appear immediately on your live studio calendar.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3.5 shrink-0">
            <Link
              to="/book"
              className="inline-flex items-center justify-center h-12 px-6 rounded-lg bg-[#4665E8] text-white text-sm font-semibold hover:bg-[#3754D4] transition-colors whitespace-nowrap"
            >
              Launch Customer Booking
            </Link>
            <Link
              to="/dashboard"
              className="inline-flex items-center justify-center h-12 px-6 rounded-lg bg-white/10 border border-white/20 text-white text-sm font-semibold hover:bg-white hover:text-[#17191F] transition-colors whitespace-nowrap"
            >
              Open Admin Dashboard
            </Link>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
