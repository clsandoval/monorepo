# Cinema Showtime Aggregator — Design Spec

**Date:** 2026-03-22
**Status:** Draft
**Project:** `apps/cinemagic` (working name)

## Overview

A Metro Manila cinema showtime aggregator with freemium personalization. Scrapes showtimes from major cinema chains, enriches with TMDB metadata, and serves on a mobile-first responsive web app. Free users browse listings; premium users get calendar-aware, profile-based movie suggestions.

**Competitors:** ClickTheCity.ph (general listings), Sinegang.com (cinema-focused)
**Differentiator:** Personalized, schedule-aware recommendations — "tell us when you're free, we'll tell you what to watch and where."

## Core Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Architecture | Monolithic Next.js | Fastest to ship, SSR for SEO, single deploy target. Extract scrapers to Fly.io later if needed. |
| Data source | Scraping cinema chain websites | Fast to start, covers all chains. Fragile but manageable at Metro Manila scale (~40 cinemas). |
| Movie metadata | TMDB API | Free, comprehensive, well-maintained. Filipino film gaps acceptable for v1. |
| Launch scope | Metro Manila only | Density of moviegoers, manageable scraping scope. Provincial expansion later. |
| Platform | Mobile-first responsive web | Fastest to ship, no app store. Matches existing stack. PWA upgrade possible later. |
| Monetization | Freemium SaaS + ads | ₱149/mo or ₱1,490/yr premium. Non-intrusive ads on free tier. |
| Schedule integration | Manual (free) + Calendar sync (premium) | Natural upgrade nudge. Manual availability is zero-dependency for free tier. |

## Data Model

### Cinema

| Field | Type | Notes |
|-------|------|-------|
| id | uuid | PK |
| name | text | e.g., "SM Megamall" |
| slug | text | URL-friendly, unique |
| chain | text | SM, Ayala, Robinsons, Vista, Gateway, Indie |
| address | text | Full street address |
| city | text | e.g., "Mandaluyong" |
| area | text | e.g., "Ortigas", "BGC", "Makati CBD" |
| lat | float | Latitude for proximity search |
| lng | float | Longitude for proximity search |
| screen_count | int | Number of screens |
| amenities | text[] | IMAX, Dolby, 4DX, Director's Club, etc. |
| created_at | timestamptz | |
| updated_at | timestamptz | |

### Movie

| Field | Type | Notes |
|-------|------|-------|
| id | uuid | PK |
| tmdb_id | int | Nullable — unmatched movies won't have this |
| slug | text | URL-friendly, unique |
| title | text | English/international title |
| title_local | text | Filipino title if different |
| synopsis | text | From TMDB |
| genres | text[] | e.g., ["Action", "Sci-Fi"] |
| cast | jsonb | Array of {name, character, profile_path} |
| director | text | |
| poster_url | text | TMDB CDN URL |
| backdrop_url | text | TMDB CDN URL |
| trailer_url | text | YouTube URL |
| rating_mtrcb | text | G, PG, R-13, R-16, R-18 |
| rating_tmdb | float | 0-10 scale |
| runtime_minutes | int | |
| release_date_ph | date | Philippine release date |
| status | text | now_showing, coming_soon, ended |
| tmdb_match_confidence | float | 0-1, for flagging low-confidence matches |
| created_at | timestamptz | |
| updated_at | timestamptz | |

### Showtime

| Field | Type | Notes |
|-------|------|-------|
| id | uuid | PK |
| cinema_id | uuid | FK → Cinema |
| movie_id | uuid | FK → Movie |
| screen_name | text | e.g., "Cinema 3", "IMAX Hall" |
| start_time | timestamptz | |
| price_min | int | In PHP cents |
| price_max | int | In PHP cents |
| format | text | 2D, 3D, IMAX, 4DX, Dolby |
| scraped_at | timestamptz | When this data was last confirmed |
| source_url | text | URL it was scraped from |
| created_at | timestamptz | |

**Unique constraint:** `(cinema_id, movie_id, start_time, format)` — prevents duplicate showtimes.

