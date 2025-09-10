import { onCLS, onFCP, onINP, onLCP, onTTFB } from "web-vitals";
import type { Metric } from "web-vitals";
import { evaluateSamplingChance } from "../lib/evaluate-sampling";
import type { OnReportCb } from "../types";
import { prepareMetric } from "../utils";

export const METRIC_HANDLERS = [onCLS, onINP, onLCP, onFCP, onTTFB];

const generateReportHandler =
  (onReportCb: OnReportCb, metadata?: Record<string, any>, samplingRate?: number) => (metric: Metric) => {
    if (!evaluateSamplingChance(samplingRate ?? 1)) return;
    const metricPayload = prepareMetric(metric, metadata);
    onReportCb(metricPayload);
  };

export const reportWebVitals = (onReport: OnReportCb, metadata?: Record<string, any>, samplingRate?: number) => {
  const reportHandler = generateReportHandler(onReport, metadata, samplingRate);
  METRIC_HANDLERS.forEach((register) => register(reportHandler));
};
