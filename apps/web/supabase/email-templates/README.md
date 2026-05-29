# Branded Supabase email templates

Paste these into your Supabase project: **Authentication → Emails**. Each template has its own tab in the dashboard.

## How Supabase variables work

These templates use Supabase's mustache-style variables:

| Variable | Meaning |
| --- | --- |
| `{{ .ConfirmationURL }}` | The link the user clicks to confirm / sign in / reset |
| `{{ .Token }}` | Six-digit code (only relevant for OTP flows) |
| `{{ .Email }}` | The recipient's email |
| `{{ .SiteURL }}` | Your app's base URL (set in Project Settings → API) |

When you paste these, do NOT escape the `{{ }}` — Supabase substitutes at send time.

## Files

| File | When it's sent |
| --- | --- |
| `confirm-signup.html` | New user signs up with email + password |
| `magic-link.html` | User requests a passwordless sign-in link |
| `password-reset.html` | User clicks "Forgot password?" |
| `change-email.html` | User changes their account email |
| `invite-user.html` | Admin invites a user (not used in v1) |

## Setup steps

1. In Supabase dashboard → **Authentication → URL Configuration**:
   - **Site URL**: `https://YOUR_DOMAIN.app` (or `http://localhost:3000` for staging)
   - **Redirect URLs**: add `https://YOUR_DOMAIN.app/auth/callback` and `http://localhost:3000/auth/callback`
2. In **Authentication → Emails**, paste each template into its corresponding tab:
   - **Confirm signup** → `confirm-signup.html`
   - **Magic Link** → `magic-link.html`
   - **Reset password** → `password-reset.html`
   - **Change Email Address** → `change-email.html`
3. Click **Save** on each tab.
4. Test by triggering one of the flows in the app.

## Customization

- Replace `YOUR_DOMAIN.app` placeholders with your real domain before going to production.
- The accent color `#0EA5FF` matches the in-app electric blue. Tweak in each `<style>` block if your brand changes.
- All inline styles — required because most email clients strip `<head>` styles.
