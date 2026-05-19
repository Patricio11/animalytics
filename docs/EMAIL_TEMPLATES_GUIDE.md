# Email Templates — Admin Guide

A walkthrough for admins of how to manage every email the platform sends, without touching code.

---

## What this is

The Email Templates page lets you edit the **subject** and **body** of every email Animalytics sends — welcome credentials, password resets, message notifications, progesterone reminders, etc. You can also create brand-new templates for one-off campaigns.

If a template is ever broken (bad HTML, accidentally deleted), the system silently falls back to a hardcoded default baked into the code, so onboarding can never be left without an email.

---

## Where to find it

Admin sidebar → **Email Templates** → `/admin/email-templates`

The first time you visit, 7 default templates are seeded automatically:

| Category | Template | Used for |
|---|---|---|
| Onboarding | Welcome — Admin-Created User | Sent when an admin creates a user account with the temporary password |
| Onboarding | Password Reset | Sent when a user requests to reset their password |
| Onboarding | Email Verification | Sent on signup to verify the email |
| Messaging | New Message Notification | When a user gets a new conversation message |
| Progesterone & Breeding | Progesterone Test Reminder | Generic reminder when a test is due |
| Progesterone & Breeding | Breeding Window Detected | When progesterone reaches the fertile range |
| Progesterone & Breeding | Daily Test Required | When trend indicates daily testing is needed |

---

## Editing a template

1. Click any template row to open the editor
2. **Left panel** — edit the subject and the HTML body. Use `{{variableName}}` to insert dynamic values
3. **Right panel** — live preview. Subject renders on top, the full HTML body in a sandboxed iframe below. Updates as you type
4. **Variables section** at the bottom — declare every `{{placeholder}}` you use. Each variable needs:
   - A **name** (e.g. `name`, `loginUrl`)
   - A **description** (what it represents)
   - An **example value** (used in the preview and test send)
5. If you use `{{vars}}` in the subject or body that aren't declared below, a warning appears. They'll still render as empty strings, but declaring them keeps the team aware of what the template expects.
6. **Save** — your changes go live immediately. The next time the system sends that email, it uses your version.

### Buttons

- **Enabled toggle** — turn an entire template off (system falls back to the hardcoded default)
- **Test Send** — sends the email to your own admin email with the example variable values, subject prefixed with `[TEST]`
- **Restore Default** (system templates only) — resets the subject and body back to the original code default. Variables and enabled state are kept.
- **Delete** (custom templates only) — permanently removes the template

---

## Creating a custom template

1. Click **+ Add Template** on the list page
2. Fill in:
   - **Key** — lowercase, snake_case identifier (e.g. `monthly_newsletter`). This is what code uses to look it up.
   - **Name** — human-readable label
   - **Description** — what the email is for
   - **Category** — choose where it appears in the list
   - **Subject** — supports `{{vars}}`
   - **Body (HTML)** — full HTML, supports `{{vars}}`
3. Click **Create and Edit** — you're taken straight to the editor where you can declare variables, preview, and test send

> Custom templates aren't called by the system automatically — they need code that imports `renderEmailTemplate("your_key", { ... })`. They're useful for one-off newsletters or future features you want to design the email for in advance.

---

## Variables — how the placeholders work

Anywhere you write `{{name}}`, the system substitutes the value of the `name` variable when the email is sent. Examples:

```
Subject: Welcome to Animalytics, {{name}}!

Body:
<p>Hello {{name}},</p>
<p>Your temporary password is <code>{{temporaryPassword}}</code>.</p>
<p><a href="{{loginUrl}}">Sign in here</a></p>
```

When this email is sent for Jane (jane@example.com), the renderer produces:

```
Subject: Welcome to Animalytics, Jane!

Body:
<p>Hello Jane,</p>
<p>Your temporary password is <code>Xy7!aB9zQp2K</code>.</p>
<p><a href="https://animalytics.co/auth/signin">Sign in here</a></p>
```

Each system template ships with a fixed set of variables — see the variables panel in the editor for the full list and what each one means.

---

## Safety nets

- **Fallback to default** — if a template is missing or disabled in the DB, the system uses the hardcoded HTML built into the code. No email is ever silently skipped.
- **Sandboxed preview** — the live preview iframe uses `sandbox=""`, so any malicious script in the body can't escape into the admin app.
- **Test send first** — always click **Test Send** after a non-trivial edit. The email lands in your own inbox so you can see exactly what real recipients will get.
- **Restore default** — for system templates, the original HTML lives in `lib/db/seed/email-templates.ts`. One click brings it back.

---

## Editing HTML — quick tips

- Keep the structure: tables for layout (email clients are picky), inline styles, no external CSS
- Use the existing templates as a starting point — they already handle Outlook/Apple Mail quirks
- Avoid JavaScript — most email clients strip it
- Test send on Gmail and Apple Mail before assuming it looks the same everywhere
- If you break the HTML badly, hit **Restore Default** and start over

---

## Status

- Welcome credentials email is wired through the template system (pilot)
- Other emails still use their hardcoded versions for now — they continue to work normally. Migrating each to read from the template system is a 5-line code change per function and is planned as a follow-up. Until then, edits to those templates in the admin UI are saved but won't take effect until the migration ships.

The progress tracker for the rollout lives at [docs/EMAIL_TEMPLATES.md](EMAIL_TEMPLATES.md).
