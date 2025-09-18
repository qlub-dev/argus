import type { ArgusConfig } from "../types";

export const defaultConfigs: ArgusConfig = {
  samplingRate: 0.5,
  webVitals: {
    enabled: true,
    samplingRate: 0.5
  },
  apiTiming: {
    enabled: true,
    trackers: [
      {
        regex: new RegExp("/api"),
        label: "api-timing-metric",
        lowerBound: 1000
      }
    ]
  },
  userTiming: {
    enabled: false
  }
};
