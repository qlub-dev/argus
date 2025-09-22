import { createUserTimingCollector } from "../collectors/user-timing";
import type { OnReportCb } from "../types";
import type { UserTimingTracker } from "../types";
import { prepareMetric } from "../utils";

export const handleUserTimingMetricCollection = (
  tracker: UserTimingTracker,
  onReport: OnReportCb,
  metadata?: Record<string, any>,
  samplingRate?: number,
  whitelistedFields?: string[]
) => {
  const handler = (entry: PerformanceEntry) => {
    const jsonEntry = entry.toJSON();
    const payload = prepareMetric(
      jsonEntry,
      {
        ...metadata,
        label: tracker.id,
        type: "user_timing"
      },
      whitelistedFields
    );
    onReport(payload);
  };

  return createUserTimingCollector(tracker.id, handler, tracker?.lowerBound, tracker?.upperBound, samplingRate);
};
