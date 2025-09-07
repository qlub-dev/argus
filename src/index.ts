import { onCLS, onINP, onLCP } from "web-vitals";
import type { Metric } from "web-vitals";
import type { TransporterCallback } from "./types";

console.log("Argus Initiated");

const METRIC_HANDLERS = [onCLS, onINP, onLCP];

const prepareMetric = (metric: Record<string, any>, metadata?: Record<string, any>) => {
  return {
    agent: "argus",
    event: "performance_metric",
    preparedAt: new Date().getTime(),
    ...metric,
    ...(metadata ?? {})
  };
};

const generateTransporter =
  (transporterCallback: TransporterCallback, metadata?: Record<string, any>) => (metric: Metric) => {
    const metricPayload = prepareMetric(metric, metadata);
    console.log("Argus log: ", metric);
    transporterCallback(metricPayload);
  };

export const reportWebVitals = (transporter: TransporterCallback, metadata?: Record<string, any>) => {
  const transportMetric = generateTransporter(transporter, metadata);
  METRIC_HANDLERS.forEach((register) => register(transportMetric));
};
