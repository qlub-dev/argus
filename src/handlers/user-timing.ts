import { createUserTimingCollector } from "../collectors/user-timing";
import type { OnReportCb } from "../types";
import type { Tracker } from "../types";
import { prepareMetric } from "../utils";

export const handleUserTimingMetricCollection = (
  tracker: Tracker,
  onReport: OnReportCb,
  metadata?: Record<string, any>,
  samplingRate?: number
) => {
  const regex = tracker.regex instanceof RegExp ? tracker.regex : new RegExp(tracker.regex);

  const handler = (entry: PerformanceEntry) => {
    const jsonEntry = entry.toJSON();
    const payload = prepareMetric(jsonEntry, {
      ...metadata,
      ...(tracker?.label ? { label: tracker?.label } : {})
    });
    onReport(payload);
  };

  return createUserTimingCollector(regex, handler, tracker?.lowerBound, tracker?.upperBound, samplingRate);
};
