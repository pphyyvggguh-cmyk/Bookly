import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown, ArrowRight } from 'lucide-react';

export function FeaturesSection() {
  return (
    <section id="features" className="py-16 lg:py-24 border-t border-[#17191F]/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mb-12">
          <p className="text-xs font-semibold text-[#4665E8] mb-2">Core Capabilities</p>
          <h2 className="font-display text-2xl sm:text-3xl lg:text-4xl font-semibold tracking-tight text-[#17191F] text-balance">
            Designed around the rhythm of real appointment businesses.
          </h2>
        </div>

        {/* Asymmetric Editorial Bento Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          <article className="lg:col-span-7 bg-white border border-[#17191F]/10 rounded-xl p-6 sm:p-8 flex flex-col justify-between">
            <div>
              <p className="font-mono text-xs text-[#858A96]">01. Conflict-Free Availability Engine</p>
              <h3 className="font-display text-xl sm:text-2xl font-semibold text-[#17191F] mt-3">
                Automatic buffers, staff matching, and zero double bookings.
              </h3>
              <p className="text-sm sm:text-base text-[#858A96] mt-3 leading-relaxed max-w-xl">
                Every service duration, cleanup buffer, and specialist roster syncs in real time. Clients only see times that truly fit your floor capacity.
              </p>
            </div>
            <div className="mt-8 pt-5 border-t border-[#17191F]/8 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-[#17191F]">
              <span>15-min turn-around buffers</span>
              <span className="text-[#858A96]" aria-hidden="true">·</span>
              <span>Per-specialist skill routing</span>
              <span className="text-[#858A96]" aria-hidden="true">·</span>
              <span>Instant holiday blocks</span>
            </div>
          </article>

          <article className="lg:col-span-5 bg-[#17191F] text-white rounded-xl p-6 sm:p-8 flex flex-col justify-between">
            <div>
              <p className="font-mono text-xs text-white/60">02. Six-Step Mobile Booking</p>
              <h3 className="font-display text-xl sm:text-2xl font-semibold mt-3">
                Clients reserve in under 45 seconds without creating an account.
              </h3>
              <p className="text-sm text-white/75 mt-3 leading-relaxed">
                Clean service cards, live calendar dates, instant confirmation codes, and mobile-first touch targets built for smartphone browsers.
              </p>
            </div>
            <div className="mt-8">
              <Link
                to="/book"
                className="inline-flex items-center gap-2 text-xs font-semibold text-[#E8EDFF] hover:text-white transition-colors"
              >
                <span>Test customer booking flow</span>
                <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
              </Link>
            </div>
          </article>

          <article className="lg:col-span-5 bg-white border border-[#17191F]/10 rounded-xl p-6 sm:p-8">
            <p className="font-mono text-xs text-[#858A96]">03. Client Memory & Notes</p>
            <h3 className="font-display text-xl font-semibold text-[#17191F] mt-3">
              Every formula, preference, and visit history at hand.
            </h3>
            <p className="text-sm text-[#858A96] mt-3 leading-relaxed">
              Automatically build rich client profiles from every reservation—lifetime spend, visit cadence, and specialist notes without spreadsheets.
            </p>
          </article>

          <article className="lg:col-span-7 bg-[#E8EDFF]/60 border border-[#4665E8]/15 rounded-xl p-6 sm:p-8">
            <p className="font-mono text-xs text-[#4665E8]">04. Operational Clarity</p>
            <h3 className="font-display text-xl font-semibold text-[#17191F] mt-3">
              Multi-view calendar, revenue pacing, and service profitability.
            </h3>
            <p className="text-sm text-[#17191F]/75 mt-3 leading-relaxed max-w-xl">
              Inspect your week at a glance, confirm pending requests with one click, and track utilization across every chair or consultation room.
            </p>
          </article>
        </div>
      </div>
    </section>
  );
}

export function HowItWorksSection() {
  const steps = [
    {
      num: '01',
      title: 'Publish your service menu',
      body: 'Define treatment durations, pricing, preparation buffers, and assign which specialists perform each service.',
    },
    {
      num: '02',
      title: 'Share your studio booking link',
      body: 'Place BOOKLY on your website or Instagram bio. Clients choose a service, date, and open slot directly from their phone.',
    },
    {
      num: '03',
      title: 'Manage your floor from one desk',
      body: 'Track arrivals, update statuses, review client preferences, and measure weekly revenue in your Admin Workspace.',
    },
  ];

  return (
    <section id="workflow" className="py-16 lg:py-24 border-t border-[#17191F]/10 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div className="max-w-xl">
            <p className="text-xs font-semibold text-[#4665E8] mb-2">How It Works</p>
            <h2 className="font-display text-2xl sm:text-3xl lg:text-4xl font-semibold tracking-tight text-[#17191F] text-balance">
              From scattered DMs to a calm, predictable calendar.
            </h2>
          </div>
          <Link
            to="/book"
            className="inline-flex items-center gap-2 text-sm font-semibold text-[#17191F] hover:text-[#4665E8] transition-colors whitespace-nowrap shrink-0"
          >
            <span>Try the 6-step booking flow</span>
            <ArrowRight className="w-4 h-4" aria-hidden="true" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {steps.map((step) => (
            <div
              key={step.num}
              className="pt-6 border-t border-[#17191F]/15 flex flex-col justify-between"
            >
              <div>
                <span className="font-mono text-sm font-medium text-[#4665E8]">{step.num}.</span>
                <h3 className="font-display text-lg font-semibold text-[#17191F] mt-3">
                  {step.title}
                </h3>
                <p className="text-sm text-[#858A96] mt-2.5 leading-relaxed">{step.body}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function BenefitsSection() {
  const sectors = [
    {
      name: 'Barbershops & Grooming Lounges',
      metric: '62% fewer no-shows in 60 days',
      detail: 'Structured 30-to-45 minute chair blocks with instant SMS confirmations keep peak chairs filled.',
    },
    {
      name: 'Hair & Color Studios',
      metric: '+38% repeat rebookings per quarter',
      detail: 'Store toner formulas, processing durations, and stylist pairings on every client record.',
    },
    {
      name: 'Consultancies & Private Practices',
      metric: '4.5 hours saved weekly on coordination',
      detail: 'Eliminate back-and-forth emails with timezone-aware availability and clear cancellation windows.',
    },
  ];

  return (
    <section className="py-16 lg:py-24 border-t border-[#17191F]/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-start">
          <div className="lg:col-span-5 space-y-6">
            <div>
              <p className="text-xs font-semibold text-[#4665E8] mb-2">Built for Service Craft</p>
              <h2 className="font-display text-2xl sm:text-3xl font-semibold tracking-tight text-[#17191F] text-balance">
                Measured operational gains across independent studios.
              </h2>
            </div>

            <figure className="bg-white border border-[#17191F]/10 rounded-xl p-6 space-y-4">
              <blockquote className="text-sm sm:text-base text-[#17191F] leading-relaxed">
                “Switching from DMs and paper books to BOOKLY cut our weekly front-desk phone load in half and raised chair utilization from 68% to 89% within one season.”
              </blockquote>
              <figcaption className="flex items-center gap-3.5 pt-2 border-t border-[#17191F]/8">
                <img
                  src="/src/assets/images/specialist_portrait_1_1795431176515.jpg"
                  alt="Marcus Vance, Studio Director at Atelier Mercer"
                  referrerPolicy="no-referrer"
                  className="w-11 h-11 rounded-full object-cover bg-[#E8EDFF] shrink-0"
                />
                <div>
                  <p className="text-sm font-semibold text-[#17191F]">Marcus Vance</p>
                  <p className="text-xs text-[#858A96]">Studio Director, Atelier Mercer NYC</p>
                </div>
              </figcaption>
            </figure>
          </div>

          <div className="lg:col-span-7 divide-y divide-[#17191F]/10 border-y border-[#17191F]/10 bg-white rounded-xl px-6">
            {sectors.map((sector) => (
              <div key={sector.name} className="py-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="max-w-md">
                  <h3 className="font-display text-base font-semibold text-[#17191F]">
                    {sector.name}
                  </h3>
                  <p className="text-sm text-[#858A96] mt-1 leading-relaxed">{sector.detail}</p>
                </div>
                <p className="font-mono text-xs font-medium text-[#4665E8] sm:text-right shrink-0">
                  {sector.metric}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export function PricingSection() {
  const [annual, setAnnual] = useState(true);

  const plans = [
    {
      name: 'Solo Studio',
      audience: 'For independent specialists',
      monthly: 24,
      annual: 19,
      highlight: false,
      limits: [
        '1 specialist calendar',
        'Up to 150 bookings / month',
        'Custom service menu & buffers',
        'Email booking confirmations',
      ],
      cta: 'Start with Solo',
      to: '/book',
    },
    {
      name: 'Growing Team',
      audience: 'For barbershops, salons & studios',
      monthly: 59,
      annual: 47,
      highlight: true,
      limits: [
        'Up to 8 specialist calendars',
        'Unlimited bookings & client records',
        'SMS & email reminders included',
        'Revenue & utilization analytics',
      ],
      cta: 'Open Team Workspace',
      to: '/dashboard',
    },
    {
      name: 'Multi-Location',
      audience: 'For established hospitality groups',
      monthly: 129,
      annual: 103,
      highlight: false,
      limits: [
        'Unlimited staff & studio rooms',
        'Cross-location analytics rollups',
        'Priority migration & custom domain',
        'Dedicated onboarding support',
      ],
      cta: 'Explore Enterprise View',
      to: '/dashboard/analytics',
    },
  ];

  return (
    <section id="pricing" className="py-16 lg:py-24 border-t border-[#17191F]/10 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div className="max-w-xl">
            <p className="text-xs font-semibold text-[#4665E8] mb-2">Transparent Pricing</p>
            <h2 className="font-display text-2xl sm:text-3xl lg:text-4xl font-semibold tracking-tight text-[#17191F] text-balance">
              Predictable monthly plans with zero per-booking commissions.
            </h2>
          </div>

          <div className="inline-flex items-center gap-1 p-1 bg-[#F8F7F3] border border-[#17191F]/10 rounded-lg self-start">
            <button
              type="button"
              onClick={() => setAnnual(false)}
              className={`px-3.5 py-2 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                !annual ? 'bg-white text-[#17191F] shadow-sm' : 'text-[#858A96] hover:text-[#17191F]'
              }`}
            >
              Monthly
            </button>
            <button
              type="button"
              onClick={() => setAnnual(true)}
              className={`px-3.5 py-2 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                annual ? 'bg-white text-[#17191F] shadow-sm' : 'text-[#858A96] hover:text-[#17191F]'
              }`}
            >
              Annual · Save 20%
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((plan) => {
            const price = annual ? plan.annual : plan.monthly;
            return (
              <div
                key={plan.name}
                className={`rounded-xl p-6 sm:p-8 flex flex-col justify-between border ${
                  plan.highlight
                    ? 'bg-[#F8F7F3] border-[#4665E8] ring-1 ring-[#4665E8]/20'
                    : 'bg-white border-[#17191F]/12'
                }`}
              >
                <div>
                  <p className="text-xs font-medium text-[#4665E8]">{plan.audience}</p>
                  <h3 className="font-display text-xl font-semibold text-[#17191F] mt-1.5">
                    {plan.name}
                  </h3>
                  <div className="mt-5 flex items-baseline gap-1.5">
                    <span className="font-display text-4xl font-semibold text-[#17191F] tabular-nums">
                      ${price}
                    </span>
                    <span className="text-xs text-[#858A96]">
                      / month {annual ? 'billed annually' : ''}
                    </span>
                  </div>

                  <ul className="mt-6 pt-6 border-t border-[#17191F]/10 space-y-3 text-sm text-[#17191F]/85">
                    {plan.limits.map((item) => (
                      <li key={item} className="flex items-start gap-2.5">
                        <span className="text-[#4665E8] font-mono text-xs mt-0.5" aria-hidden="true">
                          —
                        </span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <Link
                  to={plan.to}
                  className={`mt-8 w-full h-11 rounded-lg text-xs font-semibold flex items-center justify-center transition-colors ${
                    plan.highlight
                      ? 'bg-[#4665E8] text-white hover:bg-[#3754D4]'
                      : 'bg-[#17191F] text-white hover:bg-[#2A2D37]'
                  }`}
                >
                  {plan.cta}
                </Link>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export function FaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      q: 'Do clients need to download an app or create an account to book?',
      a: 'No. Your BOOKLY booking page runs directly in any mobile or desktop browser. Clients select a service, date, and open time slot and confirm with their name, email, and phone in under a minute.',
    },
    {
      q: 'How does BOOKLY prevent overlapping appointments or rushed turnovers?',
      a: 'You configure a studio buffer (for example, 15 minutes between visits) and service-specific durations. Our scheduling engine automatically blocks overlapping slots per specialist.',
    },
    {
      q: 'Can I manage walk-ins and manual phone bookings alongside online reservations?',
      a: 'Yes. Inside the Admin Workspace under Appointments or Calendar, your front desk can add walk-in appointments directly to any specialist’s day and update statuses in real time.',
    },
    {
      q: 'Is BOOKLY structured to connect to a live backend like Supabase?',
      a: 'Yes. All data access runs through a dedicated repository interface cleanly separated from UI components, so connecting PostgreSQL and Supabase Auth requires swapping only the repository adapter.',
    },
  ];

  return (
    <section id="faq" className="py-16 lg:py-24 border-t border-[#17191F]/10">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-10">
          <p className="text-xs font-semibold text-[#4665E8] mb-2">Frequently Asked Questions</p>
          <h2 className="font-display text-2xl sm:text-3xl font-semibold tracking-tight text-[#17191F]">
            Answers for studio owners and solo practitioners.
          </h2>
        </div>

        <div className="divide-y divide-[#17191F]/12 border-y border-[#17191F]/12">
          {faqs.map((item, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div key={item.q}>
                <button
                  type="button"
                  aria-expanded={isOpen}
                  onClick={() => setOpenIndex(isOpen ? null : idx)}
                  className="w-full py-5 flex items-center justify-between gap-4 text-left"
                >
                  <span className="font-display text-base font-semibold text-[#17191F]">
                    {item.q}
                  </span>
                  <ChevronDown
                    className={`w-4 h-4 text-[#858A96] shrink-0 transition-transform duration-150 ${
                      isOpen ? 'rotate-180 text-[#17191F]' : ''
                    }`}
                    aria-hidden="true"
                  />
                </button>
                {isOpen && (
                  <p className="pb-5 text-sm text-[#858A96] leading-relaxed max-w-2xl">
                    {item.a}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
