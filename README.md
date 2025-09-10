# Argus - Web Performance Metric Collector

Argus, named after a many-eyed giant in Greek mythology renowned for his unyielding vigilance, keeps a constant watch over your application, collecting key metrics related to web performance.

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
