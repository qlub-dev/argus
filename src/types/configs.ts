export type ArgusConfig = {
  samplingRate?: number;
  webVitals?: {
    enabled: boolean;
    samplingRate?: number;
  };
  apiTiming?: {
    enabled: boolean;
    samplingRate?: number;
    trackers?: {
      regex: RegExp;
      label?: string;
    }[];
  };
};