### UserProfile

| Field | Type | Notes |
|-------|------|-------|
| id | uuid | PK, FK → auth.users |
| email | text | |
| display_name | text | |
| tier | text | free, premium |
| location_lat | float | User's saved location |
| location_lng | float | |
| preferred_genres | text[] | Max 3 for free, unlimited for premium |
| availability_slots | jsonb | Array of {day_of_week, start_time, end_time} |
| calendar_connected | boolean | Premium only |
| calendar_provider | text | google, apple (nullable) |
| stripe_customer_id | text | Nullable |
| created_at | timestamptz | |
| updated_at | timestamptz | |

### PreferredCinema

| Field | Type | Notes |
|-------|------|-------|
| user_id | uuid | FK → UserProfile |
| cinema_id | uuid | FK → Cinema |

**Limit:** 2 for free, unlimited for premium.

### Watchlist

| Field | Type | Notes |
|-------|------|-------|
| id | uuid | PK |
| user_id | uuid | FK → UserProfile |
| movie_id | uuid | FK → Movie |
| priority | text | want_to_see, maybe, interested |
| added_at | timestamptz | |

**Limit:** 5 movies for free, unlimited for premium.

### SuggestionCache

| Field | Type | Notes |
|-------|------|-------|
| id | uuid | PK |
| user_id | uuid | FK → UserProfile |
| showtime_id | uuid | FK → Showtime |
| score | float | 0-1 computed relevance |
| reason | text | Human-readable explanation |
| computed_at | timestamptz | |

**TTL:** 2 hours (matches scrape frequency). Old entries purged on recompute.

### Key Indexes

- `showtimes(movie_id, start_time)` — "when is this movie playing?"
- `showtimes(cinema_id, start_time)` — "what's playing at this cinema?"
- `showtimes(start_time) WHERE start_time > now()` — upcoming only (partial index)
- `cinemas` GiST index on `(lat, lng)` — proximity search via PostGIS or earthdistance
- `movies(status)` — filter now_showing / coming_soon
- `suggestion_cache(user_id, computed_at)` — fetch latest suggestions

## Scraping Pipeline

### Target Chains (Metro Manila)

