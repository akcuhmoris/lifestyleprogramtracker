# apps/mobile

> 🚧 **Not yet scaffolded.** The Expo project lands here in Phase 7. See [`plan/03-mobile.md`](../../plan/03-mobile.md) for the full architecture and [`plan/08-roadmap.md`](../../plan/08-roadmap.md) for the schedule.

## When to start

Phase 7 unblocks when you have:

- [ ] **Apple Developer Program** enrolled and active (~24–72 h activation)
- [ ] **Google Play Console** enrolled and active (~48 h)
- [ ] **Expo account** (free) at <https://expo.dev>
- [ ] **Xcode** installed (Mac App Store) for the iOS simulator
- [ ] **Bundle ID + Android package name** reserved (e.g. `com.yourname.program`)

Once those are in place, the AI will scaffold the Expo project here. The plan in `plan/03-mobile.md` covers exactly what gets built and in what order.

## What it will contain

```
apps/mobile/
├── App.tsx                # Root, with React Navigation tab bar
├── app.json               # Expo config (scheme, bundle ID, splash)
├── eas.json               # EAS Build profiles (preview, production)
├── babel.config.js
├── metro.config.js
├── tsconfig.json
├── package.json           # Expo SDK + RN + Reanimated + NativeWind + TanStack Query
└── src/
    ├── screens/
    │   ├── TodayScreen.tsx
    │   ├── CalendarScreen.tsx
    │   ├── StatsScreen.tsx
    │   ├── SettingsScreen.tsx
    │   ├── SignInScreen.tsx
    │   └── SignUpScreen.tsx
    ├── components/         # Native equivalents of web components
    ├── lib/
    │   ├── supabase.ts     # mobile Supabase client (Expo SecureStore for tokens)
    │   ├── trpc.ts         # tRPC client wired to the same routers as web
    │   └── theme.ts        # NativeWind tokens sharing apps/web's palette
    └── navigation/
```

## What it will share with the web

| From | Path | Why |
| --- | --- | --- |
| Shared types | `packages/shared/src/{date,tasks,icons}.ts` | Day math, Task type, icon names |
| tRPC API | `packages/api` (type import only) | End-to-end type safety against the same backend |
| Design tokens | `apps/web/tailwind.config.ts` (re-export) | Single source of palette + spacing |

## What it will NOT share

- React components — web uses HTML/CSS, mobile uses RN primitives. They're different render targets.
- Routing — web uses Next.js App Router, mobile uses React Navigation.

## Until then

The web app at `apps/web` handles every feature. Nothing about mobile preparation has to happen before you start your Expo account.
