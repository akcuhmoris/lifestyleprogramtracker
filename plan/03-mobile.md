# 03 — Mobile app

The plan for the iOS / Android client and how it shares code with the web.

## Stack

- **Expo SDK (managed workflow).** No need to touch Xcode / Android Studio for v1. EAS handles native builds, EAS Update handles OTA.
- **React Native** for UI primitives.
- **NativeWind v4** (Tailwind for React Native) so the design tokens defined in `tailwind.config.ts` work on mobile.
- **TanStack Query** for caching and data fetching against the tRPC client.
- **React Navigation** for the tab + modal stack.
- **Expo modules used in v1:**
  - `expo-image-picker` — pick a photo from camera or library
  - `expo-image` — a faster `<Image>`
  - `expo-secure-store` — store the Supabase refresh token securely
  - `expo-notifications` — push (optional in v1, planned in v1.1)
  - `expo-updates` — over-the-air JS updates without store re-submission
  - `expo-haptics` — small haptic on task check (subtle delight)
  - `expo-linking` — deep links for magic-link sign-in
- **State:** TanStack Query + a small Zustand store for UI state (modals, drawer state).
- **Animations:** `react-native-reanimated` for spring task-check animation + ripple. `react-native-confetti-cannon` for celebration.

## Monorepo layout

```
program/                              <- root
├── apps/
│   ├── web/                          <- the current Next.js app, lightly migrated
│   └── mobile/                       <- new Expo app
├── packages/
│   ├── shared/                       <- types, validation schemas, business logic
│   │   ├── src/
│   │   │   ├── tasks.ts              <- the `Task` type and helpers (moves here)
│   │   │   ├── date.ts               <- date helpers (moves here)
│   │   │   ├── icons.ts              <- icon registry (moves here; web + mobile both consume)
│   │   │   └── schemas.ts            <- Zod schemas for tRPC inputs
│   ├── api/                          <- tRPC router definitions
│   │   └── src/
│   │       └── routers/
│   │           └── ...
│   └── ui/ (optional)                <- if we want shared cross-platform primitives
├── pnpm-workspace.yaml
├── package.json
└── turbo.json (optional)             <- add later if build times demand
```

The `web` app imports from `packages/api` to mount the tRPC routes; the `mobile` app imports the **type** (not the runtime code) from `packages/api` to get end-to-end type safety on the tRPC client. The `shared` package supplies non-React logic both apps use.

## Code sharing — what moves vs what stays

| File / module                             | Where it lives now             | Where it lives in the monorepo                    |
| ----------------------------------------- | ------------------------------ | ------------------------------------------------- |
| `src/lib/date.ts`                         | `apps/web/src/lib/date.ts`     | `packages/shared/src/date.ts` (consumed by both)  |
| `src/lib/tasks.ts`                        | same                           | `packages/shared/src/tasks.ts`                    |
| `src/lib/icons.ts`                        | same                           | `packages/shared/src/icons.ts`                    |
| tRPC routers                              | n/a yet                        | `packages/api/src/routers/`                       |
| Zod schemas                               | embedded in actions today      | `packages/shared/src/schemas.ts`                  |
| React components                          | `apps/web/src/components/`     | **stay in web** — RN can't render `<div>` etc.    |
| RN screens / components                   | n/a yet                        | `apps/mobile/src/`                                |

**Important:** there is no "universal component library" plan for v1. The web uses HTML/CSS components; mobile builds its own native screens. They share types, validation, and business logic — not React render trees. Cross-platform component libraries (Tamagui, etc.) are tempting but slow you down at the start. Add later if it's worth it.

## Mobile screens to build

Mirror the web routes:

| Web route       | Mobile screen          | Notes                                          |
| --------------- | ---------------------- | ---------------------------------------------- |
| `/`             | TodayScreen            | Same content, native cards + sheet for journal |
| `/calendar`     | CalendarScreen         | Native grid, native sheet for day detail       |
| `/stats`        | StatsScreen            | Reuse the chart math; Reanimated for the bars  |
| `/settings`     | SettingsScreen         | Native form + bottom-sheet for icon picker     |
| (welcome modal) | OnboardingStack        | A real 3-screen onboarding using FlatList       |
| Auth (new)      | SignInScreen, SignUpScreen, MagicLinkPendingScreen |

Navigation: a bottom tab bar with `Today`, `Calendar`, `Stats`, `Settings`. The help / welcome flow is reachable from a header button on the Today screen.

## Photo flow on mobile

This is the one piece that's noticeably different from the web.

1. User taps the Progress photo card → `ImagePicker.launchImageLibraryAsync()` (or `launchCameraAsync()` if you offer a "Take photo" choice).
2. Get back a local URI + MIME.
3. `trpc.media.requestPhotoUpload.mutate({ date, mime })` → returns a signed PUT URL + the storage key.
4. `fetch(signedUrl, { method: "PUT", body: file })`.
5. `trpc.media.confirmPhoto.mutate({ date, key, mime })`.
6. Invalidate the day query → thumbnail re-renders from a signed read URL (1-hour TTL, refresh on use).

## Push notifications (v1.1)

Not in v1, but the design:

- On first launch after sign-in, request push permission.
- POST the Expo Push token to `trpc.notifications.registerDevice`.
- The server stores `{ user_id, expo_push_token, platform, created_at }` rows.
- A scheduled job (Supabase Edge Function or external cron) at the user's local 9 PM checks the day's `task_completions` count and sends a "you have N tasks left today" if non-zero.
- A second job at the user's local 8 AM sends "Day N — let's go" with a deep link to today.
- All notifications respect a "Quiet mode" toggle on the user's profile.

## Deep links

Required for magic-link sign-in to work:

- Configure the scheme in `app.json`: `"scheme": "program"` and `"ios.associatedDomains": ["applinks:program.app"]` (once you own the domain).
- Magic-link URL hosted by Supabase: `https://YOUR_PROJECT.supabase.co/auth/v1/verify?token=...&redirect_to=program://auth/callback`.
- App handles the deep link and exchanges the token via Supabase client.

Test thoroughly on a real device — the iOS simulator doesn't render Universal Links the same as production.

## Why React Native specifically vs alternatives

| Option                | Why we didn't pick it                                                                 |
| --------------------- | ------------------------------------------------------------------------------------- |
| Flutter               | Dart everywhere; can't share JS/TS code with the web; design system would be re-done. |
| Native iOS + Android  | Two teams' worth of work for v1.                                                      |
| Capacitor / Ionic     | WebView-based feels noticeably worse on a complex interactive app like this.          |
| Tauri Mobile          | Too immature for App Store submission today.                                          |
| React Native Web      | We already have a Next.js web app; using RN for web would erase polish we already shipped. |

## Checklist for this doc

- [ ] You've installed pnpm + the Expo CLI + the EAS CLI.
- [ ] You've created an Apple Developer account ($99/yr) and a Google Play Console account ($25 one-time).
- [ ] You've decided whether Apple OAuth is in v1 (recommended) or v1.1.
- [ ] You're comfortable with "two view layers, one business layer" rather than a universal UI lib.