| Chain | Est. Cinemas | Site Complexity |
|-------|-------------|-----------------|
| SM Cinema | ~15 | JS-heavy, likely needs Playwright |
| Ayala Malls Cinemas | ~8 | Moderate |
| Robinsons Movieworld | ~8 | Standard HTML |
| Vista Mall / Starmall | ~5 | Varies |
| Gateway / Ali Mall | ~3 | Standard |
| Indie (Power Plant, Cinema '76) | ~3 | May need manual approach |

### Architecture

```
Vercel Cron (every 2 hours, 6am-12am PHT)
  → POST /api/scrape/[chain]
    → chain-specific scraper runs
      → normalizes to RawShowtime[]
        → upserts to Supabase (dedup on unique constraint)
          → triggers TMDB enrichment for new movie titles
```

### Scraper Interface

```typescript
interface ChainScraper {
  chain: string;
  scrape(): Promise<RawShowtime[]>;
  healthCheck(): Promise<boolean>;
}

interface RawShowtime {
  cinemaName: string;       // matched to Cinema by name + chain
  movieTitle: string;       // fuzzy-matched to Movie via TMDB
  screenName: string;
  startTime: Date;
  priceMin?: number;
  priceMax?: number;
  format: string;
  sourceUrl: string;
}
```

### Design Principles

- **One scraper per chain** — isolated failures. SM going down doesn't break Ayala.
- **Idempotent upserts** — same showtime scraped twice doesn't create duplicates.
- **Staleness detection** — 3 consecutive failures flags chain as stale, shown in admin UI and alerts operator.
- **Rate limiting** — stagger chain scrapes, random delays between requests. Respect robots.txt.
- **Scrape window** — every 2 hours during 6am-12am PHT. No scraping midnight-6am.

### TMDB Enrichment Flow

1. New movie title appears in scraped data
2. Search TMDB by title + year
3. High-confidence match (>0.85): auto-link, pull full metadata (synopsis, cast, poster, genres, etc.)
4. Low-confidence or no match: create movie record with scraped title only, flag for admin review
5. Poster/backdrop URLs stored as TMDB CDN links (no self-hosting images)

## Recommendation Engine

### Scoring Formula

```
score = (genre_match    × 0.30)
      + (availability   × 0.25)
      + (proximity      × 0.20)
      + (watchlist      × 0.15)
      + (rating         × 0.10)
```

| Signal | Calculation |
|--------|------------|
| genre_match | Overlap of user's preferred genres with movie genres. 3/3 = 1.0, 1/3 = 0.33 |
| availability | Showtime in free slot = 1.0, within 1hr = 0.5, outside = 0.0. Free tier: manual slots. Premium: calendar-derived. |
| proximity | Distance from user location to cinema. <3km = 1.0, 3-10km = 0.7, 10-20km = 0.3, >20km = 0.1 |
| watchlist | want_to_see = 1.0, maybe = 0.5, not on list = 0.0 |
| rating | TMDB rating / 10 |

### Computation Strategy

- Implemented as a Postgres function — no external ML service needed for v1
- Triggered on: new showtimes ingested, user updates preferences, user requests refresh
- Results cached in SuggestionCache, TTL 2 hours
- Free users: scoring without calendar availability (manual slots only, availability weight redistributed)
- Premium users: full scoring with calendar sync

### What Users See

**Free tier:**
- "Movies near you" — proximity + rating
- "Based on your tastes" — genre match
- Manual availability filtering on showtime pages

**Premium tier:**
- "Your perfect showtime" — fully personalized, calendar-aware picks
- "This Saturday evening" — temporal suggestions
- Explanation strings: "Recommended because you like action + free Saturday 7pm + 2km from you"
- Notifications when watchlisted movie has showtime in free slot

## Pages & Routes

### Public (No Auth, SSR for SEO)

| Route | Purpose |
|-------|---------|
| `/` | Homepage — now showing grid, trending, search, "near me" CTA |
| `/movies` | All movies — filterable by status, genre, rating |
| `/movies/[slug]` | Movie detail — poster, synopsis, cast, trailer, MTRCB rating, all showtimes grouped by cinema |
| `/cinemas` | All cinemas — map view + list view, filter by chain/area/amenity |
| `/cinemas/[slug]` | Cinema detail — address, amenities, today's schedule, showtimes grouped by movie |
| `/showtimes` | Power page — filter by date, time, area, cinema, movie, format |

### Authenticated (Free Tier)

| Route | Purpose |
|-------|---------|
| `/dashboard` | Personal dashboard — basic suggestions, watchlist preview, nearby showtimes, upgrade prompt |
| `/watchlist` | Saved movies with priority, quick link to showtimes |
| `/profile` | Location, preferred cinemas (max 2), genres (max 3), manual availability slots |

### Premium

| Route | Purpose |
|-------|---------|
| `/dashboard` | Enhanced — full recommendation engine, "Your perfect showtime", calendar-aware picks |
| `/profile/calendar` | Connect Google/Apple Calendar, manage sync settings |
| `/suggestions` | Dedicated smart suggestions page — "This weekend", "Tonight", "For your watchlist" with explanations |

### Admin

| Route | Purpose |
|-------|---------|
| `/admin/scraper` | Per-chain health, last run, success rate, stale alerts |
| `/admin/movies/review` | Low-confidence TMDB matches needing manual confirmation |
| `/admin/cinemas` | Add/edit cinema details, coordinates, amenities |

### Core User Flow

```
Homepage → Browse "Now Showing" or Search
  → Movie detail → See all showtimes by cinema
    → Filter by area / time / format
      → Pick showtime → Cinema detail with directions

Premium shortcut:
  Dashboard → "Your perfect showtime" → Done
```

## Tech Stack

| Layer | Choice |
|-------|--------|
| Framework | Next.js 16 (App Router, SSR) |
| Database | Supabase (Postgres + Auth + RLS) |
| Styling | Tailwind CSS 4 + shadcn/ui |
| Scraping | Playwright (handles JS-heavy cinema sites) |
| Movie metadata | TMDB API |
| Calendar sync | Google Calendar API (premium) |
| Maps | Leaflet + OpenStreetMap (free) or Mapbox GL |
| Payments | Stripe (subscriptions) |
| Deployment | Vercel |
| Testing | Vitest (unit) + Playwright (E2E against local Supabase) |

## Project Structure

```
apps/cinemagic/
├── src/
│   ├── app/                       # Next.js App Router
│   │   ├── (public)/              # Public route group (SSR)
│   │   │   ├── page.tsx           # Homepage
│   │   │   ├── movies/
│   │   │   ├── cinemas/
│   │   │   └── showtimes/
│   │   ├── (auth)/                # Authenticated routes
│   │   │   ├── dashboard/
│   │   │   ├── watchlist/
│   │   │   ├── profile/
│   │   │   └── suggestions/
│   │   ├── (admin)/               # Admin routes
│   │   │   └── admin/
│   │   ├── api/
│   │   │   ├── scrape/[chain]/    # Per-chain scraper endpoints
│   │   │   ├── suggest/           # Recommendation engine
│   │   │   └── webhooks/          # Calendar sync webhooks
│   │   └── layout.tsx
│   ├── lib/
│   │   ├── supabase/              # Client + server clients, types
│   │   ├── scrapers/              # Per-chain scraper modules
│   │   │   ├── sm-cinema.ts
│   │   │   ├── ayala.ts
│   │   │   ├── robinsons.ts
│   │   │   ├── vista.ts
│   │   │   ├── gateway.ts
│   │   │   └── types.ts           # ChainScraper interface
│   │   ├── tmdb/                  # TMDB API client + fuzzy matching
│   │   ├── recommendations/       # Scoring engine
│   │   └── calendar/              # Google Calendar integration
│   ├── components/
│   │   ├── movies/                # Movie cards, grids, detail
│   │   ├── cinemas/               # Cinema cards, map view
│   │   ├── showtimes/             # Filters, list, format badges
│   │   ├── dashboard/             # Suggestion cards, upgrade prompt
│   │   └── ui/                    # shadcn components
│   └── hooks/
├── supabase/
│   └── migrations/
├── public/
├── package.json
├── next.config.ts
├── tailwind.config.ts
└── tsconfig.json
```

## Premium Tiers & Pricing

| | Free | Premium |
|---|---|---|
| **Price** | ₱0 | ₱149/month or ₱1,490/year |
| Browse showtimes | Unlimited | Unlimited |
| Movie/cinema search | Full | Full |
| Watchlist | 5 movies | Unlimited |
| Genre preferences | 3 genres | Unlimited |
| Preferred cinemas | 2 cinemas | Unlimited |
| Availability | Manual slots | Calendar sync (Google) |
| Suggestions | "Near you" + "Trending" | Full engine + "Perfect showtime" |
| Suggestion explanations | No | Yes |
| Notifications | No | Watchlist + showtime alerts |
| Ads | Yes (non-intrusive) | No |

## Revenue Streams

1. **Premium subscriptions** — primary revenue
2. **Display ads (free tier)** — cinema chain ads, movie studio promos. Non-intrusive: homepage banner, showtime page interstitial.
3. **Affiliate tickets (future)** — deep-link to cinema online booking with affiliate tracking. Not in v1.

## Premium Upgrade Touchpoints

- Dashboard: "Unlock smarter suggestions" card
- Watchlist: "You've saved 5 movies — upgrade for unlimited"
- Showtime results: "Premium users get personalized picks" inline
- After browsing 3+ movies: subtle bottom bar "Save time — let us suggest"

## Out of Scope for v1

- Native mobile apps (iOS/Android)
- Provincial cinema coverage
- Ticket purchasing / booking
- Social features (friend groups, shared watchlists)
- Collaborative filtering / ML-based recommendations
- Apple Calendar sync (Google only for v1)
- Community-submitted showtimes
- Reviews / user-generated content
