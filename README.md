# Argus - Web Performance Metric Collector

Argus, named after a many-eyed giant in Greek mythology renowned for his unyielding vigilance, keeps a constant watch over your application, collecting key metrics related to web performance.

[This](https://paybyclub.atlassian.net/wiki/spaces/CA/pages/1522401289/Argus+-+Web+Performance+Metric+Collector) proposal outlines the full vision for this library. At present, only a portion has been implemented—covering Web Vitals and API call timings. The remaining features are planned and will be added in future releases.

## Installation

Install **Argus** with your preferred package manager.

```bash
npm install @qlub-dev/argus
```

```bash
yarn add @qlub-dev/argus
```

```bash
pnpm add @qlub-dev/argus
```

```bash
bun add @qlub-dev/argus
```
You might need to add an .npmrc inclduing a token with read access from @qlub-dev registry.

## Usage

1. Add a config file at the root following this format.

```ts

import type { ArgusConfig } from '@qlub-dev/argus';

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
                regex: new RegExp('/gods'),
                label: 'fetch_greek_gods',
                lowerBound: 200,
                upperBound: 800,
                samplingRate: 0.7
            },
            {
                regex: new RegExp('/philosophers'),
                label: 'fetch_philosophers',
                lowerBound: 100,
                upperBound: 900,
                samplingRate: 0.3
            },
        ],
    },
};

```

2. Add this to the root of your application following the given format. This example is for Next.js pages router. Add this code in _app.tsx file.

```ts

    // add a suitable metric handler
    const handleMetricReport = (metric: Record<string,any>) => console.log(metric)

    const argusInstance = Argus.getInstance(handleMetricReport, argusConfig);

    useEffect(() => {
        argusInstance.init({
            additionalData,
        });

        return argusInstance.shutdown;
    }, [additionalData]);


```

This package is written in pure JavaScript, making it compatible with any project that supports JS—including frameworks like React and Next.js. While we haven’t yet documented specific integration guides for all supported environments, we welcome and encourage contributions via pull requests.

## Development Setup

- Install [pnpm](https://pnpm.io/installation).

- Run the following command to install dependencies.

```bash
pnpm install
```

- Implement your changes

- Add tests if needed

- Run tests using following command to verify your changes don't break any existing behaviour
```bash
pnpm test
```

## Commit messages

- We follow conventional commits during our development workflow as a good practice. More information can be found at their official [documentation](https://www.conventionalcommits.org/en/v1.0.0-beta.4/#examples)

## Additional tools

- This project is bootstrapped with [Lefthook](https://evilmartians.com/opensource/lefthook), [Eslint](https://eslint.org/) and [Prettier](https://prettier.io/). Please make good use of them.
