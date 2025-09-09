import type { ArgusConfig } from "../types/configs";

export const defaultConfigs: ArgusConfig = {
  samplingRate: 0.5,
  webVitals: {
    enabled: true,
    samplingRate: 0.5
  },
  apiTiming: {
    enabled: true,
    samplingRate: 0.5,
    trackers: [
      {
        regex: new RegExp("/api"),
        label: "api-timing-metric",
        lowerBound: 1000,
      }
    ]
  }
};
