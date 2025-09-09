import type { ArgusConfig } from "../types/configs";
import { defaultConfigs } from "./defaults";

export const loadConfigs = (configs: Partial<ArgusConfig>): ArgusConfig => {
  return {
    ...defaultConfigs,
    ...configs,
    webVitals: {
      ...defaultConfigs.webVitals,
      ...configs?.webVitals
    },
    apiTiming: {
      ...defaultConfigs.apiTiming,
      ...configs?.apiTiming,
      trackers: configs?.apiTiming?.trackers ?? defaultConfigs?.apiTiming?.trackers
    }
  };
};
