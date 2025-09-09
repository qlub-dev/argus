import { createApiTimingCollector } from "../collectors/api-timing";
import type { OnReportCb } from "../types";
import type { Tracker } from "../types/configs";
import { prepareMetric } from "../utils";

export const handleApiTimingMetricCollection = (
  tracker: Tracker,
  onReport: OnReportCb,
  metadata?: Record<string, any>,
  samplingRate?: number
) => {
  const regex = tracker.regex instanceof RegExp ? tracker.regex : new RegExp(tracker.regex);

  const handler = (entry: PerformanceResourceTiming) => {
    const jsonEntry = entry.toJSON();
    const payload = prepareMetric(jsonEntry, {
      ...metadata,
      ...(tracker?.label ? { label: tracker?.label } : {})
    });
    onReport(payload);
  };

  return createApiTimingCollector(regex, handler, tracker?.lowerBound, tracker?.upperBound, samplingRate);
};
