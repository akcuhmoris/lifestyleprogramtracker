# Play Console listing draft

## App details

| Field | Value |
| ----- | ----- |
| **App name** | Lifestyle Program Tracker |
| **Default language** | English (United States) |
| **App or Game** | App |
| **Free or Paid** | Free |
| **Package name** | `com.akhilmorisetty.lifestyleprogramtracker` (same identifier across iOS + Android, by convention) |
| **Category** | Health & Fitness |
| **Tags** | habit tracking, journaling, weight tracking |

---

## Short description (80 chars max)

```
Track 75 Hard, 100 Hard, or any program you build — your tasks, your way.
```

---

## Full description (4000 chars max)

```
Lifestyle Program Tracker is a no-nonsense habit tracker for the disciplined.

Whether you're running the 75 Hard challenge, the 100 Hard challenge, your own
30-day reset, or a custom routine you invented yourself, this app gives you the
structure to commit and the satisfaction of watching each day fill in electric
blue.

━━━ CUSTOMIZE EVERYTHING ━━━

• Pick the length — 1 to 365 days
• Add, edit, reorder, or remove daily tasks
• Choose an icon for each task from a curated set
• Require text on any task (like a workout log)
• Set one task as a journal entry, one as a daily photo

━━━ THE DAILY VIEW THAT MAKES IT EASY ━━━

• Tap to complete — satisfying spring + ripple + confetti
• Inline drawers for workout details and reading logs
• Tap the journal card to write
• Tap the photo card to upload a daily progress picture
• Autosaving notes + weight check-in always available

━━━ KNOW YOUR PROGRESS ━━━

• 100-cell calendar heatmap shows every day at a glance
• Tap any past day to edit it — yes, even after the fact
• Stats page with per-task completion rates, totals, and weight trend
• Day counter, ring, and bar always show where you stand

━━━ MISS A DAY? YOUR CHOICE. ━━━

• Strict mode: restart from Day 1
• Modified rules: keep going, the miss stays in your history
• Either way, your past data is preserved

━━━ PRIVATE BY DESIGN ━━━

• Sign in with email, Google, or Apple
• Your data syncs between phone and the web
• No ads, no trackers, no data sold to anyone
• Delete your account and all your data with one tap

━━━ NO COACHING. NO BS. ━━━

Lifestyle Program Tracker doesn't tell you what your program should be. You
decide. The app just keeps the score, with the visual polish to make every
check feel earned.

Web companion at https://[YOURDOMAIN].app
Privacy policy: https://[YOURDOMAIN].app/privacy
```

---

## Graphic assets needed

- **App icon**: 512 × 512 PNG (32-bit, with alpha)
- **Feature graphic**: 1024 × 500 PNG (no transparency)
- **Phone screenshots**: at least 2, up to 8. 16:9 or 9:16 aspect ratio, JPEG/PNG.
- **7-inch tablet** screenshots: optional unless we support tablets in v1.
- **10-inch tablet** screenshots: optional.

(See `screenshots.md` for the planned screen list and overlay copy.)

---

## Content rating (IARC questionnaire — expected answers)

Result you're aiming for: **Everyone**.

- Violence: **No**
- Sexual content: **No**
- Profanity: **No**
- Controlled substances: **No** (the "No alcohol" task is abstinence, not depiction.)
- Gambling: **No**
- User-generated content: **No** (users don't share content with each other.)
- Shares personal info: **No** (we do not transmit user data to advertisers.)
- Shares location: **No**
- Digital purchases: **No** (v1 is free.)

---

## Target audience and content

- **Target age**: 13 and over.
- **Appeal to children**: No.
- **Made for Families** program: No.

---

## Data Safety form (the long one)

### Data collected

| Data | Collected | Shared | Optional | Purpose |
| ---- | --------- | ------ | -------- | ------- |
| Email address | Yes | No | No (required for account) | Account management, Communication |
| User IDs | Yes | No | No | Account management |
| App interactions | Yes | No | Yes (analytics opt-in) | Analytics |
| Crash logs | Yes | No | No | Analytics |
| Diagnostics | Yes | No | No | Analytics |
| Photos (user-uploaded progress photos) | Yes | No | Yes | App functionality |
| Health & fitness — exercise | Yes | No | Yes | App functionality |
| Health & fitness — other (weight, journal) | Yes | No | Yes | App functionality |

### Data is encrypted in transit: **Yes**
### Users can request data be deleted: **Yes**
### Data deletion mechanism: in-app via Settings → Account → Delete account, plus email request.

---

## URLs

| Field | Value |
| ----- | ----- |
| **Website** | `https://[YOURDOMAIN].app/` |
| **Email** | `support@[YOURDOMAIN].app` |
| **Privacy Policy** | `https://[YOURDOMAIN].app/privacy` |

---

## Release notes for v1.0

```
First public release.

• Custom programs of 1–365 days
• Configurable daily tasks (checkbox, journal, or photo)
• Calendar heatmap with editable past days
• Per-task stats and weight trend
• Restart prompt + Day-N completion celebration
• Web and Android in sync
```

---

## Pre-release checklist

- [ ] Privacy Policy hosted at `https://[YOURDOMAIN].app/privacy`
- [ ] Support email active and monitored
- [ ] Package name reserved
- [ ] Closed testing with at least 12 unique testers for 14+ days *(required by Google for new developer accounts before going to production — start now)*
- [ ] All Data Safety questions answered honestly
- [ ] Account deletion path implemented and discoverable in-app
- [ ] App icon + feature graphic finalized
- [ ] Screenshots captured (see `screenshots.md`)
- [ ] Android 13+ photo picker permissions reviewed (`READ_MEDIA_IMAGES`)
