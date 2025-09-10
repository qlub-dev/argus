export type OnReportCb = (payload: Record<string, any>) => void;

export type OnPerformanceEntryMeasure = (entry: PerformanceEntry) => void;

/**
 * A Tracker defines rules for collecting API timing metrics.
 */
export type Tracker = {
  /**
   * Regular expression used to match API endpoint URLs.
   */
  regex: RegExp;

  /**
   * Optional human-readable label for the tracker.
   * Useful for distinguishing between multiple trackers.
   */
  label?: string;

  /**
   * Optional lower bound (in milliseconds) for filtering response times.
   * Metrics below this threshold will be ignored.
   */
  lowerBound?: number;

  /**
   * Optional upper bound (in milliseconds) for filtering response times.
   * Metrics above this threshold will be ignored.
   */
  upperBound?: number;

  /**
   * Optional sampling rate (0–1).
   * For example, 0.5 means collect ~50% of matching events.
   * Defaults to the global or API-level sampling rate if not set.
   * @default 0.5
   */
  samplingRate?: number;
};

/**
 * Argus configuration options.
 * Controls how metrics are collected and sampled.
 */
export type ArgusConfig = {
  /**
   * Global sampling rate (0–1).
   * Applied unless overridden at the webVitals or apiTiming level.
   */
  samplingRate?: number;

  /**
   * Configuration for Web Vitals metric collection.
   */
  webVitals?: {
    /**
     * Enable or disable Web Vitals tracking.
     * Default: `true`.
     */
    enabled?: boolean;

    /**
     * Sampling rate for Web Vitals metrics (0–1).
     * Overrides the global sampling rate if provided.
     */
    samplingRate?: number;
  };

  /**
   * Configuration for API timing metric collection.
   */
  apiTiming?: {
    /**
     * Enable or disable API timing tracking.
     * Default: `true`.
     */
    enabled?: boolean;

    /**
     * Sampling rate for API timing metrics (0–1).
     * Overrides the global sampling rate if provided.
     */
    samplingRate?: number;

    /**
     * List of trackers to apply for matching and filtering API endpoints.
     */
    trackers?: Tracker[];
  };
};
