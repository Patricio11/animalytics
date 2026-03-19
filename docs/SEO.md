# SEO Implementation

## Overview

Animalytics uses Next.js App Router's built-in SEO primitives — `generateMetadata`, JSON-LD structured data, a dynamic sitemap, and robots rules — so that animal profiles, marketplace listings, and breeder profiles are discoverable on Google and other search engines.

---

## Public Pages & Their SEO Status

| Page | URL Pattern | `generateMetadata` | JSON-LD | In Sitemap |
|------|-------------|-------------------|---------|------------|
| Landing | `/` | Static (layout) | `OrganizationJsonLd`, `WebsiteJsonLd` | ✅ |
| Breeder Profile | `/breeders/[slug]` | ✅ Dynamic | `BreederJsonLd`, `BreadcrumbJsonLd` | ✅ |
| Marketplace Listing | `/marketplace/[slug]` | ✅ Dynamic | `ListingJsonLd`, `BreadcrumbJsonLd` | ✅ |
| Animal Profile | `/animal/[id]` | ✅ Dynamic | `AnimalJsonLd`, `BreadcrumbJsonLd` | ✅ |
| Breeders Directory | `/breeders` | Static | — | ✅ |
| Marketplace Directory | `/marketplace` | Static | — | ✅ |

---

## Dynamic Metadata (`generateMetadata`)

Each public detail page has a server-side `generateMetadata` function that fetches live data from the database and returns:

- **`title`** — constructed from animal/listing/breeder name + breed/category + location
- **`description`** — first 160 chars of bio/description, or auto-generated from key fields
- **`keywords`** — name, breed, location, breeder name, platform name
- **`openGraph`** — title, description, type, canonical URL, and primary image (800×600 for listings, 1200×630 for breeders)
- **`twitter`** — `summary_large_image` card with title, description, and image
- **`alternates.canonical`** — prevents duplicate-content penalties

### Animal Profile (`/animal/[id]`)
Fields used: registered name, call name, breed, sex, color, date of birth, bio, profile photo, champion flag, breeder display name, breeder location.

### Marketplace Listing (`/marketplace/[slug]`)
Fields used: title, description, breed, category, sex, location, price, currency, additional images, linked animal photos.
Supports both UUID and slug-based URLs — UUID URLs redirect to the canonical slug URL.

### Breeder Profile (`/breeders/[slug]`)
Fields used: display name, tagline, bio, logo, banner, primary breeds, location.
Only generates metadata for public (`isPublic = true`) profiles.

---

## JSON-LD Structured Data

All components live in [`components/seo/JsonLd.tsx`](../components/seo/JsonLd.tsx).

### `OrganizationJsonLd`
- Type: `schema.org/Organization`
- Used on: `/` (landing page)
- Fields: name, URL, logo, description, contact point

### `WebsiteJsonLd`
- Type: `schema.org/WebSite`
- Used on: `/` (landing page)
- Includes a `SearchAction` pointing to `/marketplace?search=` — enables Google Sitelinks Search Box

### `AnimalJsonLd`
- Type: `schema.org/Animal`
- Used on: `/animal/[id]`
- Fields: name, breed, sex, birthDate, image, description, champion award, provider (breeder)

### `ListingJsonLd`
- Type: `schema.org/Product` + `Offer`
- Used on: `/marketplace/[slug]`
- Fields: title, description, image, category (breed), seller name, price, currency, availability, location

### `BreederJsonLd`
- Type: `schema.org/LocalBusiness`
- Used on: `/breeders/[slug]`
- Fields: name, description, image, address locality, aggregate rating + review count

### `BreadcrumbJsonLd`
- Type: `schema.org/BreadcrumbList`
- Used on: all detail pages
- Renders navigation breadcrumbs that appear in Google search results

---

## Sitemap (`/sitemap.xml`)

File: [`app/sitemap.ts`](../app/sitemap.ts)

Dynamically generated at request time. Includes:

| Section | Source | Priority | Change Frequency |
|---------|--------|----------|-----------------|
| Static pages (home, marketplace, breeders, privacy, terms) | Hardcoded | 0.3 – 1.0 | Monthly – Weekly |
| Active marketplace listings | `listings` table, `status = 'active'` | 0.7 | Weekly |
| Public breeder profiles | `breeder_profiles` table, `is_public = true` | 0.8 | Weekly |
| Active animal profiles | `animals` table, `is_active = true` | 0.7 | Weekly |

---

## Robots (`/robots.txt`)

File: [`app/robots.ts`](../app/robots.ts)

- **Allowed**: all public pages
- **Disallowed**: `/api/`, `/admin/`, `/auth/`, `/settings/`, `/pet-owner/`, `/unauthorized/`
- Points crawlers to `/sitemap.xml`

---

## Architecture Pattern

Detail pages follow a **server + client split**:

```
app/[section]/[id]/
  page.tsx                ← Server component: generateMetadata + renders Client
  [Section]Client.tsx     ← "use client": interactive UI, React Query, state
```

This allows `generateMetadata` (which must run server-side) to coexist with heavily interactive client pages.

Examples:
- `app/animal/[id]/page.tsx` + `AnimalProfileClient.tsx`
- `app/marketplace/[slug]/page.tsx` + `ListingDetailClient.tsx`
- `app/breeders/[slug]/page.tsx` + `BreederProfileClient.tsx`

---

## What Google Will Index

- Searching **"[breeder name] dog breeder"** → breeder profile with location and rating
- Searching **"[breed] puppy for sale [location]"** → marketplace listing with price
- Searching **"[animal name] [breed]"** → individual animal profile
- Searching **"Animalytics"** → landing page with Sitelinks Search Box
