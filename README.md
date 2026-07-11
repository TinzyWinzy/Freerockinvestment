# Freerock Solar & Energy PWA

**Stack:** Next.js 16 · React 19 · Tailwind 4 · Framer Motion · Zustand · Supabase · Zod  
**Payments:** Paynow Zimbabwe (EcoCash, Innbucks, Telecash, Bank Transfer, Visa/MC)  
**Target:** Zimbabwe residential & commercial solar market

---

## Architecture

```
src/
├── app/
│   ├── (customer)/           # Customer-facing PWA routes
│   │   ├── page.tsx           # Home — hero, service cards, trust badges
│   │   ├── solar/             # Main sales funnel (configure → quote → payment → confirmation)
│   │   ├── custom-design/     # 3D design & simulation requests
│   │   ├── audit-repair/      # Energy audit & fault repair bookings
│   │   ├── training/          # Solar installation course enrollment
│   │   ├── quotes/            # Saved quotes list
│   │   ├── contact/           # Contact page with social links
│   │   └── layout.tsx         # Mobile-first shell with responsive desktop nav
│   ├── admin/                 # Admin dashboard (protected by Supabase Auth)
│   │   ├── leads/             # Lead table with filters, status updates, delete
│   │   ├── schedule/          # Calendar view for installs/audits/training
│   │   ├── services/          # Package & campaign management
│   │   ├── analytics/         # Dashboard metrics, charts, export CSV
│   │   ├── training/          # Student roster, intake management
│   │   ├── settings/          # Exchange rate override, business info
│   │   └── login/             # Admin authentication
│   └── api/                   # 21 server routes (see openapi.json)
├── components/
│   ├── ui/                    # Design primitives (button, card, input, select, toast, badge, accordion, progress)
│   ├── Container.tsx          # max-w-4xl wrapper
│   ├── AuthGuard.tsx          # Admin session guard
│   ├── ErrorBoundary.tsx      # React error boundary with retry
│   └── LoadingSkeleton.tsx    # Card/Form/List shimmer skeletons
└── lib/
    ├── constants.ts           # Solar packages, provinces, pricing tables
    ├── validations.ts         # Zod schemas with Postel's Law phone normalization
    ├── pricing.ts             # Shared pricing calculator (server + client)
    ├── api.ts                 # Typed client wrapper for all API routes
    ├── store.ts               # Zustand store (wizard state, offline quotes, toast queue)
    ├── offline-sync.ts        # IndexedDB queue + background sync for offline submissions
    ├── supabase.ts / supabase-server.ts  # Supabase client helpers
    ├── utils.ts               # cn(), formatUSD(), formatZIG(), generateQuoteId(), localStorage helpers
    ├── whatsapp.ts            # WhatsApp link & template message builders
    └── rate-limit.ts          # In-memory sliding-window rate limiter
```

### Key Design Decisions

**Graceful degradation.** Every API route tries Supabase first, returns a fully-formed response on success, and falls through to mock data if Supabase is unreachable. The customer never sees an error because a database write failed — the response is always pre-computed in code before the database is touched.

**Canonical quote shape.** `POST /api/quote`, `GET /api/quote/[id]`, and the offline fallback all return identical `Quote` objects. Every consumer (quote page, payment, invoice, admin leads) works against exactly one shape.

**Postel's Law on phone input.** All phone validators normalize whitespace and dashes before matching the `+263XXXXXXXXX` pattern. A user typing the placeholder format (`+263 77 123 4567`) passes validation — no more rejection for writing exactly what the placeholder shows.

**Offline-first quote generation.** The solar wizard persists to Zustand + localStorage on every step. When network is unavailable during final quote generation, the full quote object is computed client-side (using the same `pricing.ts` engine as the API), saved locally, and queued in IndexedDB for background sync when connectivity returns.

---

## Setup

### Environment

Copy `.env.example` to `.env.local`:

| Variable | Required | Description |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Yes | Supabase anon/publishable key |
| `PAYNOW_MERCHANT_ID` | No | Paynow integration ID (quotes work without it) |
| `PAYNOW_MERCHANT_KEY` | No | Paynow integration key |
| `NEXT_PUBLIC_SITE_URL` | No | Used for Paynow result_url and OG images |
| `ADMIN_SECRET` | No | Required to seed first admin via `/api/admin/seed` |

### Database

Run `supabase-schema.sql` in your Supabase SQL editor. It creates 9 tables with RLS policies, indexes, and seed data for solar packages.

### Commands

```bash
npm install           # Install dependencies
npm run dev           # Start development server (localhost:3000)
npm run build         # Production build
npm run lint          # ESLint check
```

---

## API Reference

Full OpenAPI 3.0 spec available at [`/openapi.json`](/openapi.json).  
21 routes grouped into 8 categories:

