import { onCLS, onFCP, onINP, onLCP, onTTFB } from "web-vitals";
import type { Metric } from "web-vitals";
import { evaluateSamplingChance } from "../lib/evaluate-sampling";
import type { OnReportCb } from "../types";
import { prepareMetric } from "../utils";

export const METRIC_HANDLERS = [onCLS, onINP, onLCP, onFCP, onTTFB];

const generateReportHandler =
  (onReportCb: OnReportCb, metadata?: Record<string, any>, samplingRate?: number, whitelistedFields?: string[]) =>
  (metric: Metric) => {
    if (!evaluateSamplingChance(samplingRate ?? 1)) return;
    const metricPayload = prepareMetric(
      metric,
      { ...metadata, label: metric.name, type: "web_vital" },
      whitelistedFields
    );
    onReportCb(metricPayload);
  };

export const reportWebVitals = (
  onReport: OnReportCb,
  metadata?: Record<string, any>,
  samplingRate?: number,
  whitelistedFields?: string[]
) => {
  const reportHandler = generateReportHandler(onReport, metadata, samplingRate, whitelistedFields);
  METRIC_HANDLERS.forEach((register) => register(reportHandler));
};
