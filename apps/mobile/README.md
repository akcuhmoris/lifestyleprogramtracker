# apps/mobile

Expo (managed workflow) + EAS Build app for **Lifestyle Program Tracker**.

## Run locally

```bash
cd apps/mobile
npm install
npx expo start
```

Press `i` for iOS simulator (requires Xcode), `a` for Android emulator, or scan the QR code with Expo Go on a physical device.

### Environment variables

Create `apps/mobile/.env` with:

```
EXPO_PUBLIC_SUPABASE_URL=...
EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY=...
```

Use the same values as `apps/web/.env.local` (anon / publishable key — never the service-role key on the client).

## Production builds (EAS)

```bash
npm install -g eas-cli
eas login                 # one-time, requires an Expo account
eas build:configure       # fills in the projectId in app.json on first run
eas build --platform ios
eas build --platform android
```

The `production` profile in `eas.json` auto-increments the build number.

## Apple identifiers

- Bundle ID: `com.akhilmorisetty.lifestyleprogramtracker`
- Team ID: `S593UGVPW3`
- Sign in with Apple: enabled on the App ID

## Android identifiers

- Package: `com.akhilmorisetty.lifestyleprogramtracker`

## Project structure

```
apps/mobile/
├── app.json                # Expo config
├── eas.json                # EAS Build profiles
├── babel.config.js
├── tsconfig.json
├── package.json
├── app/                    # expo-router file-based routes
│   ├── _layout.tsx         # Root Stack + SafeAreaProvider
│   ├── index.tsx           # Landing / welcome
│   └── signin.tsx          # Sign-in (stub — wires to Supabase next)
└── lib/
    └── supabase.ts         # Supabase client w/ AsyncStorage persistence
```

## Shared code

Imports from `@program/shared` (workspace) for date math, task types, and icon registry — the same source the web app uses.
