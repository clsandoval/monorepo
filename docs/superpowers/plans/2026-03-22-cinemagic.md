# CineMagic Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a Metro Manila cinema showtime aggregator with scraping pipeline, TMDB enrichment, freemium personalization, and monochrome minimal UI.

**Architecture:** Monolithic Next.js 16 (App Router) with Supabase (Postgres + Auth + RLS). Scrapers run as API routes triggered by Vercel Cron. Recommendation engine implemented as a Postgres function. Monochrome minimal UI (pure black/white, Bebas Neue + Space Mono).

**Tech Stack:** Next.js 16, React 19, Supabase, Tailwind CSS 4, shadcn/ui, Playwright (scraping + E2E tests), Vitest, TMDB API, Stripe, Google Calendar API

**Spec:** `docs/superpowers/specs/2026-03-22-cinema-showtime-aggregator-design.md`

---

## File Structure

```
apps/cinemagic/
├── src/
│   ├── app/
│   │   ├── layout.tsx                          # Root layout: fonts, theme, metadata
│   │   ├── globals.css                         # Tailwind imports + monochrome theme
│   │   ├── page.tsx                            # Homepage: date strip + movie rows
│   │   ├── (public)/
│   │   │   ├── movies/
│   │   │   │   ├── page.tsx                    # All movies list
│   │   │   │   └── [slug]/page.tsx             # Movie detail + showtimes by cinema
│   │   │   ├── cinemas/
│   │   │   │   ├── page.tsx                    # All cinemas list + map
│   │   │   │   └── [slug]/page.tsx             # Cinema detail + showtimes by movie
│   │   │   └── showtimes/
│   │   │       └── page.tsx                    # Power filter page
│   │   ├── (auth)/
│   │   │   ├── login/page.tsx                  # Login page
│   │   │   ├── signup/page.tsx                 # Signup page
│   │   │   ├── dashboard/page.tsx              # User dashboard (free + premium)
│   │   │   ├── watchlist/page.tsx              # User watchlist
│   │   │   ├── profile/
│   │   │   │   ├── page.tsx                    # Profile + preferences
│   │   │   │   └── calendar/page.tsx           # Calendar sync (premium)
│   │   │   ├── suggestions/page.tsx            # Smart suggestions (premium)
│   │   │   └── layout.tsx                      # Auth layout with session check
│   │   ├── (admin)/
│   │   │   ├── admin/
│   │   │   │   ├── scraper/page.tsx            # Scraper health dashboard
│   │   │   │   ├── movies/review/page.tsx      # TMDB match review
│   │   │   │   └── cinemas/page.tsx            # Cinema management
│   │   │   └── layout.tsx                      # Admin layout with role check
│   │   └── api/
│   │       ├── scrape/[chain]/route.ts         # Per-chain scraper endpoint
│   │       ├── enrich/route.ts                 # TMDB enrichment endpoint
│   │       ├── suggest/route.ts                # Trigger recommendation recompute
│   │       ├── webhooks/
│   │       │   ├── stripe/route.ts             # Stripe webhook handler
│   │       │   └── calendar/route.ts           # Calendar sync webhook
│   │       └── auth/callback/route.ts          # Supabase auth callback
│   ├── lib/
│   │   ├── supabase/
│   │   │   ├── client.ts                       # Browser Supabase client
│   │   │   ├── server.ts                       # Server Supabase client
│   │   │   ├── middleware.ts                    # Session refresh middleware
│   │   │   └── types.ts                        # Generated DB types
│   │   ├── scrapers/
│   │   │   ├── types.ts                        # ChainScraper interface + RawShowtime
│   │   │   ├── base.ts                         # Base scraper with shared logic
│   │   │   ├── sm-cinema.ts                    # SM Cinema scraper
│   │   │   ├── ayala.ts                        # Ayala Malls scraper
│   │   │   ├── robinsons.ts                    # Robinsons scraper
│   │   │   ├── vista.ts                        # Vista Mall scraper (future)
│   │   │   ├── gateway.ts                      # Gateway scraper (future)
│   │   │   ├── registry.ts                     # Scraper registry (chain → scraper)
│   │   │   └── ingest.ts                       # Upsert logic: normalize + dedup + save
│   │   ├── tmdb/
│   │   │   ├── client.ts                       # TMDB API client
│   │   │   ├── match.ts                        # Fuzzy title matching
│   │   │   └── types.ts                        # TMDB response types
│   │   ├── recommendations/
│   │   │   ├── score.ts                        # Scoring function (calls Postgres fn)
│   │   │   └── types.ts                        # Suggestion types
│   │   ├── stripe/
│   │   │   ├── client.ts                       # Stripe client
│   │   │   └── plans.ts                        # Plan IDs + tier mapping
│   │   ├── calendar/
│   │   │   └── google.ts                       # Google Calendar API client
│   │   └── utils.ts                            # cn(), formatCurrency, slugify
│   ├── components/
│   │   ├── ui/                                 # shadcn components
│   │   ├── layout/
│   │   │   ├── header.tsx                      # Top nav bar
│   │   │   ├── footer.tsx                      # Minimal footer
│   │   │   └── mobile-nav.tsx                  # Bottom nav (Now/Soon/Cinemas/Profile)
│   │   ├── movies/
│   │   │   ├── movie-row.tsx                   # Single movie row (poster + title + showtimes)
│   │   │   ├── movie-grid.tsx                  # Grid of movie cards
│   │   │   └── movie-detail.tsx                # Full movie detail section
│   │   ├── cinemas/
│   │   │   ├── cinema-card.tsx                 # Cinema list item
│   │   │   ├── cinema-map.tsx                  # Map view with markers
│   │   │   └── cinema-schedule.tsx             # Showtimes grouped by movie
│   │   ├── showtimes/
│   │   │   ├── showtime-pill.tsx               # Individual showtime badge
│   │   │   ├── showtime-filters.tsx            # Date/time/area/format filters
│   │   │   └── showtime-list.tsx               # Filtered showtime results
│   │   ├── dashboard/
│   │   │   ├── suggestion-card.tsx             # Single suggestion with reason
│   │   │   ├── upgrade-prompt.tsx              # Premium upgrade CTA
│   │   │   └── watchlist-preview.tsx           # Compact watchlist view
│   │   ├── date-strip.tsx                      # Horizontal scrollable date picker
│   │   └── search-bar.tsx                      # Global search component
│   ├── hooks/
│   │   ├── use-location.ts                     # Browser geolocation hook
│   │   └── use-debounce.ts                     # Debounce hook for search
│   └── middleware.ts                           # Auth middleware (protects /dashboard, etc.)
├── supabase/
│   ├── config.toml                             # Local Supabase config
│   └── migrations/
│       ├── 00001_create_cinemas.sql
│       ├── 00002_create_movies.sql
│       ├── 00003_create_showtimes.sql
│       ├── 00004_create_user_profiles.sql
│       ├── 00005_create_preferred_cinemas.sql
│       ├── 00006_create_watchlist.sql
│       ├── 00007_create_suggestion_cache.sql
│       ├── 00008_create_indexes.sql
│       ├── 00009_create_rls_policies.sql
│       ├── 00010_create_recommendation_function.sql
│       └── 00011_seed_cinemas.sql
├── __tests__/
│   ├── unit/
│   │   ├── tmdb-match.test.ts
│   │   ├── ingest.test.ts
│   │   ├── score.test.ts
│   │   └── utils.test.ts
│   └── e2e/
│       ├── homepage.spec.ts
│       ├── movies.spec.ts
│       ├── cinemas.spec.ts
│       ├── showtimes.spec.ts
│       ├── auth-flow.spec.ts
│       ├── dashboard.spec.ts
│       └── admin.spec.ts
├── package.json
├── next.config.ts
├── tsconfig.json
├── vitest.config.ts
├── playwright.config.ts
├── components.json                             # shadcn config
├── .env.local.example
└── postcss.config.mjs
```

---

## Task 1: Project Scaffold

**Files:**
- Create: `apps/cinemagic/package.json`
- Create: `apps/cinemagic/next.config.ts`
- Create: `apps/cinemagic/tsconfig.json`
- Create: `apps/cinemagic/postcss.config.mjs`
- Create: `apps/cinemagic/vitest.config.ts`
- Create: `apps/cinemagic/playwright.config.ts`
- Create: `apps/cinemagic/.env.local.example`
- Create: `apps/cinemagic/src/app/layout.tsx`
- Create: `apps/cinemagic/src/app/globals.css`
- Create: `apps/cinemagic/src/app/page.tsx`
- Create: `apps/cinemagic/src/lib/utils.ts`

- [ ] **Step 1: Create package.json**

```json
{
  "name": "cinemagic",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "test": "vitest run",
    "test:watch": "vitest",
    "test:e2e": "playwright test",
    "typecheck": "tsc --noEmit"
  },
  "dependencies": {
    "@supabase/ssr": "^0.9.0",
    "@supabase/supabase-js": "^2.99.0",
    "class-variance-authority": "^0.7.1",
    "clsx": "^2.1.1",
    "next": "16.1.6",
    "react": "19.2.3",
    "react-dom": "19.2.3",
    "tailwind-merge": "^3.0.0",
    "zod": "^4.3.0"
  },
  "devDependencies": {
    "@playwright/test": "^1.58.0",
    "@tailwindcss/postcss": "^4",
    "@testing-library/react": "^16.3.0",
    "@types/node": "^22",
    "@types/react": "^19",
    "@types/react-dom": "^19",
    "tailwindcss": "^4",
    "typescript": "^5",
    "vitest": "^4.1.0"
  }
}
```

