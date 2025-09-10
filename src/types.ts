export type OnReportCb = (payload: Record<string, any>) => void;

export type OnPerformanceEntryMeasure = (entry: PerformanceEntry) => void;

export type Tracker = {
  regex: RegExp;
  label?: string;
  lowerBound?: number;
  upperBound?: number;
  samplingRate?: number;
};

export type ArgusConfig = {
  samplingRate?: number;
  webVitals?: {
    enabled?: boolean;
    samplingRate?: number;
  };
  apiTiming?: {
    enabled?: boolean;
    samplingRate?: number;
    trackers?: Tracker[];
  };
};
