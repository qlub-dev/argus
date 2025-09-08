import { onCLS, onFCP, onINP, onLCP, onTTFB } from "web-vitals";
import type { Metric } from "web-vitals";
import type { OnReportCb } from "../types";
import { prepareMetric } from "../utils";

const METRIC_HANDLERS = [onCLS, onINP, onLCP, onFCP, onTTFB];

const generateReportHandler = (onReportCb: OnReportCb, metadata?: Record<string, any>) => (metric: Metric) => {
  const metricPayload = prepareMetric(metric, metadata);
  console.log("Argus log: ", metric);
  onReportCb(metricPayload);
};

export const reportWebVitals = (onReport: OnReportCb, metadata?: Record<string, any>) => {
  const reportHandler = generateReportHandler(onReport, metadata);
  METRIC_HANDLERS.forEach((register) => register(reportHandler));
};
