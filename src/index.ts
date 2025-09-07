import { onCLS, onINP, onLCP, onFCP, onTTFB } from "web-vitals";
import type { Metric } from "web-vitals";
import type { TransporterCallback } from "./types";

console.log("Argus Initiated");

const METRIC_HANDLERS = [onCLS, onINP, onLCP, onFCP, onTTFB];

const prepareMetric = (metric: Record<string, any>, metadata?: Record<string, any>) => {
  return {
    agent: "argus",
    event: "performance_metric",
    preparedAt: new Date().getTime(),
    ...metric,
    ...(metadata ?? {})
  };
};

const generateReportHandler =
  (transporterCallback: TransporterCallback, metadata?: Record<string, any>) => (metric: Metric) => {
    const metricPayload = prepareMetric(metric, metadata);
    console.log("Argus log: ", metric);
    transporterCallback(metricPayload);
  };

export const reportWebVitals = (onReport: TransporterCallback, metadata?: Record<string, any>) => {
  const reportHandler = generateReportHandler(onReport, metadata);
  METRIC_HANDLERS.forEach((register) => register(reportHandler));
};
