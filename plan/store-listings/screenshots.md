# Screenshot plan

The shots that ship in the App Store + Play Store listings. The story is "Customize → Daily → See the data → Celebrate."

## Story arc (5 frames)

### Frame 1 — Hero / Today view

- Day counter ring at "Day 23 of 100"
- Day progress bar at ~67%
- 12 task cards visible, 8 checked in electric blue, 4 untouched
- Tagline overlay: **"Track any program. Your tasks. Your rules."**

### Frame 2 — Customize in Settings

- Settings page with the tasks list editor showing
- One task being edited in the modal (icon picker open)
- Tagline: **"Pick your length. Edit your tasks. Anything goes."**

### Frame 3 — Calendar heatmap

- /calendar with a mix of blue, yellow, and red days
- Hover/tap state showing a day detail modal opening
- Tagline: **"See every day at a glance. Edit any of them."**

### Frame 4 — Stats

- /stats with per-task bars at varying %s
- Weight trend sparkline showing a slight downward trend
- Tagline: **"Know exactly where you stand."**

### Frame 5 — Completion screen

- The Day-100 victory layout
- Trophy + "Program complete" + totals
- Tagline: **"And when you finish? You'll feel it."**

## Device sizes required

### iOS (App Store Connect)

- **6.7-inch** (iPhone 15/16 Pro Max): 1290 × 2796 px portrait — **required**, 3+ images
- **6.5-inch** (iPhone 11 Pro Max / XS Max): 1242 × 2688 px — required for legacy support
- **5.5-inch** (iPhone 8 Plus): 1242 × 2208 px — optional but recommended

### Android (Play Console)

- **Phone**: at least 2, recommended 4. 16:9 or 9:16, JPEG/PNG. Min dimension 320 px, max 3840 px.

## How to capture

1. Use the iOS Simulator for clean status bars. `Hardware → Device → iPhone 15 Pro Max` then `File → New Screen Shot` for each frame.
2. Use Android Studio's emulator with the matching device skin for Play.
3. Avoid screenshots from physical devices unless the simulator can't reproduce the state. Battery / time inconsistencies will get screenshots rejected.
4. Add overlay text in Figma or Sketch — keep it small (Apple has rejected listings for being "all marketing copy"). The screenshot should still be primarily app content.

## Tools (optional)

- **Fastlane Frameit** automates the "device-frame around screenshot" treatment.
- **Picsew** (Mac App Store) is a handy quick-stitcher.
- **Figma** is fine for hand-laying out the marketing overlays.

## Common rejection causes for screenshots

- Apple: showing the iOS keyboard in a screenshot (it's flagged as a status-bar interaction).
- Apple: showing a competitor's logo or app.
- Google: overlaying text that obscures more than ~25% of the screenshot.
- Both: showing data that looks fake / unrealistic (e.g. "Day 100 with 100% completion on every task" can read as a mockup). Use lived-in data — a real-looking partial.

## Optional: app-preview video

Apple lets you upload a 15-30s app preview video per device family. Worth doing in v1.1, not v1. If you make one, keep it under 20 seconds and lead with the "check a task → confetti" hit.
