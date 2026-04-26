# Argus — Web performance metric collector

[![npm version](https://img.shields.io/npm/v/@qlub-foss/argus.svg)](https://www.npmjs.com/package/@qlub-foss/argus)

Argus, named after the many-eyed giant in Greek mythology, watches your client-side app and emits structured performance payloads you can forward to analytics or logging.

- **Web Vitals** — CLS, INP, LCP, FCP, and TTFB via [`web-vitals`](https://github.com/GoogleChrome/web-vitals)
- **API timing** — `PerformanceObserver` on resource entries, filtered by URL regex and optional duration bounds
- **User timing** — `performance.mark` / `measure` flows with optional duration bounds, using helpers that pair with named trackers

## Installation

The package is published under the npm organization **[qlub-foss](https://www.npmjs.com/org/qlub-foss)** (scope `@qlub-foss`). Install with your preferred package manager:

```bash
npm install @qlub-foss/argus
```

```bash
yarn add @qlub-foss/argus
```

```bash
pnpm add @qlub-foss/argus
```

```bash
bun add @qlub-foss/argus
```

Published on the [public npm registry](https://www.npmjs.com/package/@qlub-foss/argus). No custom `.npmrc` is required for installation.

## Configuration

Define an `ArgusConfig` (partial configs are merged with [defaults](src/configs/defaults.ts)):

- **`samplingRate`** — Global default (0–1) when a subsection does not override it.
- **`webVitals`** — `enabled`, `samplingRate`, optional `whitelistedFields` on the emitted payload.
- **`apiTiming`** — `enabled`, `samplingRate`, `trackers` (`regex`, optional `label`, `lowerBound`, `upperBound`, per-tracker `samplingRate`), optional `whitelistedFields`.
- **`userTiming`** — `enabled` (default off in defaults), `samplingRate`, `trackers` (`id` matching your mark/measure names, optional bounds and `samplingRate`), optional `whitelistedFields`.

Each reported object is normalized with `agent: "argus"`, timing fields, your `init` metadata, and an `event` / `argusMetricType` derived from the collector (`web-vital`, `api-timing`, `user-timing`).

### Example config

```ts
import type { ArgusConfig } from '@qlub-foss/argus';

export const argusConfig: ArgusConfig = {
  samplingRate: 1,
  webVitals: {
    enabled: true,
    samplingRate: 1,
  },
  apiTiming: {
    enabled: true,
    samplingRate: 1,
    trackers: [
      {
        regex: /\/gods/,
        label: 'fetch_greek_gods',
        lowerBound: 200,
        upperBound: 800,
        samplingRate: 0.7,
      },
      {
        regex: /\/philosophers/,
        label: 'fetch_philosophers',
        lowerBound: 100,
        upperBound: 900,
        samplingRate: 0.3,
      },
    ],
  },
  userTiming: {
    enabled: true,
    samplingRate: 1,
    trackers: [{ id: 'checkout-flow', lowerBound: 0, upperBound: 30_000 }],
  },
};
```

## Usage

1. Provide a report callback (send to your backend, analytics, or logger).
2. Call `Argus.getInstance(onReport, config)` once — the class is a **singleton**; the first call’s config is kept for the lifetime of the page.
3. Call `init(metadata?)` with optional key/value metadata merged into each payload.
4. On teardown (e.g. React `useEffect` cleanup), call `shutdown()` to disconnect observers.

User timing trackers expect you to bracket work with the exported helpers (or equivalent marks/measures). The `id` in config must match the prefix used in `markUserTimingStart` / `markUserTimingEnd`:

```ts
import { useEffect } from 'react';
import { Argus, markUserTimingStart, markUserTimingEnd } from '@qlub-foss/argus';
import { argusConfig } from './argusConfig';

const handleMetricReport = (metric: Record<string, any>) => {
  // forward metric
};

export function App() {
  useEffect(() => {
    const argus = Argus.getInstance(handleMetricReport, argusConfig);

    void argus.init({
      appVersion: '1.0.0',
    });

    return () => {
      argus.shutdown();
    };
  }, []);

  const onCheckout = () => {
    markUserTimingStart('checkout-flow');
    try {
      // ...
    } finally {
      markUserTimingEnd('checkout-flow');
    }
  };

  // ...
}
```

The same pattern works in other frameworks: instantiate once, `init` after mount, `shutdown` on unmount. The library targets browsers with `PerformanceObserver` and the Web Vitals APIs.

## Development

- Install [pnpm](https://pnpm.io/installation) (version pinned in `package.json` as `packageManager`).
- Install dependencies: `pnpm install`
- Build: `pnpm build`
- Test: `pnpm test`

Hooks and quality tooling: [Lefthook](https://github.com/evilmartians/lefthook), ESLint, Prettier, and Commitlint (conventional commits). See [Conventional Commits](https://www.conventionalcommits.org/) for message format.

## Releases

CI runs tests and build, then [semantic-release](https://semantic-release.gitbook.io/) on pushes to `main`, `alpha`, `beta`, and `gamma` (see `.github/workflows/semantic-release.yml`). Releases are published to **npm** and GitHub Releases; version bumps and changelog updates follow [Conventional Commits](https://www.conventionalcommits.org/).

## License

[MIT](LICENSE)
