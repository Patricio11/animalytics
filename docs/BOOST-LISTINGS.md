# Boost Listings

Boost Listings allows marketplace listing owners to pay to promote their listings. There are two boost categories, each priced independently:

**Animalytics System** — Priority placement at the top of the marketplace with enhanced visual styling (gradient border, "Boosted" badge). This is an in-app boost that immediately affects how the listing appears and ranks within the Animalytics marketplace.

**Social Media Advertising** — The listing is promoted as an ad on selected social media platforms (Facebook, Instagram, TikTok, X/Twitter, YouTube). Each platform has its own price. An "All Social Media" bundle option is also available at a discounted rate. Social media ads will eventually be created automatically via platform APIs.

Owners can select one or both categories. Pricing is configured per option by the admin.

---

## How It Works

1. **Admin configures pricing** for the Animalytics System boost and each social media platform under `/admin/marketplace` > Boost Pricing tab.
2. **Listing owner clicks the Boost button** (lightning icon) on their listing card in the marketplace.
3. **Owner selects boost options:**
   - Animalytics System — for in-app priority placement
   - Social Media platforms — individual or "All Social Media" bundle
4. **Owner selects a duration** (1, 3, 7, 14, or 30 days) and reviews the price breakdown.
5. **Payment is deducted from the owner's wallet** balance.
6. **Animalytics System boost** takes effect immediately — the listing gets a gradient border, "Boosted" badge, and sorts to the top of marketplace results.
7. **Social media boosts** create pending ad records. Currently fulfilled manually by admin (who adds post URLs). Future: auto-created via platform APIs.
8. **Admin tracks all boosts** under `/admin/marketplace` > Active Boosts tab.

---

## Admin Setup

Navigate to `/admin/marketplace` and select the **Boost Pricing** tab.

### Platform Options

| Platform Key | Display Name | Description |
|-------------|-------------|-------------|
| `system` | Animalytics System | In-app priority placement at top of marketplace |
| `facebook` | Facebook | Ad/post on Facebook page |
| `instagram` | Instagram | Promoted post on Instagram |
| `tiktok` | TikTok | Ad campaign on TikTok |
| `twitter` | X (Twitter) | Promoted tweet on X |
| `youtube` | YouTube | Video ad on YouTube |
| `all_social` | All Social Media (Bundle) | Discounted bundle for all social platforms |

### Pricing Fields

| Field | Description |
|-------|-------------|
| Platform | Select from the options above |
| Display Name | Label shown to users in the boost dialog |
| Price Per Day | Cost per day in the selected currency (stored in cents internally) |
| Currency | USD, EUR, GBP, ZAR, AUD, or CAD |
| Description | Optional note shown to users (e.g. "Posted to our 50K+ follower page") |
| Sort Order | Controls display order in the boost dialog |
| Active | Toggle to enable/disable a platform option |

### Example Pricing

| Platform | Price/Day | Description |
|----------|-----------|-------------|
| Animalytics System | $2.00 | Priority in-app placement |
| Facebook | $5.00 | Posted to 50K+ follower page |
| Instagram | $4.00 | Promoted post with listing images |
| TikTok | $3.50 | Short-form video ad |
| X (Twitter) | $3.00 | Promoted tweet |
| YouTube | $6.00 | Video ad campaign |
| All Social Media | $15.00 | Bundle discount (vs $21.50 individual) |

---

## User Flow

1. Go to the marketplace and find your listing.
2. Click the **Zap icon** (lightning bolt) on the listing card.
3. The boost dialog opens with two sections:
   - **Animalytics System** — Select to get priority placement within the marketplace.
   - **Social Media Advertising** — Select individual platforms or "All Social Media" for the bundle price.
4. Choose a boost duration (1, 3, 7, 14, or 30 days).
5. Review the total cost and confirm your wallet has sufficient balance.
6. Click **Boost Now** to confirm.

**What happens after boosting:**

- **Animalytics System**: Listing immediately gets enhanced styling (gradient ring, "Boosted" badge) and sorts to the top of marketplace results.
- **Social Media**: A boost record is created with `pending` status for each selected platform. Admin posts the ads manually (future: automated via APIs). Post URLs are tracked in the admin panel.
- **Both**: Can be selected together. Pricing is calculated independently and summed.

---

## Admin Management

The **Active Boosts** tab at `/admin/marketplace` shows:

- All boost orders with listing name, owner, selected platforms, duration, total amount, and status
- Filter by status (active, completed, cancelled, expired)
- Summary cards showing active boost count and total revenue
- Click the **link icon** to open the edit dialog where you can:
  - Add social media post URLs for each platform after posting
  - Change the boost status (active, completed, cancelled, expired)
- Click the **eye icon** to view the listing in the marketplace

---

## Database Schema

### `boost_pricing`

Admin-configured pricing per platform.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| platform | text (unique) | `system`, `facebook`, `instagram`, `tiktok`, `twitter`, `youtube`, `all_social` |
| display_name | text | Shown to users |
| price_per_day | integer | Price in cents per day |
| currency | text | Currency code (default: USD) |
| is_active | boolean | Whether available to users |
| description | text | Optional description |
| sort_order | integer | Display ordering |
| created_at | timestamp | |
| updated_at | timestamp | |

