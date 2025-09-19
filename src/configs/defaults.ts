import type { ArgusConfig } from "../types";

export const defaultConfigs: ArgusConfig = {
  samplingRate: 1,
  webVitals: {
    enabled: true,
    samplingRate: 1
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
    enabled: false,
    samplingRate: 1
  }
};
