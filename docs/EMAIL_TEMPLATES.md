# Email Templates Admin

Goal: give admins a single page where they can edit every email the system sends — subject and body — without touching code. Custom templates can also be created.

Started: 2026-05-10.

---

## Design summary

| Decision | Choice |
|---|---|
| Storage | DB table `email_templates` |
| Editor | HTML textarea (monospace) + live preview pane |
| Variables | `{{name}}` placeholders, per-template variable list with examples |
| Fallback | If DB row missing/broken, code reverts to the hardcoded default (zero risk of breaking onboarding) |
| Test send | Button to send a rendered template to the admin's own email |
| New templates | Admins can add new ones (marked non-system, deletable) |
| Reset | "Restore to default" button on system templates |

---

## Schema

`email_templates` table:

| Column | Type | Notes |
|---|---|---|
| `id` | uuid PK | |
| `key` | text unique | Used in code: `welcome_credentials`, `password_reset`, etc. |
| `name` | text | Human label shown in admin |
| `description` | text? | What this email is for |
| `category` | text | onboarding, messaging, progesterone, marketplace, system |
| `subject` | text | Supports `{{var}}` placeholders |
| `bodyHtml` | text | Full HTML, supports `{{var}}` placeholders |
| `variables` | jsonb | `[{ name, description, example }]` |
| `isSystem` | boolean | True if seeded by code; can be edited but not deleted |
| `enabled` | boolean | Disable to fall back to hardcoded default |
| `createdAt` / `updatedAt` | timestamps | |

---

## API

| Method | Route | Purpose |
|---|---|---|
| GET | `/api/admin/email-templates` | List all (auto-seeds defaults on first call) |
| POST | `/api/admin/email-templates` | Create custom |
| GET | `/api/admin/email-templates/[id]` | Fetch one |
| PUT | `/api/admin/email-templates/[id]` | Update |
| DELETE | `/api/admin/email-templates/[id]` | Delete (custom only) |
| POST | `/api/admin/email-templates/[id]/test` | Send rendered test to admin |
| POST | `/api/admin/email-templates/[id]/reset` | Restore default body (system only) |

---

## Rendering

A small helper `renderTemplate(html, vars)` does `{{var}}` substitution. Missing variables are left blank (won't crash).

`getEmailTemplate(key)` looks up by key and returns the row or `null`. Email send functions become:

```ts
const tpl = await getEmailTemplate('welcome_credentials');
if (tpl && tpl.enabled) {
  return sendEmail({
    to,
    subject: renderTemplate(tpl.subject, vars),
    html: renderTemplate(tpl.bodyHtml, vars),
  });
}
// fall through to hardcoded default
```

---

## System templates to seed

| Key | Used by |
|---|---|
| `welcome_credentials` | Admin-created user welcome |
| `password_reset` | Better Auth reset flow |
| `email_verification` | Better Auth signup verification |
| `new_message` | Conversation notifications |
| `progesterone_reminder` | Scheduled progesterone reminders |
| `breeding_window` | Breeding window detected |
| `daily_test_reminder` | Daily progesterone reminder |

---

## Admin UI

| Page | Path | Contents |
|---|---|---|
| List | `/admin/email-templates` | Templates grouped by category, search, status badge, "Add Template" button |
| Edit | `/admin/email-templates/[id]` | Header (name, key, status toggle), subject input, body editor (textarea), live preview, variables docs sidebar, Save / Test Send / Restore Default / Delete buttons |

---

## Phases

| # | Scope | Status |
|---|---|---|
| 1 | Schema + auto-seed + API routes | ✅ Done |
| 2 | Render helper + integrate welcome email (pilot) | ✅ Done |
| 3 | Admin list page | ✅ Done |
| 4 | Admin edit page (with preview + test send) | ✅ Done |
| 5 | Sidebar link | ✅ Done |
| 6 | Migrate remaining emails (follow-up PR) | Deferred |

Phase 6 is intentionally deferred — once the foundation works on the welcome email, migrating each remaining email is a 5-line change per `send*Email` function.

---

## Status: ready to test

Run `npm run db:push` to create the `email_templates` table, then visit `/admin/email-templates` — the 7 default templates will seed automatically on first load.