### `listing_boosts`

Individual boost purchase records.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| listing_id | UUID FK | The boosted listing |
| user_id | text FK | The buyer |
| platforms | jsonb (string[]) | Array of selected platform keys (expanded from bundles) |
| start_date | timestamp | Boost start |
| end_date | timestamp | Boost expiry |
| duration_days | integer | Number of days |
| total_amount | integer | Total cost in cents |
| currency | text | Currency code |
| wallet_transaction_id | UUID | Links to wallet transaction for audit |
| status | text | `active`, `completed`, `cancelled`, `expired` |
| social_media_post_urls | jsonb | Post/ad URLs per platform `{ facebook: "https://...", ... }` |
| social_media_post_status | jsonb | Per-platform status `{ facebook: "pending", instagram: "published" }` |
| social_media_external_ids | jsonb | External IDs from platform APIs `{ facebook: "ad_123" }` |
| created_at | timestamp | |
| updated_at | timestamp | |

---

## API Routes

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| GET | `/api/admin/marketplace/boost-pricing` | Admin | List all pricing configurations |
| POST | `/api/admin/marketplace/boost-pricing` | Admin | Create or update a pricing entry |
| DELETE | `/api/admin/marketplace/boost-pricing?id=` | Admin | Delete a pricing entry |
| GET | `/api/admin/marketplace/boosts` | Admin | List all boosts (filter by `?status=`) |
| PATCH | `/api/admin/marketplace/boosts` | Admin | Update boost (post URLs, status) |
| GET | `/api/marketplace/boost-pricing` | User | Get active pricing options only |
| GET | `/api/marketplace/listings/[id]/boost` | User | Get active boost for a listing |
| POST | `/api/marketplace/listings/[id]/boost` | Owner | Create a boost (wallet payment) |

---

## Components

| Component | Location | Purpose |
|-----------|----------|---------|
| `BoostPricingSettings` | `components/admin/BoostPricingSettings.tsx` | Admin pricing CRUD with add/edit/delete dialog |
| `ActiveBoostsView` | `components/admin/ActiveBoostsView.tsx` | Admin boost order management and tracking |
| `BoostListingDialog` | `components/marketplace/BoostListingDialog.tsx` | User-facing boost purchase dialog with two sections |
| `ListingCard` | `components/breeder/marketplace/ListingCard.tsx` | Boost button (Zap icon) + visual styling for boosted listings |

---

## Wallet Integration

Boost payments use the existing wallet system (`lib/utils/wallet.ts`):

- `hasSufficientBalance()` — checks wallet balance before purchase
- `subtractFromBalance()` — deducts the total amount on purchase
- `getBalance()` — displays current balance in the boost dialog
- A `transactions` record is created with type `payment` for full audit trail
- Insufficient balance shows a clear error with the exact shortfall amount

---

## Visual Indicators

- **Boosted card**: Gradient ring border + subtle gradient background (Animalytics System boost only)
- **"Boosted" badge**: Gradient badge with lightning icon overlaid on the listing image
- **Boost button**: Lightning (Zap) icon in the owner's action bar — filled when listing has an active boost
- **Sort priority**: System-boosted listings sort before non-boosted listings via `isFeatured` + `featuredPriority` columns

---

## Social Media Integration (Future Roadmap)

The schema is designed and ready for future automatic API integrations with social media platforms. Currently, social media boosts are fulfilled manually by admin. The planned automation:

### Platform APIs

| Platform | API | What It Will Do |
|----------|-----|-----------------|
| Facebook | Facebook Marketing API | Auto-create ad campaigns targeting animal/breeder audiences |
| Instagram | Instagram Graph API | Auto-create promoted posts with listing images |
| TikTok | TikTok Marketing API | Auto-create short-form video ad campaigns |
| X (Twitter) | X Ads API | Auto-create promoted tweets with listing details |
| YouTube | YouTube Data API | Auto-create video ad campaigns |

### Automated Flow

1. User selects social media platforms and pays via wallet.
2. The system creates a `listing_boosts` record with `social_media_post_status` set to `pending` for each selected platform.
3. A background job calls the platform's API to create the ad/post using listing data (images, title, description, price, breed, location).
4. On success:
   - `social_media_post_status[platform]` updates to `published`
   - `social_media_external_ids[platform]` stores the platform's ad/post ID
   - `social_media_post_urls[platform]` stores the live ad URL
5. On failure:
   - `social_media_post_status[platform]` updates to `failed`
   - Admin is notified to resolve manually
6. When boost expires, the background job calls the platform API to pause/delete the ad.

### Integration-Ready Fields

| Field | Purpose |
|-------|---------|
| `social_media_post_status` | Tracks per-platform ad creation: `pending` → `published` / `failed` |
| `social_media_external_ids` | Stores platform ad IDs for managing, pausing, or deleting ads |
| `social_media_post_urls` | Stores live ad/post URLs for verification and display |
