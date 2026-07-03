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

**Singletons drive everything.** `Engine` (`src/engine.ts`) is a singleton that owns one `PerformanceObserver` per `PerformanceEntryType` (see `src/enums.ts`) and fans out entries to all registered handlers for that type. `Argus` (`src/index.ts`) is a separate singleton — `Argus.getInstance(onReport, config)` — that wires up collectors on top of `Engine` based on config. The first call to `Argus.getInstance()` locks in both the report callback and the merged config for the page's lifetime; subsequent calls are no-ops that return the existing instance.

**Collector → Handler → Engine pipeline**, for both API timing and user timing:
1. `src/handlers/*.ts` — takes a tracker config + `onReport`, builds the entry-to-payload mapping (via `prepareMetric` in `src/utils.ts`), and calls into a collector.
2. `src/collectors/*.ts` — creates a filter/handler function (checks entry type, regex/id match, `checkValueWithinBounds`, `evaluateSamplingChance`) and registers it with `Engine.observe(type, handler)`. Returns a `disconnect()` closure.
3. `Engine` owns the actual `PerformanceObserver` instances and dispatches raw entries to every registered handler for that entry type.

Web Vitals (`src/collectors/web-vitals.ts`) bypasses `Engine` entirely — it wires the `web-vitals` package's `onCLS`/`onINP`/`onLCP`/`onFCP`/`onTTFB` directly to a report handler, since that package manages its own observers.

**Config merging**: `src/configs/defaults.ts` defines `defaultConfigs`; `src/configs/index.ts` (`loadConfigs`) does a shallow per-section merge (top-level, `webVitals`, `apiTiming`, `userTiming`) of user config over defaults — note `apiTiming.trackers` is replaced wholesale by the user's array if provided, not merged per-tracker. Sampling rate resolution order at call sites is always tracker-level → section-level → global `samplingRate`.

**Payload shape**: `prepareMetric` (`src/utils.ts`) is the single place that assembles the final reported object — it stamps `agent: "argus"`, a derived `event` string (`perf-<type>-<label>`), `preparedAt`, `argusMetricType`, spreads the raw entry, then spreads metadata (metadata wins on key collisions). `filterObjectFields` (`src/lib/filter-object-fields.ts`) then applies `whitelistedFields` if configured, otherwise passes everything through.

**User timing contract**: `markUserTimingStart(id)` / `markUserTimingEnd(id)` (exported from `src/utils.ts`, re-exported from `src/index.ts`) create `performance.mark`/`measure` calls named `${id}-start`/`${id}-end`/`${id}-duration`. The `id` in a `UserTimingTracker` config must exactly match the id used at the call sites — the collector filters on the literal `${id}-duration` measure name.

**Disconnect semantics**: `Engine.disconnect(type)` when called with a type tears down and removes *all* handlers for that entry type, not just the caller's — collectors sharing an entry type (e.g. multiple API trackers all use `PerformanceEntryType.RESOURCE`) will all be disconnected together when any one of their `disconnect()` closures is called. Keep this in mind when adding new collectors on a shared entry type.

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
