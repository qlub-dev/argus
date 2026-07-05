# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

Argus (`@qlub-foss/argus`) is a small browser-only library that collects client-side performance metrics (Web Vitals, API resource timing, user timing marks/measures) and forwards normalized payloads to a caller-supplied report callback. It targets browsers with `PerformanceObserver` and the Web Vitals APIs — there is no server/runtime component.

## Commands

- Install deps: `pnpm install` (package manager is pinned via `packageManager` in `package.json`; use pnpm, not npm/yarn)
- Build: `pnpm build` (`rimraf dist && tsc && rollup -c` — emits CJS + ESM + `.d.ts` to `dist/`)
- Test: `pnpm test` (Jest with `jsdom` environment, `ts-jest`)
  - Single test file: `pnpm test tests/lib/check-value-bounds.test.ts`
  - Single test by name: `pnpm test -t "test name"`
- Lint: `pnpm lint` (ESLint with `--fix`)
- Format: `pnpm format` (Prettier, includes import-sorting via `@trivago/prettier-plugin-sort-imports`)
- Type-check only: `pnpm exec tsc --noEmit`

Lefthook runs format + lint + `tsc --noEmit` on staged `*.{js,ts,jsx,tsx}` files pre-commit, and `commitlint` on commit messages (Conventional Commits required — enforced by `commitlint.config.js` + `@commitlint/config-conventional`).

## Architecture

**Singletons drive everything.** `Engine` (`src/engine.ts`) is a singleton that owns one `PerformanceObserver` per `PerformanceEntryType` (see `src/enums.ts`) and fans out entries to all registered handlers for that type. `Argus` (`src/index.ts`) is a separate singleton — `Argus.getInstance(onReport, config)` — that wires up collectors on top of `Engine` based on config. The first call to `Argus.getInstance()` locks in both the report callback and the merged config for the page's lifetime; subsequent calls are no-ops that return the existing instance (`Argus.resetForTests()` is the deliberate escape hatch for unit tests and must not be used in app code). `init()` is idempotent, and `shutdown()` → `init()` is a supported stop/resume cycle.

**Metadata lifecycle**: metadata lives on the `Argus` instance. `init(metadata)` and `setMetadata(metadata)` merge keys into the current bag (setting a key to `undefined` removes it) and both go through `setMetadata`, the single write path. API/user-timing reports always read the *current* metadata through a live getter (`#getMetadata`), which is correct since they report near-realtime. Web-vital reports resolve metadata against a capped history of timestamped snapshots (`#metadataHistory`, `MetadataResolver` in `src/collectors/web-vitals.ts`) keyed to each metric's own measurement time (extracted from `metric.entries` — e.g. the largest layout-shift entry for CLS) rather than its flush time — this matters because CLS/INP report once, late (typically on tab hide), covering the whole page view, so without this a page-scoped key like a page path would otherwise get stamped with whatever was current at flush, not measurement. Under sustained high-frequency `setMetadata()` calls the history can evict the snapshot an old, still-unflushed metric needs, falling back to the oldest snapshot kept (`METADATA_HISTORY_LIMIT` in `src/index.ts`) — accepted as a rare, self-correcting tradeoff rather than engineered away.

**Collector → Handler → Engine pipeline**, for both API timing and user timing:
1. `src/handlers/*.ts` — takes a tracker config + `onReport`, builds the entry-to-payload mapping (via `prepareMetric` in `src/utils.ts`), and calls into a collector.
2. `src/collectors/*.ts` — creates a filter/handler function (checks entry type, regex/id match, `checkValueWithinBounds`, `evaluateSamplingChance`) and registers it with `Engine.observe(type, handler)`. Returns a `disconnect()` closure.
3. `Engine` owns the actual `PerformanceObserver` instances and dispatches raw entries to every registered handler for that entry type.

Web Vitals (`src/collectors/web-vitals.ts`) bypasses `Engine` entirely — it wires the `web-vitals` package's `onCLS`/`onINP`/`onLCP`/`onFCP`/`onTTFB` directly to a report handler, since that package manages its own observers. Because `web-vitals` has no unsubscribe API, its collector's `disconnect()` only gates reporting off (and `reconnect()` gates it back on) — the underlying handlers stay registered for the page lifetime, which is why `Argus` registers web vitals exactly once per instance and re-enables the gate on re-init instead of re-registering (re-registering would immediately re-report already-final metrics).

**Config merging**: `src/configs/defaults.ts` defines `defaultConfigs`; `src/configs/index.ts` (`loadConfigs`) does a shallow per-section merge (top-level, `webVitals`, `apiTiming`, `userTiming`) of user config over defaults — note `apiTiming.trackers` is replaced wholesale by the user's array if provided, not merged per-tracker. Sampling rate resolution order at call sites is always tracker-level → section-level → global `samplingRate`.

**Payload shape**: `prepareMetric` (`src/utils.ts`) is the single place that assembles the final reported object — it stamps `agent: "argus"`, a derived `event` string (`perf-<type>-<label>`), `preparedAt`, `argusMetricType`, spreads the raw entry, then spreads metadata (metadata wins on key collisions). `filterObjectFields` (`src/lib/filter-object-fields.ts`) then applies `whitelistedFields` if configured, otherwise passes everything through.

**User timing contract**: `markUserTimingStart(id)` / `markUserTimingEnd(id)` (exported from `src/utils.ts`, re-exported from `src/index.ts`) create `performance.mark`/`measure` calls named `${id}-start`/`${id}-end`/`${id}-duration`. The `id` in a `UserTimingTracker` config must exactly match the id used at the call sites — the collector filters on the literal `${id}-duration` measure name.

**Disconnect semantics**: `Engine.disconnect(type)` when called with a type tears down and removes *all* handlers for that entry type, not just the caller's — collectors sharing an entry type (e.g. multiple API trackers all use `PerformanceEntryType.RESOURCE`) will all be disconnected together when any one of their `disconnect()` closures is called. Keep this in mind when adding new collectors on a shared entry type. `Engine` records the timestamp of each disconnect and, because observers register with `buffered: true`, drops entries older than that cutoff when a type is re-observed — otherwise a `shutdown()` → `init()` cycle would replay (and double-report) buffered entries.

## Module boundaries

- `src/lib/` — pure, dependency-free helper functions (`checkValueWithinBounds`, `evaluateSamplingChance`, `filterObjectFields`); these are what's unit-tested under `tests/lib/`.
- `src/collectors/` — `PerformanceObserver`-facing glue, depends on `Engine` and `src/lib/`.
- `src/handlers/` — config-facing glue between `Argus` and collectors; builds report payloads via `prepareMetric`.
- `src/configs/` — default config values and the merge function.
- Public API surface is exactly what `src/index.ts` exports (`Argus` class, everything from `src/types.ts`, `markUserTimingStart`/`markUserTimingEnd`). Anything else in `src/` is internal.

## Conventions

- Private class fields use the `#` syntax (see `Engine`, `Argus`), not TypeScript `private`.
- ESLint enforces a 300-line max per file (`max-lines`) and `@typescript-eslint/consistent-type-imports` — use `import type` for type-only imports.
- `console` usage triggers an ESLint warning (`no-console`); avoid adding new logging beyond the existing `console.warn` in `Engine.observe`.