### Quotes
| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/quote` | Create solar quote (server-side pricing calc) |
| GET | `/api/quote/[id]` | Get quote by ID |
| PATCH | `/api/quote/[id]` | Update payment/quote status |
| DELETE | `/api/quote/[id]` | Remove quote |

### Payments
| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/payment/initiate` | Create Paynow checkout link |
| POST | `/api/payment/verify` | Paynow result webhook |
| GET | `/api/payment/verify` | Poll Paynow status |
| POST | `/api/invoice/generate` | Generate printable HTML invoice |

### Services & Training
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/services` | List active solar packages |
| GET | `/api/services/[id]` | Get package details |
| GET | `/api/training/intakes` | List upcoming training dates |
| POST | `/api/training/enroll` | Enroll in training (3 req/h rate limit) |

### Customer Requests
| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/custom-design` | Submit custom design request |
| POST | `/api/audit-repair` | Book energy audit or repair |

### Admin
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/admin/leads` | List all quotes as leads (with filters) |
| GET | `/api/admin/analytics` | Dashboard numbers & cohort data |
| POST | `/api/admin/seed` | Create first admin user (requires `x-admin-secret`) |

### System
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/rate` | Current USD/ZIG exchange rate |
| POST | `/api/rate` | Override exchange rate (admin) |
| POST | `/api/upload` | Upload image (JPEG/PNG/WebP, max 5MB) |
| POST | `/api/auth/otp` | Send phone OTP (Supabase Auth, 5 req/h) |
| GET | `/api/cron/rate` | Vercel Cron: daily rate fetch |

---

## Customer Funnel

```
Home → Solar Packages → Configure Wizard (5 steps)
  → Quote (review, WhatsApp share, download invoice)
  → Payment (EcoCash/Innbucks/etc. via Paynow)
  → Confirmation (receipt, WhatsApp share, back to home)
```

All side-doors (Custom Design, Audit & Repair, Training) follow the same pattern: form → API → success screen with reference ID and WhatsApp share.

**Offline behavior.** The wizard saves to localStorage on every field change. If the quote generation API is unreachable, the full quote is computed client-side (exact same `pricing.ts` engine), saved to localStorage, and queued in IndexedDB for background re-sync. The customer sees the same quote page whether online or offline.

---

## Accessibility

- `<label htmlFor>` + `aria-invalid` + `aria-describedby` on every form field
- `role="radiogroup"` + `aria-checked` on selection controls
- `role="dialog"` + `aria-modal` on all modals
- SVG icons in buttons have `aria-label` when used without visible text
- Toast notifications use `aria-live="polite"` + `role="alert"`
- Progress indicators use `role="progressbar"` with `aria-valuenow/min/max`
- `prefers-reduced-motion` respected globally — disables all animations
- `focus-visible` ring on all interactive elements (keyboard-only focus indicator)

---

## Laws of UX Applied

| Law | Implementation |
|---|---|
| Fitts's Law | Button targets ≥44px (default `h-11`), inputs ≥48px (`h-12`) |
| Postel's Law | Phone input normalizes spaces/dashes before validation |
| Doherty Threshold | No artificial delays — skeletons only during real async work |
| Consistency | Single token layer (`--color-brand-*`), Button/Card components use tokens |
| Miller's Law | Wizard shows "Step 3 of 5: Location & Access" |
| Peak-End Rule | Payment flow functional end-to-end; success checkmark animates |
| Law of Proximity | Toast positioned clear of bottom nav + WhatsApp FAB |

---

## Deployment

The project is configured for Vercel (`vercel.json` includes security headers, SW config, and admin redirect).

```bash
vercel --prod
```

Only `NEXT_PUBLIC_*` variables are available client-side. Paynow keys and ADMIN_SECRET are server-only.

### Vercel Cron

Add to your `vercel.json` to auto-fetch the exchange rate daily:

```json
{
  "crons": [
    { "path": "/api/cron/rate", "schedule": "0 4 * * *" }
  ]
}
```

---

## WhatsApp Integration

All channels use `wa.me` links with pre-built message templates in `lib/whatsapp.ts`:

- **Quote ready** — link to payment page
- **Payment confirmed** — deposit details, installer info, tracking link
- **Training enrolled** — intake date, venue, what to bring

Phone number is centralized in `lib/constants.ts` (`SITE.phone`) and `lib/whatsapp.ts` (`PHONE`).

---

## Invoice

`POST /api/invoice/generate` returns a styled HTML document suitable for printing. It includes company details (123 Chinhoyi Mall, Office 12), quote/customer info, itemized pricing, deposit breakdown, and warranty terms. No external PDF library — HTML print is lighter, faster, and zero-dependency.
