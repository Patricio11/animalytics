# Animalytics — SEO Implementation Tracker

Tracking the work being done from the SEO_PLAYBOOK against the current state of the project.
Started: 2026-04-28.

---

## Site inputs

| Input | Value |
|---|---|
| `PRODUCTION_DOMAIN` | `animalytics.co` |
| `BUSINESS_NAME` | `Animalytics` |
| `LEGAL_NAME` | `Animalytics` *(update if there's a registered legal entity)* |
| `TAGLINE_TITLE` | `Professional Breeding & Animal Management Platform` |
| `META_DESCRIPTION` | "The leading platform for professional breeders and pet owners. Manage breeding records, health tracking, pedigree trees, mating calculators, and connect with verified breeders worldwide." |
| `PRIMARY_KEYWORDS` | dog breeding platform, animal management, breeder platform, pedigree tracker |
| `SECONDARY_KEYWORDS` | progesterone tracking, mating calculator, conception rating, frozen semen, stud dogs, puppies for sale, verified breeders |
| `BUSINESS_GEO` | *(N/A — global online platform)* |
| `OPENING_HOURS` | *(N/A)* |
| `SUPPORT_EMAIL` | `support@animalytics.co` |
| `AREAS_SERVED` | Worldwide |
| `SOCIAL_PROFILES` | *(none yet — populate when live)* |
| `PUBLIC_ROUTES` | `/`, `/explore`, `/breeders`, `/marketplace`, `/animal/[id]`, `/breeders/[slug]`, `/marketplace/[slug]`, `/global-breeders`, `/privacy`, `/terms` |
| `PRIVATE_ROUTE_PREFIXES` | `/admin`, `/api`, `/auth`, `/settings`, `/pet-owner`, `/dashboard`, `/animals`, `/calculators`, `/messages`, `/tasks`, `/wallet`, `/verification` |

---

## Phase A — Technical foundations

| Item | Status | Notes |
|---|---|---|
| Root `metadata` in `app/layout.tsx` | ✅ Done | title template, description, keywords, OG, Twitter, robots |
| `metadata.metadataBase` | ✅ Done | Uses `NEXT_PUBLIC_APP_URL` with fallback |
| `metadata.applicationName` | ✅ Done | `Animalytics` |
| `metadata.icons` (favicon set) | ✅ Wired | References `/favicon.ico`, `/icon.svg`, `/apple-touch-icon.png` — user must drop the files into `/public` |
| `metadata.manifest` | ✅ Wired | References `/site.webmanifest` — user must drop the file into `/public` |
| `metadata.verification` (env-driven) | ✅ Done | Reads `GOOGLE_SITE_VERIFICATION` and `BING_SITE_VERIFICATION` |
| `metadata.category` | ✅ Done | `pets` |
| `viewport` export with `themeColor` | ✅ Done | `#0082c8` (brand blue) |
| Per-page metadata on `/` | ⚠️ Inherits root | Acceptable — root is already keyword-tuned |
| `app/sitemap.ts` | ✅ Done | Includes static + dynamic listings, breeders, animals |
| `app/robots.ts` | ✅ Done | Has disallow rules for private paths |
| Organization JSON-LD | ✅ Done | `OrganizationJsonLd` — has `@id` for cross-linking |
| Website JSON-LD | ✅ Done | `WebsiteJsonLd` (with SearchAction) |
| LocalBusiness JSON-LD | N/A | Not a local business — global platform |
| Service JSON-LD | ✅ Done | `ServiceJsonLd` with offer catalogue (pedigree, progesterone, mating, marketplace) |
| BreadcrumbList JSON-LD | ✅ Done | `BreadcrumbJsonLd` exists, used on subpages |
| Animal/Listing/Breeder schemas | ✅ Done | Already in `JsonLd.tsx` |

---

## Phase B — Content / on-page

| Item | Status | Notes |
|---|---|---|
| Hero H1 keyword optimised | ⚠️ Review | Needs review pass — current H1 is good ("Built for Breeders Who Mean Business") but lacks core keywords |
| FAQ section + FAQPage JSON-LD | ✅ Done | `components/landing/FaqSection.tsx` — 8 long-tail questions, JSON-LD inlined |
| Footer audit (trademark, year, alt text) | ⚠️ Review | Pending |
| Image alt text audit | ⚠️ Review | Spot-fix as we go |

---

## Phase C — Tracking

| Item | Status | Notes |
|---|---|---|
| `@vercel/analytics` installed + mounted | ✅ Done | Mounted in root layout `<body>` |
| `@vercel/speed-insights` installed + mounted | ✅ Done | Mounted in root layout `<body>` |
| GSC verification token wired (env) | ✅ Done | Reads `GOOGLE_SITE_VERIFICATION` env var |
| Bing verification token wired (env) | ✅ Done | Reads `BING_SITE_VERIFICATION` env var |
| GA4 / Plausible | N/A (skip) | Vercel Analytics is enough |

---

## Phase 5 — Manual steps for the user (post-deploy)

These need to happen in the user's browser, not in code:

1. **Google Search Console** — verify domain via HTML tag method, set `GOOGLE_SITE_VERIFICATION` env var in Vercel, redeploy, click Verify in GSC.
2. **Submit sitemap in GSC** → Sitemaps → enter `sitemap.xml` → Submit.
3. **Bing Webmaster Tools** — easiest: import from GSC. Otherwise set `BING_SITE_VERIFICATION` env.
4. **Vercel Analytics + Speed Insights** — toggle on in Vercel dashboard → Analytics tab.
5. **OG image** — generate a 1200×630 branded image, save as `public/og-image.png`. (Already referenced in metadata.)
6. **Favicon set** — use [realfavicongenerator.net](https://realfavicongenerator.net), drop the bundle into `public/`:
   - `favicon.ico`, `icon.svg`, `apple-touch-icon.png`, `site.webmanifest`
7. **Vercel canonical domain** — confirm `animalytics.co` is primary, `www.` 301s to apex.

---

## Files modified / created

| File | Change | Phase |
|---|---|---|
| `docs/SEO_IMPLEMENTATION.md` | New tracker doc | — |
| `app/layout.tsx` | Added applicationName, category, icons, manifest, verification, viewport, mounted Analytics + SpeedInsights | A + C |
| `components/landing/FaqSection.tsx` | New — 8-question FAQ accordion + FAQPage JSON-LD | B |
| `components/seo/JsonLd.tsx` | Added `ServiceJsonLd`, added `@id` to OrganizationJsonLd, expanded contactPoint | A |
| `app/page.tsx` | Mounted `<FaqSection />` and `<ServiceJsonLd />` | A + B |
| `package.json` | Added `@vercel/analytics`, `@vercel/speed-insights` | C |

---

## Still pending (next pass)

- [ ] Hero H1 keyword review (current "Built for Breeders Who Mean Business" doesn't lead with primary keywords)
- [ ] Footer audit — auto-update copyright year, expand logo alt text, add `#faq` anchor link
- [ ] Image alt text audit — sweep `app/page.tsx` for generic alts
- [x] ~~User: drop favicon set into `/public/`~~ Done — favicon.ico, favicon.svg, favicon-96x96.png, apple-touch-icon.png, site.webmanifest, web-app-manifest 192/512 PNGs all present and wired
- [ ] User: replace `/public/og-image.png` with a branded 1200×630 design (placeholder accepted for now)
- [ ] User: post-deploy GSC + Bing verification + sitemap submission
