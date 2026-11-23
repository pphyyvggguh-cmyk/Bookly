# BOOKLY — Scheduling, beautifully simplified.

BOOKLY is a contemporary editorial SaaS platform for service businesses—barbershops, salons, grooming studios, and private consultancies—combining a conversion-focused public storefront, an interactive 6-step customer booking experience, and a full operations admin dashboard.

## Architecture Overview

The application is structured cleanly so persistence can transition from local browser storage to **Supabase** without rewriting UI components:

- `src/types/` — Strongly typed domain entities (`Appointment`, `ServiceItem`, `Customer`, `StaffMember`, `BusinessSettings`)
- `src/data/` — Realistic deterministic seed data (`seedData.ts`), cleanly isolated from UI and business rules
- `src/utils/` — Pure scheduling, availability slot calculation, analytics aggregation, validation, and formatting functions (covered by `node:test` unit tests)
- `src/services/` — Repository/service abstraction (`booklyRepository.ts`) ready to swap `localStorage` calls for `@supabase/supabase-js` queries
- `src/hooks/` — Shared reactive store & context (`BooklyProvider`, `useBookly`) connecting Customer Booking (`/book`) and Admin Dashboard (`/dashboard`) in real time
- `src/components/` — Reusable UI primitives (`Button`, `Modal`, `Drawer`, `EmptyState`, `Skeleton`, `StatusIndicator`, `BrandMark`)
- `src/layouts/` — `PublicLayout` and responsive `DashboardLayout`
- `src/features/` — Modular feature sections for Landing, Booking Flow, and Dashboard views
- `src/pages/` — Top-level route pages

## Design System

- **Ink Black:** `#17191F`
- **Soft Ivory:** `#F8F7F3`
- **Cobalt Blue:** `#4665E8`
- **Mist Blue:** `#E8EDFF`
- **Slate Grey:** `#858A96`
- **White:** `#FFFFFF`
- **Typography:** `Bricolage Grotesque` (display), `Plus Jakarta Sans` (body), `JetBrains Mono` (tabular metrics & codes)

## Local Development

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

### Running Tests & Typechecking

```bash
npx --yes tsx --test src/utils/scheduling.test.ts
npm run lint
npm run build
```

## Deploying to Vercel

1. Push the repository to GitHub.
2. Import the project in Vercel (`Framework Preset: Vite`, `Build Command: npm run build`, `Output Directory: dist`).
3. `vercel.json` is preconfigured with SPA fallback rewrites so nested routes like `/book` and `/dashboard/calendar` resolve cleanly.

## Future Supabase Integration

1. Install `@supabase/supabase-js`.
2. Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in `.env` (never expose `service_role` keys in client code).
3. Implement `SupabaseBooklyRepository` in `src/services/booklyRepository.ts` adhering to the `BooklyRepository` interface.
