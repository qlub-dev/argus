import { createApiTimingCollector } from "../collectors/api-timing";
import type { OnReportCb } from "../types";
import type { ApiEndpointTracker } from "../types";
import { prepareMetric } from "../utils";

export const handleApiTimingMetricCollection = (
  tracker: ApiEndpointTracker,
  onReport: OnReportCb,
  metadata?: Record<string, any>,
  samplingRate?: number,
  whitelistedFields?: string[]
) => {
  const regex = tracker.regex instanceof RegExp ? tracker.regex : new RegExp(tracker.regex);

  console.info("Argus: API timing metric collector added");
  const handler = (entry: PerformanceResourceTiming) => {
    const jsonEntry = entry.toJSON();
    const payload = prepareMetric(
      jsonEntry,
      {
        ...metadata,
        ...(tracker?.label ? { label: tracker?.label } : {}),
        type: "api-timing"
      },
      whitelistedFields
    );
    onReport(payload);
  };

  return createApiTimingCollector(regex, handler, tracker?.lowerBound, tracker?.upperBound, samplingRate);
};
