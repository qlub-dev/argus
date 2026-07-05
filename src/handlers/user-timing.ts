import { createUserTimingCollector } from "../collectors/user-timing";
import type { MetadataGetter, OnReportCb, UserTimingTracker } from "../types";
import { prepareMetric } from "../utils";

export const handleUserTimingMetricCollection = (
  tracker: UserTimingTracker,
  onReport: OnReportCb,
  getMetadata: MetadataGetter,
  samplingRate?: number,
  whitelistedFields?: string[]
) => {
  const handler = (entry: PerformanceEntry) => {
    const jsonEntry = entry.toJSON();
    const payload = prepareMetric(
      jsonEntry,
      {
        ...getMetadata(),
        label: tracker.id,
        type: "user-timing"
      },
      whitelistedFields
    );
    onReport(payload);
  };

  return createUserTimingCollector(tracker.id, handler, tracker?.lowerBound, tracker?.upperBound, samplingRate);
};
