# 06 — Distribution

How the apps reach users. App Store, Play Store, and the web's "soft launch" flow.

## Timeline overview

| Phase                      | Week (relative)  | What ships                              |
| -------------------------- | ---------------- | --------------------------------------- |
| Internal alpha (web only)  | 0                | Web at staging URL, you + ~3 friends    |
| Internal alpha (mobile)    | 1                | TestFlight + Play internal, same crowd  |
| Closed beta                | 2-4              | Up to 100 testers across web + mobile   |
| Soft launch                | 5-6              | Web live on custom domain; store review submission |
| App Store / Play live      | 7                | Both stores approved & public           |
| Marketing                  | 8+               | Whatever growth plan you have           |

## iOS — App Store

### Pre-submission setup

1. **Bundle identifier.** Choose now and don't change it: e.g. `com.program.lifestyle`. Register it in the Apple Developer portal.
2. **App Store Connect.** Create a new app:
   - Name: `Program` (or your chosen brand).
   - Primary language: English (US).
   - SKU: anything internal, e.g. `program-ios-001`.
   - Bundle ID: from step 1.
3. **App Icon + Splash.** Apple requires a 1024×1024 PNG with no transparency. Splash via Expo's built-in.
4. **Screenshots** (required for every supported device size — Apple's a stickler):
   - 6.7" (iPhone 15 Pro Max) — at minimum 3 screenshots.
   - 6.5" — at minimum 3 screenshots.
   - 5.5" — required for legacy phones (you can usually get away with fewer if you don't support older iOS versions).
   - iPad screenshots: only if you support iPad. Skip for v1.
5. **App description, keywords, support URL, privacy policy URL.** All required. The privacy policy URL must be a real, hosted page.

### TestFlight (closed beta)

1. Upload your first EAS-built `.ipa` via `eas submit -p ios` or App Store Connect.
2. After Apple's automated review (~30 min), add testers via TestFlight by email.
3. Invite up to 100 internal testers (employees) or up to 10,000 external testers (anyone with the link).

### Production submission

1. Build a production `.ipa` (`eas build --platform ios --profile production`).
2. Upload via `eas submit -p ios` or Transporter app.
3. In App Store Connect, fill in all required metadata + screenshots.
4. Submit for review. Apple's review takes 24–48 hours typically, sometimes longer.
5. **Common rejection reasons** to pre-empt:
   - **Missing privacy policy.** Have one published before submitting.
   - **Sign in with Apple required if you offer other social logins.** Add it.
   - **Account deletion in-app required** (App Store rule since 2022). Build a "Delete my account" screen.
   - **Demo account credentials missing.** If your app requires sign-in to see content, provide a test account in App Review notes.
   - **Vague "Push notification" usage.** If you ask for push permission, describe what you'll send.

### After approval

- Auto-release or manual release. For v1, manual release lets you flip the switch on a day you're paying attention.
- Set up phased release (Apple's default is 7-day rollout). Lets you catch crashes before everyone gets the new version.

## Android — Play Store

### Pre-submission setup

1. **Package name** (analogous to iOS bundle ID): `com.program.lifestyle`. Pick it carefully — Google does NOT let you change it post-launch.
2. **Play Console.** Create a new app:
   - App name: `Program`.
   - Default language: English (US).
   - App type: App (not Game).
   - Free vs paid: Free (for v1).
3. **Required metadata:**
   - Short description (80 chars max).
   - Full description (4000 chars).
   - Privacy policy URL.
   - App category (likely Health & Fitness).
   - Content rating: complete the IARC questionnaire — should result in "Everyone" for a habit tracker.
   - Target audience age range: at least 13+ (lower is a regulatory minefield).
4. **Graphics:** App icon (512×512), feature graphic (1024×500), at least 2 screenshots per supported form factor.
5. **Data safety form.** A long questionnaire about what data you collect. Be honest — Google checks. The privacy policy doc in [07](./07-production-readiness.md) gives you the answers.

### Internal testing → Closed → Open → Production

Play has four tracks. Use them in order:

1. **Internal testing.** Up to 100 testers by email. Activates within minutes.
2. **Closed testing.** Up to several thousand testers. Activates within hours.
3. **Open testing.** Anyone with the link. Activates after Play review (~1-3 days).
4. **Production.** Public on the Play Store. Activates after Play review (~1-3 days for new apps; ~few hours for updates).

Submit your first EAS build (`eas submit -p android`) to internal testing. Promote up the tracks as confidence grows.

### Android-specific gotchas

- **Android 14 photo picker.** If you use `ImagePicker`, request only the new `READ_MEDIA_IMAGES` permission, not the legacy `READ_EXTERNAL_STORAGE`. Expo handles this in recent SDKs.
- **App Bundles, not APKs.** Play requires AAB format. EAS Build does this by default.
- **Foreground service for reminders.** Push notifications via Expo Notifications use Firebase Cloud Messaging under the hood; you'll need a Firebase project for the Android side of push.

## Web — soft launch

No "store" to fight, but think of these as your submissions:

- [ ] Production deploy on Vercel under the custom domain.
- [ ] HTTPS working (Vercel auto).
- [ ] `robots.txt` allowing indexing (or not, if you don't want to be discoverable yet).
- [ ] OpenGraph image + meta tags for shareability.
- [ ] Sitemap if you plan SEO.
- [ ] Lighthouse Mobile score >= 90 on the landing page.

For the first 4 weeks, share the URL only with people you trust. Watch error rates in Sentry. When they're flat for 2 weeks straight, open the gates.

## A landing page

You'll want one. The current `/` is the app shell, which means an unsigned-in visitor needs somewhere to land that explains the product. Options:

1. **Add a marketing landing page at `/`** and move the app shell to `/app`. More work, much better conversion.
2. **Sign-in screen at `/`** with a tiny "What is this?" link to a separate `/about` page. Less work, lower conversion.

Default to Option 2 for v1, build Option 1 once you know what to put on it.

## App store ASO (App Store Optimization)

Honest advice: don't sweat it for v1. Pick clear keywords (`habit tracker`, `100 hard`, `75 hard`, `lifestyle program`, `accountability`) and a clear screenshot story. Real downloads come from outside the store anyway.

## Checklist for this doc

- [ ] Bundle ID and package name reserved.
- [ ] App Store Connect + Play Console listings created (drafts are fine).
- [ ] Screenshot mocks captured (you can use the iOS simulator or the real device).
- [ ] Privacy policy + terms drafted (see [07](./07-production-readiness.md)).
- [ ] You have 5-10 names you'd be willing to email when TestFlight is ready.
