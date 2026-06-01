# App Store Connect listing draft

## App information

| Field | Value |
| ----- | ----- |
| **Name** | Lifestyle Program Tracker |
| **Subtitle** (30 chars max) | Track any program, your way |
| **Bundle ID** | `[com.YOURNAME.lifestyleprogram]` |
| **SKU** | `lifestyleprogram-ios-001` |
| **Primary category** | Health & Fitness |
| **Secondary category** | Productivity |
| **Default language** | English (U.S.) |

---

## Promotional text (170 chars, can change without re-review)

> Build the habits that make you. 75 Hard, 100 Hard, or any program you design — Lifestyle Program Tracker logs every day, every task, every photo.

---

## Description (4000 chars max)

```
Lifestyle Program Tracker is a no-nonsense habit tracker for the disciplined.

Whether you're running the 75 Hard challenge, the 100 Hard challenge, your own
30-day reset, or a custom routine you invented yourself, this app gives you the
structure to commit and the satisfaction of watching each day fill in electric
blue.

CUSTOMIZE EVERYTHING
• Pick the length — 1 to 365 days
• Add, edit, reorder, or remove daily tasks
• Choose an icon for each task from a curated set
• Require text on any task (like a workout log)
• Set one task as a journal entry, one as a daily photo

THE DAILY VIEW THAT MAKES IT EASY
• Tap to complete — satisfying spring + ripple + confetti
• Inline drawers for workout details and reading logs
• Tap the journal card to write
• Tap the photo card to upload a daily progress picture
• Autosaving notes + weight check-in always available

KNOW YOUR PROGRESS
• 100-cell calendar heatmap shows every day at a glance
• Tap any past day to edit it
• Stats page with per-task completion rates, totals, and weight trend
• Day counter, ring, and bar always show where you stand

MISS A DAY? YOUR CHOICE.
• Strict mode: restart from Day 1
• Modified rules: keep going, the miss stays in your history

PRIVATE BY DESIGN
• Sign in with email, Apple, or Google
• Your data syncs between iPhone and the web
• No ads, no trackers, no data sold to anyone
• Delete your account and all your data with one tap

NO COACHING. NO BS.
Lifestyle Program Tracker doesn't tell you what your program should be. You
decide. The app just keeps the score, with the visual polish to make every
check feel earned.
```

(approx. 1,500 chars — well under the 4,000-char limit. Pad with more feature
detail if you want; trim if anything feels like marketing fluff.)

---

## Keywords (100 chars total, comma-separated, no spaces in keywords)

```
habit,tracker,75hard,100hard,routine,discipline,goals,fitness,journal,checklist,wellness,program
```

(98 chars — adjust to taste.)

---

## What's New (release notes for v1.0)

```
First public release.

• Custom programs of 1–365 days
• Configurable daily tasks (checkbox, journal, or photo)
• Calendar heatmap with editable past days
• Per-task stats and weight trend
• Restart prompt + Day-N completion celebration
• Web and iOS in sync
```

---

## URLs

| Field | Value |
| ----- | ----- |
| **Support URL** | `https://[YOURDOMAIN].app/support` |
| **Marketing URL** (optional) | `https://[YOURDOMAIN].app/` |
| **Privacy Policy URL** | `https://[YOURDOMAIN].app/privacy` |

---

## Age rating questionnaire (expected answers)

- Cartoon or fantasy violence: **None**
- Sexual content: **None**
- Profanity or crude humor: **None**
- Alcohol, tobacco, or drug use: **None** (the **No alcohol** task references abstinence — that's not "depiction").
- Simulated gambling: **None**
- Horror/Fear themes: **None**
- Mature/Suggestive themes: **None**
- Medical/Treatment information: **Infrequent/Mild** (the app is a tracker, not advice; we will disclaim).
- Made for Kids: **No** — the audience is 13+.

Expected rating: **4+**

---

## App Review Information

| Field | Value |
| ----- | ----- |
| **Contact first name** | `[YOUR FIRST NAME]` |
| **Contact last name** | `[YOUR LAST NAME]` |
| **Phone** | `[YOUR PHONE]` |
| **Email** | `[YOUR EMAIL]` |
| **Demo account username** | `appreview@[YOURDOMAIN].app` |
| **Demo account password** | `[GENERATE AND STORE IN PASSWORD MANAGER]` |
| **Notes** | "The app requires sign-in to access any feature. Use the demo credentials above. The demo account is pre-seeded with the default 12-task 100-day program and 14 days of historical data. There is no in-app purchase, no third-party login required, and account deletion is available at Settings → Account → Delete account." |

---

## Pricing

| Field | Value |
| ----- | ----- |
| **Price** | Free |
| **Available in all territories** | Yes |
| **Pre-orders** | No |

---

## App Privacy (data types collected)

| Data type | Collected? | Linked to user? | Used to track? |
| --------- | ---------- | ---------------- | -------------- |
| Contact info — email | Yes | Yes | No |
| Identifiers — user ID | Yes | Yes | No |
| Usage data — product interaction | Yes (if user opts in) | Yes | No |
| Diagnostics — crash data | Yes | No | No |
| Health & fitness — workout / journal / weight | Yes | Yes | No |
| Photos | Yes (only progress photos the user uploads) | Yes | No |

All other categories: **Not collected**.

Purposes: **App Functionality**, **Analytics** (opt-in), **Product Personalization** (no), **Advertising** (no).

---

## Pre-release checklist

- [ ] Privacy Policy hosted at `https://[YOURDOMAIN].app/privacy`
- [ ] Support page hosted at `https://[YOURDOMAIN].app/support`
- [ ] Sign in with Apple implemented (Apple requires this if Google sign-in is offered on iOS)
- [ ] Account deletion implemented in-app
- [ ] Demo account created and seeded with sample data
- [ ] App Tracking Transparency (ATT) prompt: **not required** because we do not use IDFA
- [ ] Screenshots for 6.7", 6.5", 5.5" device sizes (see `screenshots.md`)
- [ ] App icon (1024×1024 PNG, no transparency, no rounded corners)