- [ ] **Step 2: Create next.config.ts**

```typescript
import type { NextConfig } from "next";
const nextConfig: NextConfig = { output: "standalone" };
export default nextConfig;
```

- [ ] **Step 3: Create tsconfig.json**

```json
{
  "compilerOptions": {
    "target": "ES2017",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "react-jsx",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "paths": { "@/*": ["./src/*"] }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

- [ ] **Step 4: Create postcss.config.mjs**

```javascript
/** @type {import('postcss-load-config').Config} */
const config = {
  plugins: {
    "@tailwindcss/postcss": {},
  },
};
export default config;
```

- [ ] **Step 5: Create vitest.config.ts**

```typescript
import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    include: ["__tests__/unit/**/*.test.ts"],
  },
  resolve: {
    alias: { "@": path.resolve(__dirname, "./src") },
  },
});
```

- [ ] **Step 6: Create playwright.config.ts**

```typescript
import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./__tests__/e2e",
  use: { baseURL: "http://localhost:3000" },
  webServer: {
    command: "npm run dev",
    port: 3000,
    reuseExistingServer: true,
  },
});
```

- [ ] **Step 7: Create .env.local.example**

```
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
TMDB_API_KEY=your-tmdb-api-key
STRIPE_SECRET_KEY=your-stripe-secret-key
STRIPE_WEBHOOK_SECRET=your-webhook-secret
STRIPE_PRICE_MONTHLY=price_xxx
STRIPE_PRICE_YEARLY=price_xxx
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
CRON_SECRET=your-cron-secret
```

- [ ] **Step 8: Create globals.css with monochrome theme**

```css
@import "tailwindcss";

@theme {
  --color-bg: #000;
  --color-fg: #fff;
  --color-border: #222;
  --color-border-subtle: #111;
  --color-muted: #444;
  --color-muted-subtle: #333;
  --color-inverted-bg: #fff;
  --color-inverted-fg: #000;

  --font-display: "Bebas Neue", sans-serif;
  --font-mono: "Space Mono", monospace;
  --font-body: "Space Mono", monospace;
}

@layer base {
  * {
    @apply border-border;
  }
  body {
    @apply bg-bg text-fg font-body antialiased;
  }
}
```

- [ ] **Step 9: Create src/lib/utils.ts**

```typescript
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function formatPrice(cents: number): string {
  return `₱${(cents / 100).toLocaleString("en-PH", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })}`;
}
```

- [ ] **Step 10: Create root layout with fonts**

```typescript
// src/app/layout.tsx
import type { Metadata } from "next";
import { Bebas_Neue, Space_Mono } from "next/font/google";
import "./globals.css";

