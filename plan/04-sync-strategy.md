# 04 — Sync strategy

How web and mobile stay in sync. The most over-engineered topic in mobile app design, so we'll be deliberate about scope.

## Two real options

### Option A — Online-first (RECOMMENDED for v1)

- Both clients hit the API for every read/write.
- TanStack Query caches responses locally and revalidates in the background.
- The app degrades gracefully when offline: reads from cache, writes queue up and replay when the network returns (TanStack Query's persisted-mutation pattern).
- No conflict resolution needed because there's only one source of truth and last-write-wins is acceptable for habit data.

**Pros:**
- Ships in weeks instead of months.
- No new mental model — same patterns we'd use without sync.
- Easy to reason about (the database is always right).

**Cons:**
- Cold launches without a network show a blank or stale UI.
- A user who checks off tasks in airplane mode has to keep the app open for the mutations to replay when network returns.
- Multi-device "real-time" feels like 2–10 second lag, not instant.

### Option B — Offline-first with sync

- Each client has a full local replica of the user's data (SQLite on mobile, IndexedDB on web).
- Reads go to local storage. Writes go to local storage AND to a sync queue.
- A sync layer pushes pending changes up and pulls new changes down.
- Requires per-row version numbers or vector clocks, and a defined conflict-resolution policy.

**Pros:**
- Instant reads, even on first launch (after first sync).
- Works fully offline indefinitely.
- Multi-device feels seamless.

**Cons:**
- Real engineering investment — 2–4 weeks minimum to get right, more to get right on edge cases.
- Conflict cases multiply (two devices uncheck the same task on the same day; whose wins?).
- Schema migrations across local + server become more complex.

## Recommendation: Option A for v1, keep an eye on Option B

For habit data, "I checked it off and the other device sees it within a few seconds" is plenty. The cost of offline-first is real and the payoff is marginal at our scale. Revisit when:

- The user base is large enough that "lost connectivity" complaints exceed 1% of sessions.
- The product takes on more "live collaborative" qualities (e.g., couples sharing a program).

## Concrete plumbing for Option A

### TanStack Query setup

```ts
// On both web and mobile:
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30 * 1000,           // a read is "fresh" for 30s
      gcTime: 24 * 60 * 60 * 1000,    // keep in cache for a day
      refetchOnWindowFocus: true,     // web
      refetchOnReconnect: true,
      retry: 2,
    },
    mutations: {
      retry: 1,
    },
  },
});
```

### Persisting the cache

Use `@tanstack/query-async-storage-persister` (mobile) and `@tanstack/query-sync-storage-persister` (web) so the cache survives reloads. This is what makes cold launches feel instant: the UI renders from cached data while a background revalidation runs.

### Offline writes (the queue)

Use TanStack Query's [paused-mutations](https://tanstack.com/query/latest/docs/framework/react/guides/mutations#persisting-offline-mutations) pattern: when offline, mutations are paused; when online, they're resumed and replayed in order.

This covers the common case ("I tapped a checkbox on the subway and want it persisted when I get off"). It does NOT cover ("I used the app for three days on a plane and then synced") — that's where Option B would help.

### Optimistic updates

Implement on every mutation that has user-visible state. The current Server Action UI already does optimistic updates (the check animates immediately, then reverts on failure). Keep that pattern via TanStack Query's `onMutate` / `onError`.

### Cross-device freshness

To make changes from device A appear on device B within seconds, two approaches:

1. **Polling.** TanStack Query refetches on window focus and on a 30s interval for the Today screen. Cheap, works everywhere, ~30s worst-case staleness.
2. **Supabase Realtime channels.** Supabase exposes Postgres logical replication as WebSocket subscriptions. Subscribing to `task_completions` on the current `user_id` invalidates the relevant queries on inserts/updates. ~1-2s feel.

Start with polling. Add Realtime in v1.1 if "I made a change on my laptop and it took forever to show up on my phone" becomes a complaint.

### Conflict policy (in practice)

With server as source of truth:

- **Task completion toggle** — last write wins. The server records the latest `completed_at`. No conflict possible at the row level because the row's existence is the state.
- **Notes / journal / task details** — last write wins, with debounced 600ms saves. A user editing the same note on two devices simultaneously will see a brief flicker. Acceptable.
- **Weight** — same as notes. One value per (user, date); the latest write replaces.
- **Photo upload** — last upload wins. Replacing a photo on device B while device A is mid-upload is fine; the latest `confirmPhoto` row is the authoritative one.

If "edited on two devices at once" becomes a real complaint, we add an `updated_at` and surface it ("This was edited on your iPhone 3s ago"). Not for v1.

## Migration: today's local optimistic UX

The current app already does optimistic updates inside React state, then refreshes from the server via `router.refresh()`. That pattern transfers directly to TanStack Query — `useMutation({ onMutate, onError, onSettled })`. No new mental model needed.

## Checklist for this doc

- [ ] You agree to Option A (online-first with cache) for v1.
- [ ] You're OK with ~30s cross-device staleness in v1 (Supabase Realtime to upgrade later).
- [ ] You're comfortable that simultaneous edits on two devices use last-write-wins without warnings.
