export type Tracker = {
  regex: RegExp;
  label?: string;
  threshold?: number;
};

export type ArgusConfig = {
  samplingRate?: number;
  webVitals?: {
    enabled: boolean;
    samplingRate?: number;
  };
  apiTiming?: {
    enabled: boolean;
    samplingRate?: number;
    trackers?: Tracker[];
  };
};
