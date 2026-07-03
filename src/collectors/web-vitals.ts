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
      { ...metadata, label: metric.name, type: "web-vital" },
      whitelistedFields
    );
    onReportCb(metricPayload);
  };

const registerAttributionHandlers = (reportHandler: (metric: Metric) => void) => {
  import("web-vitals/attribution")
    .then(({ onCLS: onCLSAttr, onFCP: onFCPAttr, onINP: onINPAttr, onLCP: onLCPAttr, onTTFB: onTTFBAttr }) => {
      [onCLSAttr, onINPAttr, onLCPAttr, onFCPAttr, onTTFBAttr].forEach((register) => register(reportHandler));
    })
    .catch((err) => {
      console.warn(`Argus: failed to load web-vitals attribution build, falling back to standard metrics. ${err}`);
      METRIC_HANDLERS.forEach((register) => register(reportHandler));
    });
};

export const reportWebVitals = (
  onReport: OnReportCb,
  metadata?: Record<string, any>,
  samplingRate?: number,
  whitelistedFields?: string[],
  attribution?: boolean
) => {
  const reportHandler = generateReportHandler(onReport, metadata, samplingRate, whitelistedFields);

  if (attribution) {
    registerAttributionHandlers(reportHandler);
    return;
  }

  METRIC_HANDLERS.forEach((register) => register(reportHandler));
};