const bebasNeue = Bebas_Neue({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

const spaceMono = Space_Mono({
  weight: ["400", "700"],
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "CINEMAGIC — Metro Manila Showtimes",
  description: "Find movie showtimes across Metro Manila cinemas",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${bebasNeue.variable} ${spaceMono.variable}`}>
      <body className="min-h-screen flex flex-col">
        {children}
      </body>
    </html>
  );
}
```

- [ ] **Step 11: Create placeholder homepage**

```typescript
// src/app/page.tsx
export default function HomePage() {
  return (
    <main className="flex-1 p-6">
      <h1 className="font-display text-4xl tracking-wider">CINEMAGIC</h1>
      <p className="text-muted text-sm mt-2">Metro Manila Showtimes</p>
    </main>
  );
}
```

- [ ] **Step 12: Install dependencies and verify dev server starts**

Run: `cd apps/cinemagic && npm install && npm run dev`
Expected: Dev server starts on http://localhost:3000, homepage renders with CINEMAGIC heading

- [ ] **Step 13: Initialize shadcn**

Run: `cd apps/cinemagic && npx shadcn@latest init`
Select: base-nova style, neutral base color, CSS variables enabled, aliases match tsconfig paths

- [ ] **Step 14: Commit**

```bash
git add apps/cinemagic/
git commit -m "feat(cinemagic): scaffold Next.js project with monochrome theme"
```

---

## Task 2: Supabase Setup + Database Migrations

**Files:**
- Create: `apps/cinemagic/supabase/config.toml`
- Create: `apps/cinemagic/supabase/migrations/00001_create_cinemas.sql`
- Create: `apps/cinemagic/supabase/migrations/00002_create_movies.sql`
- Create: `apps/cinemagic/supabase/migrations/00003_create_showtimes.sql`
- Create: `apps/cinemagic/supabase/migrations/00004_create_user_profiles.sql`
- Create: `apps/cinemagic/supabase/migrations/00005_create_preferred_cinemas.sql`
- Create: `apps/cinemagic/supabase/migrations/00006_create_watchlist.sql`
- Create: `apps/cinemagic/supabase/migrations/00007_create_suggestion_cache.sql`
- Create: `apps/cinemagic/supabase/migrations/00008_create_indexes.sql`
- Create: `apps/cinemagic/supabase/migrations/00009_create_rls_policies.sql`
- Create: `apps/cinemagic/supabase/migrations/00010_create_recommendation_function.sql`
- Create: `apps/cinemagic/supabase/migrations/00011_seed_cinemas.sql`
- Create: `apps/cinemagic/src/lib/supabase/client.ts`
- Create: `apps/cinemagic/src/lib/supabase/server.ts`
- Create: `apps/cinemagic/src/lib/supabase/middleware.ts`
- Create: `apps/cinemagic/src/middleware.ts`

- [ ] **Step 1: Create supabase/config.toml**

Minimal config for local development. Set project name to `cinemagic`.

- [ ] **Step 2: Create migration 00001_create_cinemas.sql**

```sql
CREATE TABLE cinemas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  chain TEXT NOT NULL CHECK (chain IN ('SM', 'Ayala', 'Robinsons', 'Vista', 'Gateway', 'Indie')),
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  area TEXT NOT NULL,
  lat DOUBLE PRECISION NOT NULL,
  lng DOUBLE PRECISION NOT NULL,
  screen_count INTEGER,
  amenities TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

- [ ] **Step 3: Create migration 00002_create_movies.sql**

```sql
CREATE TABLE movies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tmdb_id INTEGER UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  title_local TEXT,
  synopsis TEXT,
  genres TEXT[] DEFAULT '{}',
  cast JSONB DEFAULT '[]',
  director TEXT,
  poster_url TEXT,
  backdrop_url TEXT,
  trailer_url TEXT,
  rating_mtrcb TEXT CHECK (rating_mtrcb IN ('G', 'PG', 'R-13', 'R-16', 'R-18')),
  rating_tmdb DOUBLE PRECISION,
  runtime_minutes INTEGER,
  release_date_ph DATE,
  status TEXT NOT NULL DEFAULT 'now_showing' CHECK (status IN ('now_showing', 'coming_soon', 'ended')),
  tmdb_match_confidence DOUBLE PRECISION,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

- [ ] **Step 4: Create migration 00003_create_showtimes.sql**

```sql
CREATE TABLE showtimes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cinema_id UUID NOT NULL REFERENCES cinemas(id) ON DELETE CASCADE,
  movie_id UUID NOT NULL REFERENCES movies(id) ON DELETE CASCADE,
  screen_name TEXT,
  start_time TIMESTAMPTZ NOT NULL,
  price_min INTEGER,
  price_max INTEGER,
  format TEXT NOT NULL DEFAULT '2D' CHECK (format IN ('2D', '3D', 'IMAX', '4DX', 'Dolby')),
  scraped_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  source_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (cinema_id, movie_id, start_time, format)
);
```

- [ ] **Step 5: Create migration 00004_create_user_profiles.sql**

```sql
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  display_name TEXT,
  tier TEXT NOT NULL DEFAULT 'free' CHECK (tier IN ('free', 'premium')),
  location_lat DOUBLE PRECISION,
  location_lng DOUBLE PRECISION,
  preferred_genres TEXT[] DEFAULT '{}',
  availability_slots JSONB DEFAULT '[]',
  calendar_connected BOOLEAN NOT NULL DEFAULT false,
  calendar_provider TEXT CHECK (calendar_provider IN ('google', 'apple')),
  stripe_customer_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO user_profiles (id, email, display_name)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1)));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
```

- [ ] **Step 6: Create migration 00005_create_preferred_cinemas.sql**

```sql
CREATE TABLE preferred_cinemas (
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  cinema_id UUID NOT NULL REFERENCES cinemas(id) ON DELETE CASCADE,
  PRIMARY KEY (user_id, cinema_id)
);
```

- [ ] **Step 7: Create migration 00006_create_watchlist.sql**

```sql
CREATE TABLE watchlist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  movie_id UUID NOT NULL REFERENCES movies(id) ON DELETE CASCADE,
  priority TEXT NOT NULL DEFAULT 'interested' CHECK (priority IN ('want_to_see', 'maybe', 'interested')),
  added_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, movie_id)
);
```

- [ ] **Step 8: Create migration 00007_create_suggestion_cache.sql**

```sql
CREATE TABLE suggestion_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  showtime_id UUID NOT NULL REFERENCES showtimes(id) ON DELETE CASCADE,
  score DOUBLE PRECISION NOT NULL,
  reason TEXT NOT NULL,
  computed_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

- [ ] **Step 9: Create migration 00008_create_indexes.sql**

```sql
CREATE INDEX idx_showtimes_movie_time ON showtimes (movie_id, start_time);
CREATE INDEX idx_showtimes_cinema_time ON showtimes (cinema_id, start_time);
CREATE INDEX idx_showtimes_upcoming ON showtimes (start_time) WHERE start_time > now();
CREATE INDEX idx_movies_status ON movies (status);
CREATE INDEX idx_suggestion_cache_user ON suggestion_cache (user_id, computed_at DESC);
CREATE INDEX idx_cinemas_location ON cinemas USING gist (
  point(lng, lat)
);
```

- [ ] **Step 10: Create migration 00009_create_rls_policies.sql**

```sql
-- Cinemas: public read
ALTER TABLE cinemas ENABLE ROW LEVEL SECURITY;
CREATE POLICY "cinemas_public_read" ON cinemas FOR SELECT USING (true);

-- Movies: public read
ALTER TABLE movies ENABLE ROW LEVEL SECURITY;
CREATE POLICY "movies_public_read" ON movies FOR SELECT USING (true);

-- Showtimes: public read
ALTER TABLE showtimes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "showtimes_public_read" ON showtimes FOR SELECT USING (true);

-- User profiles: users read/update own
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "profiles_own_read" ON user_profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "profiles_own_update" ON user_profiles FOR UPDATE USING (auth.uid() = id);

-- Preferred cinemas: users manage own
ALTER TABLE preferred_cinemas ENABLE ROW LEVEL SECURITY;
CREATE POLICY "preferred_own_read" ON preferred_cinemas FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "preferred_own_insert" ON preferred_cinemas FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "preferred_own_delete" ON preferred_cinemas FOR DELETE USING (auth.uid() = user_id);

-- Watchlist: users manage own
ALTER TABLE watchlist ENABLE ROW LEVEL SECURITY;
CREATE POLICY "watchlist_own_read" ON watchlist FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "watchlist_own_insert" ON watchlist FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "watchlist_own_update" ON watchlist FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "watchlist_own_delete" ON watchlist FOR DELETE USING (auth.uid() = user_id);

-- Suggestion cache: users read own
ALTER TABLE suggestion_cache ENABLE ROW LEVEL SECURITY;
CREATE POLICY "suggestions_own_read" ON suggestion_cache FOR SELECT USING (auth.uid() = user_id);
```

- [ ] **Step 11: Create migration 00010_create_recommendation_function.sql**

```sql
CREATE OR REPLACE FUNCTION compute_suggestions(p_user_id UUID)
RETURNS TABLE (
  showtime_id UUID,
  score DOUBLE PRECISION,
  reason TEXT
) AS $$
DECLARE
  v_lat DOUBLE PRECISION;
  v_lng DOUBLE PRECISION;
  v_genres TEXT[];
  v_tier TEXT;
  v_slots JSONB;
BEGIN
  -- Get user profile
  SELECT location_lat, location_lng, preferred_genres, tier, availability_slots
  INTO v_lat, v_lng, v_genres, v_tier, v_slots
  FROM user_profiles WHERE id = p_user_id;

  -- Purge old suggestions
  DELETE FROM suggestion_cache WHERE user_id = p_user_id;

  RETURN QUERY
  WITH scored AS (
    SELECT
      s.id AS sid,
      -- Genre match (0.30)
      COALESCE(
        (SELECT COUNT(*)::DOUBLE PRECISION / GREATEST(array_length(v_genres, 1), 1)
         FROM unnest(v_genres) g WHERE g = ANY(m.genres)),
        0
      ) * 0.30 AS genre_score,
      -- Availability match (0.25) — checks showtime against user's manual slots
      CASE
        WHEN v_slots IS NULL OR jsonb_array_length(v_slots) = 0 THEN 0.5 -- no slots = neutral
        WHEN EXISTS (
          SELECT 1 FROM jsonb_array_elements(v_slots) slot
          WHERE (slot->>'day_of_week')::int = EXTRACT(DOW FROM s.start_time AT TIME ZONE 'Asia/Manila')::int
            AND (slot->>'start_time')::time <= (s.start_time AT TIME ZONE 'Asia/Manila')::time
            AND (slot->>'end_time')::time >= (s.start_time AT TIME ZONE 'Asia/Manila')::time
        ) THEN 1.0  -- showtime falls within a free slot
        WHEN EXISTS (
          SELECT 1 FROM jsonb_array_elements(v_slots) slot
          WHERE (slot->>'day_of_week')::int = EXTRACT(DOW FROM s.start_time AT TIME ZONE 'Asia/Manila')::int
            AND ABS(EXTRACT(EPOCH FROM (
              (slot->>'start_time')::time - (s.start_time AT TIME ZONE 'Asia/Manila')::time
            ))) <= 3600
        ) THEN 0.5  -- within 1 hour of a slot
        ELSE 0.0    -- outside all slots
      END * 0.25 AS availability_score,
      -- Proximity (0.20)
      CASE
        WHEN v_lat IS NULL OR v_lng IS NULL THEN 0.5
        WHEN point(c.lng, c.lat) <@> point(v_lng, v_lat) * 1.60934 < 3 THEN 1.0
        WHEN point(c.lng, c.lat) <@> point(v_lng, v_lat) * 1.60934 < 10 THEN 0.7
        WHEN point(c.lng, c.lat) <@> point(v_lng, v_lat) * 1.60934 < 20 THEN 0.3
        ELSE 0.1
      END * 0.20 AS proximity_score,
      -- Watchlist boost (0.15)
      CASE
        WHEN w.priority = 'want_to_see' THEN 1.0
        WHEN w.priority = 'maybe' THEN 0.5
        ELSE 0.0
      END * 0.15 AS watchlist_score,
      -- Rating (0.10)
      COALESCE(m.rating_tmdb / 10.0, 0.5) * 0.10 AS rating_score,
      -- Build reason
      m.title AS movie_title,
      c.name AS cinema_name,
      s.start_time,
      s.format
    FROM showtimes s
    JOIN movies m ON m.id = s.movie_id
    JOIN cinemas c ON c.id = s.cinema_id
    LEFT JOIN watchlist w ON w.movie_id = m.id AND w.user_id = p_user_id
    WHERE s.start_time > now()
      AND m.status = 'now_showing'
  )
  SELECT
    scored.sid,
    (scored.genre_score + scored.availability_score + scored.proximity_score + scored.watchlist_score + scored.rating_score) AS total_score,
    concat_ws(' · ',
      CASE WHEN scored.genre_score > 0.15 THEN 'matches your genres' END,
      CASE WHEN scored.availability_score > 0.15 THEN 'fits your schedule' END,
      CASE WHEN scored.proximity_score > 0.10 THEN 'near you' END,
      CASE WHEN scored.watchlist_score > 0 THEN 'on your watchlist' END,
      scored.cinema_name,
      to_char(scored.start_time AT TIME ZONE 'Asia/Manila', 'Dy HH12:MI AM')
    ) AS reason
  FROM scored
  ORDER BY (scored.genre_score + scored.availability_score + scored.proximity_score + scored.watchlist_score + scored.rating_score) DESC
  LIMIT 20;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

- [ ] **Step 12: Create migration 00011_seed_cinemas.sql**

Seed with Metro Manila cinemas. Include at minimum:
- SM Megamall, SM North EDSA, SM Mall of Asia, SM Aura
- Greenbelt 3, Glorietta 4, Trinoma, UP Town Center
- Robinsons Galleria, Robinsons Magnolia
- Gateway Cineplex
- Power Plant Cinema

Each with real lat/lng coordinates, address, area, chain, amenities.

- [ ] **Step 13: Create Supabase client files**

Create `src/lib/supabase/client.ts`, `server.ts`, `middleware.ts` following the exact sec-compliance patterns documented above.

- [ ] **Step 14: Create src/middleware.ts**

```typescript
import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  const { supabaseResponse, user } = await updateSession(request);

  const protectedPaths = ["/dashboard", "/watchlist", "/profile", "/suggestions"];
  const adminPaths = ["/admin"];
  const isProtected = protectedPaths.some((p) => request.nextUrl.pathname.startsWith(p));
  const isAdmin = adminPaths.some((p) => request.nextUrl.pathname.startsWith(p));

  if ((isProtected || isAdmin) && !user) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/login";
    return NextResponse.redirect(loginUrl);
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
```

- [ ] **Step 15: Start local Supabase and run migrations**

Run: `cd apps/cinemagic && npx supabase start && npx supabase db reset`
Expected: All migrations apply, cinema seed data inserted, tables visible in Supabase Studio

- [ ] **Step 16: Generate TypeScript types from Supabase**

Run: `cd apps/cinemagic && npx supabase gen types typescript --local > src/lib/supabase/types.ts`

- [ ] **Step 17: Commit**

```bash
git add apps/cinemagic/supabase/ apps/cinemagic/src/lib/supabase/ apps/cinemagic/src/middleware.ts
git commit -m "feat(cinemagic): database schema, RLS policies, recommendation function, cinema seeds"
```

---

## Task 3: TMDB Client + Fuzzy Matching

**Files:**
- Create: `apps/cinemagic/src/lib/tmdb/types.ts`
- Create: `apps/cinemagic/src/lib/tmdb/client.ts`
- Create: `apps/cinemagic/src/lib/tmdb/match.ts`
- Create: `apps/cinemagic/__tests__/unit/tmdb-match.test.ts`

- [ ] **Step 1: Write the failing test for TMDB fuzzy matching**

```typescript
// __tests__/unit/tmdb-match.test.ts
import { describe, it, expect } from "vitest";
import { calculateTitleSimilarity, findBestMatch } from "@/lib/tmdb/match";

describe("calculateTitleSimilarity", () => {
  it("returns 1.0 for exact match", () => {
    expect(calculateTitleSimilarity("Dune: Part Two", "Dune: Part Two")).toBe(1.0);
  });

  it("returns high score for case-insensitive match", () => {
    expect(calculateTitleSimilarity("DUNE: PART TWO", "Dune: Part Two")).toBeGreaterThan(0.9);
  });

  it("returns moderate score for partial match", () => {
    const score = calculateTitleSimilarity("Dune Part 2", "Dune: Part Two");
    expect(score).toBeGreaterThan(0.5);
    expect(score).toBeLessThan(1.0);
  });

  it("returns low score for unrelated titles", () => {
    expect(calculateTitleSimilarity("Dune", "The Notebook")).toBeLessThan(0.3);
  });
});

describe("findBestMatch", () => {
  it("picks the highest-confidence match from TMDB results", () => {
    const candidates = [
      { id: 1, title: "Dune: Part Two", release_date: "2024-03-01" },
      { id: 2, title: "Dune", release_date: "2021-10-22" },
      { id: 3, title: "Dune (1984)", release_date: "1984-12-14" },
    ];
    const result = findBestMatch("Dune: Part Two", candidates);
    expect(result?.tmdbId).toBe(1);
    expect(result?.confidence).toBeGreaterThan(0.85);
  });

  it("returns null when no match exceeds threshold", () => {
    const candidates = [
      { id: 1, title: "Totally Different Movie", release_date: "2024-01-01" },
    ];
    const result = findBestMatch("Dune: Part Two", candidates);
    expect(result).toBeNull();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd apps/cinemagic && npx vitest run __tests__/unit/tmdb-match.test.ts`
Expected: FAIL — modules not found

- [ ] **Step 3: Create TMDB types**

```typescript
// src/lib/tmdb/types.ts
export interface TmdbSearchResult {
  id: number;
  title: string;
  original_title: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date: string;
  genre_ids: number[];
  vote_average: number;
  vote_count: number;
}

export interface TmdbMovieDetail {
  id: number;
  title: string;
  original_title: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date: string;
  runtime: number;
  genres: { id: number; name: string }[];
  vote_average: number;
  credits?: {
    cast: { name: string; character: string; profile_path: string | null }[];
    crew: { name: string; job: string }[];
  };
  videos?: {
    results: { key: string; site: string; type: string }[];
  };
}

export interface TmdbMatchResult {
  tmdbId: number;
  confidence: number;
  title: string;
}

export const TMDB_IMAGE_BASE = "https://image.tmdb.org/t/p";
export const TMDB_POSTER_SIZE = "w500";
export const TMDB_BACKDROP_SIZE = "w1280";

// TMDB genre ID → name mapping
export const TMDB_GENRES: Record<number, string> = {
  28: "Action", 12: "Adventure", 16: "Animation", 35: "Comedy",
  80: "Crime", 99: "Documentary", 18: "Drama", 10751: "Family",
  14: "Fantasy", 36: "History", 27: "Horror", 10402: "Music",
  9648: "Mystery", 10749: "Romance", 878: "Sci-Fi", 10770: "TV Movie",
  53: "Thriller", 10752: "War", 37: "Western",
};
```

- [ ] **Step 4: Implement fuzzy matching**

```typescript
// src/lib/tmdb/match.ts
import type { TmdbMatchResult } from "./types";

export function calculateTitleSimilarity(a: string, b: string): number {
  const normalize = (s: string) =>
    s.toLowerCase().replace(/[^a-z0-9\s]/g, "").replace(/\s+/g, " ").trim();

  const na = normalize(a);
  const nb = normalize(b);

  if (na === nb) return 1.0;

  // Levenshtein distance
  const m = na.length;
  const n = nb.length;
  const dp: number[][] = Array.from({ length: m + 1 }, (_, i) =>
    Array.from({ length: n + 1 }, (_, j) => (i === 0 ? j : j === 0 ? i : 0))
  );

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i][j] =
        na[i - 1] === nb[j - 1]
          ? dp[i - 1][j - 1]
          : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
    }
  }

  return 1 - dp[m][n] / Math.max(m, n);
}

export function findBestMatch(
  scrapedTitle: string,
  candidates: { id: number; title: string; release_date: string }[],
  threshold = 0.6
): TmdbMatchResult | null {
  let best: TmdbMatchResult | null = null;

  for (const c of candidates) {
    const confidence = calculateTitleSimilarity(scrapedTitle, c.title);
    if (confidence > (best?.confidence ?? threshold)) {
      best = { tmdbId: c.id, confidence, title: c.title };
    }
  }

  return best;
}
```

- [ ] **Step 5: Run test to verify it passes**

Run: `cd apps/cinemagic && npx vitest run __tests__/unit/tmdb-match.test.ts`
Expected: All tests PASS

- [ ] **Step 6: Create TMDB API client**

```typescript
// src/lib/tmdb/client.ts
import type { TmdbSearchResult, TmdbMovieDetail } from "./types";
import { TMDB_IMAGE_BASE, TMDB_POSTER_SIZE, TMDB_BACKDROP_SIZE, TMDB_GENRES } from "./types";

const BASE_URL = "https://api.themoviedb.org/3";

function headers() {
  return {
    Authorization: `Bearer ${process.env.TMDB_API_KEY}`,
    "Content-Type": "application/json",
  };
}

export async function searchMovies(query: string, year?: number): Promise<TmdbSearchResult[]> {
  const params = new URLSearchParams({ query, language: "en-US", page: "1" });
  if (year) params.set("year", String(year));

  const res = await fetch(`${BASE_URL}/search/movie?${params}`, { headers: headers() });
  if (!res.ok) throw new Error(`TMDB search failed: ${res.status}`);

  const data = await res.json();
  return data.results;
}

export async function getMovieDetail(tmdbId: number): Promise<TmdbMovieDetail> {
  const res = await fetch(
    `${BASE_URL}/movie/${tmdbId}?append_to_response=credits,videos&language=en-US`,
    { headers: headers() }
  );
  if (!res.ok) throw new Error(`TMDB detail failed: ${res.status}`);
  return res.json();
}

export function posterUrl(path: string | null): string | null {
  return path ? `${TMDB_IMAGE_BASE}/${TMDB_POSTER_SIZE}${path}` : null;
}

export function backdropUrl(path: string | null): string | null {
  return path ? `${TMDB_IMAGE_BASE}/${TMDB_BACKDROP_SIZE}${path}` : null;
}

export function genreNames(genreIds: number[]): string[] {
  return genreIds.map((id) => TMDB_GENRES[id]).filter(Boolean);
}

export function trailerUrl(detail: TmdbMovieDetail): string | null {
  const yt = detail.videos?.results.find(
    (v) => v.site === "YouTube" && v.type === "Trailer"
  );
  return yt ? `https://www.youtube.com/watch?v=${yt.key}` : null;
}

export function director(detail: TmdbMovieDetail): string | null {
  return detail.credits?.crew.find((c) => c.job === "Director")?.name ?? null;
}
```

- [ ] **Step 7: Commit**

```bash
git add apps/cinemagic/src/lib/tmdb/ apps/cinemagic/__tests__/unit/tmdb-match.test.ts
git commit -m "feat(cinemagic): TMDB client with fuzzy title matching"
```

---

## Task 4: Scraper Infrastructure

**Files:**
- Create: `apps/cinemagic/src/lib/scrapers/types.ts`
- Create: `apps/cinemagic/src/lib/scrapers/base.ts`
- Create: `apps/cinemagic/src/lib/scrapers/ingest.ts`
- Create: `apps/cinemagic/src/lib/scrapers/registry.ts`
- Create: `apps/cinemagic/__tests__/unit/ingest.test.ts`

- [ ] **Step 1: Write failing test for ingest logic**

```typescript
// __tests__/unit/ingest.test.ts
import { describe, it, expect } from "vitest";
import { normalizeRawShowtime, deduplicateShowtimes } from "@/lib/scrapers/ingest";

describe("normalizeRawShowtime", () => {
  it("trims whitespace from movie title", () => {
    const raw = {
      cinemaName: "SM Megamall",
      movieTitle: "  Dune: Part Three  ",
      screenName: "Cinema 5",
      startTime: new Date("2026-03-22T14:30:00+08:00"),
      format: "2D",
      sourceUrl: "https://smcinema.com",
    };
    const result = normalizeRawShowtime(raw);
    expect(result.movieTitle).toBe("Dune: Part Three");
  });

  it("normalizes format to uppercase", () => {
    const raw = {
      cinemaName: "SM Megamall",
      movieTitle: "Dune",
      screenName: "Cinema 5",
      startTime: new Date("2026-03-22T14:30:00+08:00"),
      format: "imax",
      sourceUrl: "https://smcinema.com",
    };
    const result = normalizeRawShowtime(raw);
    expect(result.format).toBe("IMAX");
  });
});

describe("deduplicateShowtimes", () => {
  it("removes duplicates by cinema+movie+time+format", () => {
    const showtimes = [
      { cinemaName: "SM Megamall", movieTitle: "Dune", screenName: "C5", startTime: new Date("2026-03-22T14:30:00+08:00"), format: "2D", sourceUrl: "url" },
      { cinemaName: "SM Megamall", movieTitle: "Dune", screenName: "C5", startTime: new Date("2026-03-22T14:30:00+08:00"), format: "2D", sourceUrl: "url" },
      { cinemaName: "SM Megamall", movieTitle: "Dune", screenName: "C5", startTime: new Date("2026-03-22T14:30:00+08:00"), format: "IMAX", sourceUrl: "url" },
    ];
    const result = deduplicateShowtimes(showtimes);
    expect(result).toHaveLength(2);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd apps/cinemagic && npx vitest run __tests__/unit/ingest.test.ts`
Expected: FAIL

- [ ] **Step 3: Create scraper types**

```typescript
// src/lib/scrapers/types.ts
export interface RawShowtime {
  cinemaName: string;
  movieTitle: string;
  screenName: string;
  startTime: Date;
  priceMin?: number;
  priceMax?: number;
  format: string;
  sourceUrl: string;
}

export interface ChainScraper {
  chain: string;
  scrape(): Promise<RawShowtime[]>;
  healthCheck(): Promise<boolean>;
}

export interface ScrapeResult {
  chain: string;
  showtimes: RawShowtime[];
  scrapedAt: Date;
  errors: string[];
}
```

- [ ] **Step 4: Implement ingest logic**

```typescript
// src/lib/scrapers/ingest.ts
import type { RawShowtime } from "./types";

const VALID_FORMATS = ["2D", "3D", "IMAX", "4DX", "DOLBY"];

export function normalizeRawShowtime(raw: RawShowtime): RawShowtime {
  const format = raw.format.toUpperCase().trim();
  return {
    ...raw,
    movieTitle: raw.movieTitle.trim(),
    cinemaName: raw.cinemaName.trim(),
    screenName: raw.screenName.trim(),
    format: VALID_FORMATS.includes(format) ? format : "2D",
  };
}

export function deduplicateShowtimes(showtimes: RawShowtime[]): RawShowtime[] {
  const seen = new Set<string>();
  return showtimes.filter((s) => {
    const key = `${s.cinemaName}|${s.movieTitle}|${s.startTime.toISOString()}|${s.format}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}
```

- [ ] **Step 5: Run test to verify it passes**

Run: `cd apps/cinemagic && npx vitest run __tests__/unit/ingest.test.ts`
Expected: All tests PASS

- [ ] **Step 6: Create base scraper class**

```typescript
// src/lib/scrapers/base.ts
import type { ChainScraper, RawShowtime } from "./types";

export abstract class BaseScraper implements ChainScraper {
  abstract chain: string;
  abstract scrape(): Promise<RawShowtime[]>;

  async healthCheck(): Promise<boolean> {
    try {
      const results = await this.scrape();
      return results.length > 0;
    } catch {
      return false;
    }
  }

  protected delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  protected randomDelay(minMs = 1000, maxMs = 3000): Promise<void> {
    return this.delay(minMs + Math.random() * (maxMs - minMs));
  }
}
```

- [ ] **Step 7: Create scraper registry**

```typescript
// src/lib/scrapers/registry.ts
import type { ChainScraper } from "./types";

const scrapers = new Map<string, ChainScraper>();

export function registerScraper(scraper: ChainScraper): void {
  scrapers.set(scraper.chain, scraper);
}

export function getScraper(chain: string): ChainScraper | undefined {
  return scrapers.get(chain);
}

export function getAllChains(): string[] {
  return Array.from(scrapers.keys());
}
```

- [ ] **Step 8: Commit**

```bash
git add apps/cinemagic/src/lib/scrapers/ apps/cinemagic/__tests__/unit/ingest.test.ts
git commit -m "feat(cinemagic): scraper infrastructure — types, ingest, base class, registry"
```

---

## Task 5: SM Cinema Scraper (First Chain)

**Files:**
- Create: `apps/cinemagic/src/lib/scrapers/sm-cinema.ts`
- Create: `apps/cinemagic/src/app/api/scrape/[chain]/route.ts`
- Create: `apps/cinemagic/src/app/api/enrich/route.ts`

- [ ] **Step 1: Implement SM Cinema scraper**

Research the actual SM Cinema website (`smcinema.com`) structure. Implement scraper using `fetch` (prefer over Playwright if the site has a JSON API — many cinema sites do). Falls back to Playwright if JS rendering is needed. Parse movie titles, showtimes, screen names, formats, and prices.

- [ ] **Step 2: Create scrape API route**

```typescript
// src/app/api/scrape/[chain]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getScraper } from "@/lib/scrapers/registry";
import { normalizeRawShowtime, deduplicateShowtimes } from "@/lib/scrapers/ingest";
import { searchMovies, getMovieDetail, posterUrl, backdropUrl, genreNames, trailerUrl, director } from "@/lib/tmdb/client";
import { findBestMatch } from "@/lib/tmdb/match";
import { slugify } from "@/lib/utils";

// Import and register scrapers
import "@/lib/scrapers/sm-cinema";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ chain: string }> }
) {
  // Verify cron secret — Vercel sends it in x-vercel-cron-secret header
  const cronSecret = request.headers.get("x-vercel-cron-secret")
    ?? request.headers.get("authorization")?.replace("Bearer ", "");
  if (cronSecret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { chain } = await params;
  const scraper = getScraper(chain);
  if (!scraper) {
    return NextResponse.json({ error: `Unknown chain: ${chain}` }, { status: 404 });
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  try {
    const raw = await scraper.scrape();
    const normalized = raw.map(normalizeRawShowtime);
    const unique = deduplicateShowtimes(normalized);

    let inserted = 0;
    let enriched = 0;

    for (const showtime of unique) {
      // Find or create cinema
      const { data: cinema } = await supabase
        .from("cinemas")
        .select("id")
        .eq("name", showtime.cinemaName)
        .eq("chain", chain)
        .single();

      if (!cinema) continue;

      // Find or create movie
      let { data: movie } = await supabase
        .from("movies")
        .select("id")
        .eq("title", showtime.movieTitle)
        .single();

      if (!movie) {
        // Search TMDB for the movie
        const tmdbResults = await searchMovies(showtime.movieTitle);
        const match = findBestMatch(showtime.movieTitle, tmdbResults);

        let movieData: Record<string, unknown> = {
          title: showtime.movieTitle,
          slug: slugify(showtime.movieTitle),
          status: "now_showing",
        };

        if (match && match.confidence > 0.85) {
          const detail = await getMovieDetail(match.tmdbId);
          movieData = {
            ...movieData,
            tmdb_id: match.tmdbId,
            tmdb_match_confidence: match.confidence,
            synopsis: detail.overview,
            genres: detail.genres.map((g) => g.name),
            cast: detail.credits?.cast.slice(0, 10).map((c) => ({
              name: c.name,
              character: c.character,
              profile_path: c.profile_path,
            })),
            director: director(detail),
            poster_url: posterUrl(detail.poster_path),
            backdrop_url: backdropUrl(detail.backdrop_path),
            trailer_url: trailerUrl(detail),
            rating_tmdb: detail.vote_average,
            runtime_minutes: detail.runtime,
            release_date_ph: detail.release_date,
          };
          enriched++;
        } else if (match) {
          movieData.tmdb_match_confidence = match.confidence;
        }

        const { data: newMovie } = await supabase
          .from("movies")
          .upsert(movieData, { onConflict: "slug" })
          .select("id")
          .single();

        movie = newMovie;
      }

      if (!movie) continue;

      // Upsert showtime
      await supabase.from("showtimes").upsert(
        {
          cinema_id: cinema.id,
          movie_id: movie.id,
          screen_name: showtime.screenName,
          start_time: showtime.startTime.toISOString(),
          price_min: showtime.priceMin,
          price_max: showtime.priceMax,
          format: showtime.format,
          scraped_at: new Date().toISOString(),
          source_url: showtime.sourceUrl,
        },
        { onConflict: "cinema_id,movie_id,start_time,format" }
      );

      inserted++;
    }

    return NextResponse.json({
      chain,
      scraped: unique.length,
      inserted,
      enriched,
    });
  } catch (error) {
    return NextResponse.json(
      { chain, error: String(error) },
      { status: 500 }
    );
  }
}
```

- [ ] **Step 3: Test scraper manually against live site**

Run: `cd apps/cinemagic && curl -X POST http://localhost:3000/api/scrape/SM -H "Authorization: Bearer $CRON_SECRET"`
Expected: JSON response with scraped count > 0

- [ ] **Step 4: Commit**

```bash
git add apps/cinemagic/src/lib/scrapers/sm-cinema.ts apps/cinemagic/src/app/api/
git commit -m "feat(cinemagic): SM Cinema scraper + scrape/enrich API routes"
```

---

## Task 6: Layout Components (Monochrome Minimal UI)

**Files:**
- Create: `apps/cinemagic/src/components/layout/header.tsx`
- Create: `apps/cinemagic/src/components/layout/footer.tsx`
- Create: `apps/cinemagic/src/components/layout/mobile-nav.tsx`
- Create: `apps/cinemagic/src/components/date-strip.tsx`
- Create: `apps/cinemagic/src/components/search-bar.tsx`
- Modify: `apps/cinemagic/src/app/layout.tsx`

- [ ] **Step 1: Create header component**

Monochrome minimal: CINEMAGIC in Bebas Neue, uppercase, letter-spacing 6px. Right side: Now / Soon / Cinemas / text links in Space Mono 11px, color #444, no icons. Mobile: hide desktop nav, show hamburger (just ☰ character). Sharp edges, border-bottom: 1px solid #222.

- [ ] **Step 2: Create mobile bottom nav**

Text-only bottom nav bar: NOW / SOON / CINEMAS / PROFILE. Fixed bottom. Background #000, border-top: 1px solid #222. Active tab is white, inactive is #444. No icons. Font: Space Mono 10px uppercase, letter-spacing 2px.

- [ ] **Step 3: Create footer**

Minimal footer. "CINEMAGIC" left, "Metro Manila Showtimes" right. Font: Space Mono 10px, color #333. border-top: 1px solid #111. Padding 16px.

- [ ] **Step 4: Create date strip component**

Horizontal scrolling date picker. Shows 7 days starting from today. Each cell: day abbreviation (SAT) in #444, date number (22) in white bold. Selected date: inverted (white background, black text). Border-top and border-bottom: 1px solid #222. Cells separated by vertical 1px #222 borders. Font: Space Mono.

```typescript
// src/components/date-strip.tsx
"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

interface DateStripProps {
  onDateSelect: (date: Date) => void;
  selectedDate?: Date;
}

export function DateStrip({ onDateSelect, selectedDate }: DateStripProps) {
  const today = new Date();
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today);
    d.setDate(d.getDate() + i);
    return d;
  });

  const dayNames = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

  const isSelected = (d: Date) =>
    selectedDate?.toDateString() === d.toDateString();

  return (
    <div className="flex border-y border-border overflow-x-auto">
      {days.map((d) => (
        <button
          key={d.toISOString()}
          onClick={() => onDateSelect(d)}
          className={cn(
            "flex flex-col items-center px-4 py-3 border-r border-border min-w-[64px]",
            isSelected(d)
              ? "bg-inverted-bg text-inverted-fg"
              : "bg-bg text-fg"
          )}
        >
          <span className={cn("text-[9px] tracking-[1px]", !isSelected(d) && "text-muted")}>
            {dayNames[d.getDay()]}
          </span>
          <span className="text-xl font-bold">{d.getDate()}</span>
        </button>
      ))}
    </div>
  );
}
```

- [ ] **Step 5: Create search bar**

Full-width search input. Background #000, border: 1px solid #222. Placeholder: "SEARCH MOVIES, CINEMAS..." in #444. Input text in white. Font: Space Mono 14px. No rounded corners (border-radius: 2px max). Magnifying glass? No — just the text input. Monochrome minimal.

- [ ] **Step 6: Update root layout to include header + mobile nav**

- [ ] **Step 7: Verify in browser**

Run: `cd apps/cinemagic && npm run dev`
Open http://localhost:3000. Verify: black background, CINEMAGIC header in Bebas Neue, date strip renders with today selected, bottom nav visible on mobile viewport.

- [ ] **Step 8: Commit**

```bash
git add apps/cinemagic/src/components/ apps/cinemagic/src/app/layout.tsx
git commit -m "feat(cinemagic): monochrome minimal layout — header, footer, date strip, mobile nav"
```

---

## Task 7: Movie Components + Homepage

**Files:**
- Create: `apps/cinemagic/src/components/movies/movie-row.tsx`
- Create: `apps/cinemagic/src/components/movies/movie-grid.tsx`
- Create: `apps/cinemagic/src/components/showtimes/showtime-pill.tsx`
- Modify: `apps/cinemagic/src/app/page.tsx`

- [ ] **Step 1: Create showtime pill component**

```typescript
// src/components/showtimes/showtime-pill.tsx
import { cn } from "@/lib/utils";

interface ShowtimePillProps {
  time: string;       // "14:30"
  format: string;     // "2D", "IMAX", etc.
  highlighted?: boolean;
}

const PREMIUM_FORMATS = ["IMAX", "4DX", "DOLBY"];

export function ShowtimePill({ time, format, highlighted }: ShowtimePillProps) {
  const isPremium = PREMIUM_FORMATS.includes(format);
  const label = isPremium ? `${time} ${format}` : time;

  return (
    <span
      className={cn(
        "inline-block text-[10px] font-semibold px-2.5 py-1 border",
        isPremium || highlighted
          ? "bg-inverted-bg text-inverted-fg border-inverted-bg"
          : "bg-bg text-fg border-muted-subtle"
      )}
    >
      {label}
    </span>
  );
}
```

- [ ] **Step 2: Create movie row component**

Movie row: poster thumbnail (50x70px, bg #111, border-radius 2px) | title in uppercase bold 15px white + metadata in #333 11px (GENRE · RUNTIME · RATING) | showtime pills in horizontal row | arrow → on right. Grid layout: `auto 1fr auto`. Padding 16px 0, border-bottom: 1px solid #111. Generous spacing.

- [ ] **Step 3: Create movie grid component**

Wrapper that fetches movies + showtimes for a given date from Supabase server component. Maps to MovieRow components. Heading: "NOW SHOWING" in Bebas Neue 14px, letter-spacing 3px, color #444.

- [ ] **Step 4: Wire up homepage**

Homepage = DateStrip at top + SearchBar below it + MovieGrid for selected date. Server component that fetches today's showtimes. Client-side date selection triggers refetch.

- [ ] **Step 5: Seed test data and verify in browser**

Insert 3-4 test movies and showtimes into local Supabase. Open http://localhost:3000. Verify: date strip, movie rows with showtime pills, monochrome aesthetic, IMAX pills inverted.

- [ ] **Step 6: Commit**

```bash
git add apps/cinemagic/src/components/movies/ apps/cinemagic/src/components/showtimes/ apps/cinemagic/src/app/page.tsx
git commit -m "feat(cinemagic): homepage with date strip, movie rows, showtime pills"
```

---

## Task 8: Movie Detail Page

**Files:**
- Create: `apps/cinemagic/src/app/(public)/movies/page.tsx`
- Create: `apps/cinemagic/src/app/(public)/movies/[slug]/page.tsx`
- Create: `apps/cinemagic/src/components/movies/movie-detail.tsx`

- [ ] **Step 1: Create movie list page (/movies)**

Server component. Fetches all movies with status filter (now_showing / coming_soon). Renders as movie rows without showtimes — just title, genre, rating. Filter bar at top: ALL / NOW SHOWING / COMING SOON as text buttons, inverted when active.

- [ ] **Step 2: Create movie detail page (/movies/[slug])**

Server component. Fetches movie by slug + all upcoming showtimes grouped by cinema. Layout: poster (if available, otherwise #111 placeholder), title in Bebas Neue 36px, metadata row (genre · runtime · MTRCB rating · TMDB rating), synopsis in Space Mono 13px, cast list. Below: showtimes table — cinema name (bold left column) + showtime pills (right column), separated by 1px #111 borders. Like the editorial table from the mockup.

- [ ] **Step 3: Generate static metadata for SEO**

```typescript
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  // Fetch movie, return title + description + poster as og:image
}
```

- [ ] **Step 4: Verify in browser**

Navigate to /movies and /movies/[test-slug]. Verify: monochrome aesthetic, showtime table, metadata.

- [ ] **Step 5: Commit**

```bash
git add apps/cinemagic/src/app/(public)/movies/
git commit -m "feat(cinemagic): movie list and detail pages with showtime tables"
```

---

## Task 9: Cinema Pages

**Files:**
- Create: `apps/cinemagic/src/app/(public)/cinemas/page.tsx`
- Create: `apps/cinemagic/src/app/(public)/cinemas/[slug]/page.tsx`
- Create: `apps/cinemagic/src/components/cinemas/cinema-card.tsx`
- Create: `apps/cinemagic/src/components/cinemas/cinema-schedule.tsx`

- [ ] **Step 1: Create cinema card component**

Cinema name in bold 14px, chain + area in #444 11px, amenity badges (IMAX, DOLBY, 4DX) as small bordered pills. Clickable → /cinemas/[slug].

- [ ] **Step 2: Create cinema list page (/cinemas)**

Server component. Fetches all cinemas. Filter bar: chain filter (ALL / SM / AYALA / ROBINSONS / ...) + area filter. List view by default. Each cinema as a CinemaCard. Map view is out of scope for v1.

- [ ] **Step 3: Create cinema schedule component**

Showtimes grouped by movie for a specific cinema + date. Movie title row → showtime pills below. Same visual pattern as movie detail but inverted grouping.

- [ ] **Step 4: Create cinema detail page (/cinemas/[slug])**

Server component. Cinema name in Bebas Neue, address, area, amenities list, screen count. Below: CinemaSchedule for today. Date strip to change day.

- [ ] **Step 5: Verify in browser with seeded data**

- [ ] **Step 6: Commit**

```bash
git add apps/cinemagic/src/app/(public)/cinemas/ apps/cinemagic/src/components/cinemas/
git commit -m "feat(cinemagic): cinema list and detail pages with schedules"
```

---

## Task 10: Showtimes Power Page

**Files:**
- Create: `apps/cinemagic/src/app/(public)/showtimes/page.tsx`
- Create: `apps/cinemagic/src/components/showtimes/showtime-filters.tsx`
- Create: `apps/cinemagic/src/components/showtimes/showtime-list.tsx`

- [ ] **Step 1: Create showtime filters component**

Client component with filters: Date (date strip), Time range (dropdown: Any / Morning / Afternoon / Evening / Late Night), Area (dropdown: Any / Makati / BGC / Ortigas / QC / ...), Cinema (dropdown), Movie (dropdown), Format (Any / 2D / 3D / IMAX / 4DX / Dolby). All filter dropdowns: black background, white text, 1px #222 border, Space Mono 11px. Filters in a horizontal row on desktop, stacked on mobile.

- [ ] **Step 2: Create showtime list component**

Displays filtered results. Each row: Time (bold) | Movie title | Cinema name | Format badge | Screen. Sorted by time. Simple table layout with 1px #111 row borders.

- [ ] **Step 3: Wire up showtimes page**

Server component with client-side filtering. Fetch all showtimes for selected date, filter client-side for responsiveness. URL search params for shareable filter state.

- [ ] **Step 4: Verify with seeded data**

- [ ] **Step 5: Commit**

```bash
git add apps/cinemagic/src/app/(public)/showtimes/ apps/cinemagic/src/components/showtimes/
git commit -m "feat(cinemagic): showtimes power page with multi-filter"
```

---

## Task 11: Auth Flow (Supabase Auth)

**Files:**
- Create: `apps/cinemagic/src/app/(auth)/login/page.tsx`
- Create: `apps/cinemagic/src/app/(auth)/signup/page.tsx`
- Create: `apps/cinemagic/src/app/api/auth/callback/route.ts`
- Create: `apps/cinemagic/src/app/(auth)/layout.tsx`

- [ ] **Step 1: Create login page**

Email + password form. Monochrome: black background, white text inputs with 1px #222 borders, "SIGN IN" button (inverted: white bg, black text). "Don't have an account? SIGN UP" link below. Bebas Neue heading "SIGN IN", Space Mono body.

- [ ] **Step 2: Create signup page**

Email + password + display name. Same aesthetic as login. After signup, redirect to /dashboard.

- [ ] **Step 3: Create auth callback route**

Handle Supabase OAuth callback (for future Google auth). Standard pattern from sec-compliance.

- [ ] **Step 4: Create auth layout**

Centered card layout. No header/footer chrome — just the form centered on black background.

- [ ] **Step 5: Test auth flow end-to-end**

Sign up → profile auto-created → redirect to dashboard → sign out → sign in → dashboard.

- [ ] **Step 6: Commit**

```bash
git add apps/cinemagic/src/app/(auth)/ apps/cinemagic/src/app/api/auth/
git commit -m "feat(cinemagic): auth flow — login, signup, callback"
```

---

## Task 12: User Profile + Preferences

**Files:**
- Create: `apps/cinemagic/src/app/(auth)/profile/page.tsx`
- Create: `apps/cinemagic/src/hooks/use-location.ts`

- [ ] **Step 1: Create geolocation hook**

```typescript
// src/hooks/use-location.ts
"use client";

import { useState, useCallback } from "react";

export function useLocation() {
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const requestLocation = useCallback(() => {
    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setLoading(false);
      },
      (err) => {
        setError(err.message);
        setLoading(false);
      }
    );
  }, []);

  return { location, error, loading, requestLocation };
}
```

- [ ] **Step 2: Create profile page**

Sections:
1. **Location** — "SET MY LOCATION" button that triggers geolocation. Shows lat/lng or area name after set. Saves to user_profiles.
2. **Preferred Genres** — Checkboxes for all genres. Free tier: max 3 (show count). Premium: unlimited.
3. **Preferred Cinemas** — Searchable cinema list. Free tier: max 2. Premium: unlimited.
4. **Availability Slots** — Add recurring slots: day of week dropdown + start time + end time. Table of existing slots with delete.

All inputs: monochrome, 1px borders, Space Mono, inverted buttons.

- [ ] **Step 3: Implement tier-based limits**

Fetch user's tier. Enforce max counts client-side with upgrade prompts when limit hit.

- [ ] **Step 4: Verify in browser**

- [ ] **Step 5: Commit**

```bash
git add apps/cinemagic/src/app/(auth)/profile/ apps/cinemagic/src/hooks/
git commit -m "feat(cinemagic): profile page with preferences, location, availability slots"
```

---

## Task 13: Watchlist

**Files:**
- Create: `apps/cinemagic/src/app/(auth)/watchlist/page.tsx`
- Create: `apps/cinemagic/src/components/dashboard/watchlist-preview.tsx`

- [ ] **Step 1: Create watchlist page**

Server component. Fetches user's watchlist with movie details. Each item: movie title (bold) + genres + rating + priority badge (WANT TO SEE / MAYBE / INTERESTED as text, not colored). "REMOVE" button on each row. "ADD MOVIE" search at top. Free tier: show count "3 OF 5" with upgrade prompt at limit.

- [ ] **Step 2: Add watchlist toggle to movie detail page**

On /movies/[slug], add a "ADD TO WATCHLIST" button (inverted). If already on watchlist, show "ON WATCHLIST ✓" (or just checkmark, minimal). Priority selector: dropdown.

- [ ] **Step 3: Create watchlist preview component**

Compact version for dashboard. Shows first 3 items + "VIEW ALL →" link.

- [ ] **Step 4: Verify in browser**

- [ ] **Step 5: Commit**

```bash
git add apps/cinemagic/src/app/(auth)/watchlist/ apps/cinemagic/src/components/dashboard/
git commit -m "feat(cinemagic): watchlist page, movie detail toggle, dashboard preview"
```

---

## Task 14: Dashboard + Recommendations

**Files:**
- Create: `apps/cinemagic/src/app/(auth)/dashboard/page.tsx`
- Create: `apps/cinemagic/src/components/dashboard/suggestion-card.tsx`
- Create: `apps/cinemagic/src/components/dashboard/upgrade-prompt.tsx`
- Create: `apps/cinemagic/src/lib/recommendations/score.ts`
- Create: `apps/cinemagic/src/lib/recommendations/types.ts`
- Create: `apps/cinemagic/src/app/api/suggest/route.ts`
- Create: `apps/cinemagic/__tests__/unit/score.test.ts`

- [ ] **Step 1: Write failing test for recommendation scoring**

```typescript
// __tests__/unit/score.test.ts
import { describe, it, expect } from "vitest";
import { computeAvailabilityScore } from "@/lib/recommendations/score";

describe("computeAvailabilityScore", () => {
  it("returns 1.0 when showtime is within a free slot", () => {
    const slots = [{ day_of_week: 6, start_time: "14:00", end_time: "22:00" }];
    const showtime = new Date("2026-03-28T16:00:00+08:00"); // Saturday 4pm
    expect(computeAvailabilityScore(showtime, slots)).toBe(1.0);
  });

  it("returns 0.5 when showtime is within 1 hour of a slot", () => {
    const slots = [{ day_of_week: 6, start_time: "15:00", end_time: "22:00" }];
    const showtime = new Date("2026-03-28T14:30:00+08:00"); // Saturday 2:30pm, slot starts 3pm
    expect(computeAvailabilityScore(showtime, slots)).toBe(0.5);
  });

  it("returns 0.0 when showtime is outside all slots", () => {
    const slots = [{ day_of_week: 6, start_time: "18:00", end_time: "22:00" }];
    const showtime = new Date("2026-03-28T10:00:00+08:00"); // Saturday 10am
    expect(computeAvailabilityScore(showtime, slots)).toBe(0.0);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

- [ ] **Step 3: Implement client-side availability scoring**

```typescript
// src/lib/recommendations/score.ts
interface AvailabilitySlot {
  day_of_week: number; // 0=Sunday, 6=Saturday
  start_time: string;  // "HH:MM"
  end_time: string;    // "HH:MM"
}

export function computeAvailabilityScore(
  showtime: Date,
  slots: AvailabilitySlot[]
): number {
  const day = showtime.getDay();
  const timeMinutes = showtime.getHours() * 60 + showtime.getMinutes();

  for (const slot of slots) {
    if (slot.day_of_week !== day) continue;

    const [sh, sm] = slot.start_time.split(":").map(Number);
    const [eh, em] = slot.end_time.split(":").map(Number);
    const slotStart = sh * 60 + sm;
    const slotEnd = eh * 60 + em;

    if (timeMinutes >= slotStart && timeMinutes <= slotEnd) return 1.0;

    const distToSlot = Math.min(
      Math.abs(timeMinutes - slotStart),
      Math.abs(timeMinutes - slotEnd)
    );
    if (distToSlot <= 60) return 0.5;
  }

  return 0.0;
}
```

- [ ] **Step 4: Run test to verify it passes**

- [ ] **Step 5: Create suggest API route**

Calls the `compute_suggestions` Postgres function, inserts results into suggestion_cache, returns suggestions.

- [ ] **Step 6: Create suggestion card component**

Movie title (bold) + showtime + cinema. Reason text in #444 below (only for premium). Same movie-row layout but with reason line appended.

- [ ] **Step 7: Create upgrade prompt component**

"UNLOCK SMARTER SUGGESTIONS" heading in Bebas Neue 18px. "Calendar-aware picks · Unlimited watchlist · No ads" in Space Mono 11px #444. "UPGRADE — ₱149/MO" inverted button. Thin top border separating from content.

- [ ] **Step 8: Create dashboard page**

Server component. Checks user tier.
- **Free tier:** "MOVIES NEAR YOU" section (top-rated nearby showtimes) + WatchlistPreview + UpgradePrompt
- **Premium tier:** "SUGGESTED FOR YOU" section (from suggestion_cache with reasons) + "MOVIES NEAR YOU" + WatchlistPreview

- [ ] **Step 9: Verify in browser**

- [ ] **Step 10: Commit**

```bash
git add apps/cinemagic/src/app/(auth)/dashboard/ apps/cinemagic/src/components/dashboard/ apps/cinemagic/src/lib/recommendations/ apps/cinemagic/src/app/api/suggest/ apps/cinemagic/__tests__/unit/score.test.ts
git commit -m "feat(cinemagic): dashboard with recommendations, suggestion cards, upgrade prompt"
```

---

## Task 15: Admin Panel

**Files:**
- Create: `apps/cinemagic/src/app/(admin)/layout.tsx`
- Create: `apps/cinemagic/src/app/(admin)/admin/scraper/page.tsx`
- Create: `apps/cinemagic/src/app/(admin)/admin/movies/review/page.tsx`
- Create: `apps/cinemagic/src/app/(admin)/admin/cinemas/page.tsx`

- [ ] **Step 1: Create admin layout**

Check if user is admin (hardcoded admin email list or admin flag in user_profiles — keep simple for v1). Redirect to / if not admin. Same monochrome aesthetic but with "ADMIN" label in header.

- [ ] **Step 2: Create scraper health page**

Table of chains: Chain name | Last scrape time | Showtimes count | Status (OK / STALE / ERROR). "RUN NOW" button per chain that POSTs to /api/scrape/[chain]. STALE = last scrape > 6 hours ago.

- [ ] **Step 3: Create movie review page**

List movies where tmdb_match_confidence < 0.85 OR tmdb_id IS NULL. Each row: scraped title | TMDB suggestion (if any) | confidence score | APPROVE / REJECT / SEARCH buttons. APPROVE links the TMDB match. REJECT keeps movie with no TMDB data. SEARCH opens TMDB search in a modal.

- [ ] **Step 4: Create cinema management page**

List all cinemas. Edit form: name, slug, chain, address, city, area, lat/lng, screen_count, amenities. Add new cinema form.

- [ ] **Step 5: Verify in browser**

- [ ] **Step 6: Commit**

```bash
git add apps/cinemagic/src/app/(admin)/
git commit -m "feat(cinemagic): admin panel — scraper health, movie review, cinema management"
```

---

## Task 16: Stripe Integration (Premium)

**Files:**
- Create: `apps/cinemagic/src/lib/stripe/client.ts`
- Create: `apps/cinemagic/src/lib/stripe/plans.ts`
- Create: `apps/cinemagic/src/app/api/webhooks/stripe/route.ts`
- Modify: `apps/cinemagic/src/components/dashboard/upgrade-prompt.tsx`

- [ ] **Step 1: Create Stripe client + plan config**

```typescript
// src/lib/stripe/client.ts
import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-12-18.acacia",
});
```

```typescript
// src/lib/stripe/plans.ts
export const PLANS = {
  monthly: process.env.STRIPE_PRICE_MONTHLY!,
  yearly: process.env.STRIPE_PRICE_YEARLY!,
} as const;
```

- [ ] **Step 2: Add Stripe checkout to upgrade prompt**

Create checkout session → redirect to Stripe. On success, redirect back to /dashboard.

- [ ] **Step 3: Create Stripe webhook handler**

Handle `checkout.session.completed` → update user_profiles.tier to 'premium', save stripe_customer_id. Handle `customer.subscription.deleted` → downgrade to 'free'.

- [ ] **Step 4: Add `stripe` to package.json dependencies**

- [ ] **Step 5: Verify with Stripe test mode**

- [ ] **Step 6: Commit**

```bash
git add apps/cinemagic/src/lib/stripe/ apps/cinemagic/src/app/api/webhooks/stripe/
git commit -m "feat(cinemagic): Stripe integration — checkout, webhook, tier management"
```

---

## Task 17: Additional Scrapers

**Files:**
- Create: `apps/cinemagic/src/lib/scrapers/ayala.ts`
- Create: `apps/cinemagic/src/lib/scrapers/robinsons.ts`

- [ ] **Step 1: Implement Ayala Malls Cinema scraper**

Research ayalacinemas.com or sureatyala.com. Implement following same BaseScraper pattern as SM Cinema. Register in registry.

- [ ] **Step 2: Implement Robinsons Movieworld scraper**

Research robinsonsmovieworld.com. Implement. Register.

- [ ] **Step 3: Register all scrapers in the scrape API route**

Update import list in `/api/scrape/[chain]/route.ts`.

- [ ] **Step 4: Test each scraper against live sites**

- [ ] **Step 5: Commit**

```bash
git add apps/cinemagic/src/lib/scrapers/
git commit -m "feat(cinemagic): Ayala and Robinsons scrapers"
```

---

## Task 18: Premium Suggestions Page

**Files:**
- Create: `apps/cinemagic/src/app/(auth)/suggestions/page.tsx`

- [ ] **Step 1: Create suggestions page**

Premium-only page (redirect free users to /dashboard with upgrade prompt). Sections:
- "THIS WEEKEND" — suggestions filtered to Saturday/Sunday
- "TONIGHT" — suggestions filtered to today evening (6pm+)
- "FOR YOUR WATCHLIST" — suggestions where watchlist_score > 0

Each section: heading in Bebas Neue 14px #444, suggestion cards below with reason text.

- [ ] **Step 2: Verify in browser with premium test user**

- [ ] **Step 3: Commit**

```bash
git add apps/cinemagic/src/app/(auth)/suggestions/
git commit -m "feat(cinemagic): premium suggestions page — this weekend, tonight, watchlist"
```

---

## Task 19: Calendar Sync (Premium)

**Files:**
- Create: `apps/cinemagic/src/lib/calendar/google.ts`
- Create: `apps/cinemagic/src/app/(auth)/profile/calendar/page.tsx`
- Create: `apps/cinemagic/src/app/api/webhooks/calendar/route.ts`

- [ ] **Step 1: Create Google Calendar client**

OAuth2 flow: redirect to Google consent → callback saves refresh token. Fetch busy slots from primary calendar for next 7 days. Convert to availability slots format.

- [ ] **Step 2: Create calendar settings page**

"CONNECT GOOGLE CALENDAR" button (inverted). When connected: show "CONNECTED ✓" + "DISCONNECT" button. Sync status: last sync time.

- [ ] **Step 3: Create calendar webhook**

Receives push notifications from Google Calendar when events change. Refetches busy slots + recomputes suggestions.

- [ ] **Step 4: Verify OAuth flow**

- [ ] **Step 5: Commit**

```bash
git add apps/cinemagic/src/lib/calendar/ apps/cinemagic/src/app/(auth)/profile/calendar/ apps/cinemagic/src/app/api/webhooks/calendar/
git commit -m "feat(cinemagic): Google Calendar sync for premium users"
```

---

## Task 20: E2E Tests

**Files:**
- Create: `apps/cinemagic/__tests__/e2e/homepage.spec.ts`
- Create: `apps/cinemagic/__tests__/e2e/movies.spec.ts`
- Create: `apps/cinemagic/__tests__/e2e/cinemas.spec.ts`
- Create: `apps/cinemagic/__tests__/e2e/showtimes.spec.ts`
- Create: `apps/cinemagic/__tests__/e2e/auth-flow.spec.ts`
- Create: `apps/cinemagic/__tests__/e2e/dashboard.spec.ts`

All E2E tests run against local Supabase with seeded data.

- [ ] **Step 1: Create homepage E2E test**

```typescript
import { test, expect } from "@playwright/test";

test("homepage shows date strip and movie list", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByText("CINEMAGIC")).toBeVisible();
  await expect(page.locator("[data-testid='date-strip']")).toBeVisible();
  // Click a date, verify movies load
});

test("homepage date selection updates movie list", async ({ page }) => {
  await page.goto("/");
  // Click tomorrow's date
  // Verify movie list updates
});
```

- [ ] **Step 2: Create movies E2E test**

Test: navigate to /movies, filter by status, click into detail page, verify showtime table shows.

- [ ] **Step 3: Create cinemas E2E test**

Test: navigate to /cinemas, filter by chain, click into detail page, verify schedule shows.

- [ ] **Step 4: Create showtimes E2E test**

Test: navigate to /showtimes, apply filters (date + area + format), verify results filter correctly.

- [ ] **Step 5: Create auth flow E2E test**

Test: sign up → redirect to dashboard → sign out → sign in → dashboard loads.

- [ ] **Step 6: Create dashboard E2E test**

Test: login as free user → see "MOVIES NEAR YOU" + upgrade prompt. Login as premium user → see "SUGGESTED FOR YOU" section.

- [ ] **Step 7: Run all E2E tests**

Run: `cd apps/cinemagic && npx playwright test`
Expected: All tests pass against local Supabase

- [ ] **Step 8: Commit**

```bash
git add apps/cinemagic/__tests__/e2e/
git commit -m "test(cinemagic): E2E tests — homepage, movies, cinemas, showtimes, auth, dashboard"
```

---

## Task 21: Vercel Cron Configuration

**Files:**
- Create: `apps/cinemagic/vercel.json`

- [ ] **Step 1: Create vercel.json with cron config**

```json
{
  "crons": [
    {
      "path": "/api/scrape/SM",
      "schedule": "0 */2 * * *"
    },
    {
      "path": "/api/scrape/Ayala",
      "schedule": "10 */2 * * *"
    },
    {
      "path": "/api/scrape/Robinsons",
      "schedule": "20 */2 * * *"
    }
  ]
}
```

Note: Stagger by 10 minutes to avoid concurrent scraping.

- [ ] **Step 2: Commit**

```bash
git add apps/cinemagic/vercel.json
git commit -m "feat(cinemagic): Vercel cron config for staggered scraping"
```

---

## Task 22: Final Polish + Verification

- [ ] **Step 1: Run typecheck**

Run: `cd apps/cinemagic && npm run typecheck`
Expected: No TypeScript errors

- [ ] **Step 2: Run unit tests**

Run: `cd apps/cinemagic && npm test`
Expected: All unit tests pass

- [ ] **Step 3: Run E2E tests**

Run: `cd apps/cinemagic && npm run test:e2e`
Expected: All E2E tests pass

- [ ] **Step 4: Build for production**

Run: `cd apps/cinemagic && npm run build`
Expected: Build succeeds

- [ ] **Step 5: Manual browser verification**

Walk through core flows:
1. Homepage → date selection → movie rows load
2. Movie detail → showtime table
3. Cinema detail → schedule
4. Showtimes power page → filters work
5. Sign up → profile setup → watchlist → dashboard
6. Admin panel accessible

- [ ] **Step 6: Commit any fixes**

```bash
git add -A apps/cinemagic/
git commit -m "fix(cinemagic): final polish and verification fixes"
```
