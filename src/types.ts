export type OnReportCb = (payload: Record<string, any>) => void;

export type OnPerformanceEntryMeasure = (entry: PerformanceEntry) => void;

/**
 * A Tracker defines rules for collecting API timing metrics.
 */
export type ApiEndpointTracker = {
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
   * @default 1
   */
  samplingRate?: number;
};

/**
 * A Tracker defines rules for collecting API timing metrics.
 */
export type UserTimingTracker = {
  /**
   * id of the user timing event
   */
  id: string;

  /**
   * Optional lower bound (in milliseconds) for filtering durations.
   * Metrics below this threshold will be ignored.
   */
  lowerBound?: number;

  /**
   * Optional upper bound (in milliseconds) for filtering durations.
   * Metrics above this threshold will be ignored.
   */
  upperBound?: number;

  /**
   * Optional sampling rate (0–1).
   * For example, 0.5 means collect ~50% of matching events.
   * Defaults to the global or API-level sampling rate if not set.
   * @default 1
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

    /**
     * If specified only these fields from the generated metric payload will be exported. If not specified all
     * fields from original payload will be exported
     */
    whitelistedFields?: string[];

    /**
     * When enabled, loads the `web-vitals` "attribution" build instead of the base build,
     * via a dynamic `import()` executed only when this is enabled. Attribution metrics
     * include an extra `attribution` field with diagnostic detail (contributing
     * elements/timings) useful for debugging regressions. Consumers who don't opt in
     * pay no extra bundle/runtime cost.
     * Default: `false`.
     */
    attribution?: boolean;
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
    trackers?: ApiEndpointTracker[];

    /**
     * If specified only these fields from the generated metric payload will be exported. If not specified all
     * fields from original payload will be exported
     */
    whitelistedFields?: string[];
  };

  /**
   * Configuration for User timing metric collection. Wraps around user timing browser API
   */
  userTiming?: {
    /**
     * Enable or disable API timing tracking.
     * Default: `false`.
     */
    enabled?: boolean;
    /**
     * Sampling rate for User timing metrics (0–1).
     * Overrides the global sampling rate if provided.
     */
    samplingRate?: number;
    /**
     * List of trackers to apply for matching and filtering metrics.
     */
    trackers?: UserTimingTracker[];
    /**
     * If specified only these fields from the generated metric payload will be exported. If not specified all
     * fields from original payload will be exported
     */
    whitelistedFields?: string[];
  };
};
