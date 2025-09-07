import { onCLS, onINP, onLCP } from "web-vitals";
import type { Metric } from "web-vitals";
import type { TransporterCallback } from "./types";

console.log("Argus Initiated");

const prepareMetric = (metric: Record<string, any>) => {
  return {
    agent: "argus",
    event: "performance_metric",
    preparedAt: new Date().getTime(),
    ...metric
  };
};

const generateTransporter = (transporterCallback: TransporterCallback) => (metric: Metric) => {
  const metricPayload = prepareMetric(metric);

  console.log("Argus log: ", metric);

  transporterCallback(metricPayload);
};

export const reportWebVitals = (transporter: TransporterCallback) => {
  const transportMetric = generateTransporter(transporter);

  onCLS(transportMetric);
  onINP(transportMetric);
  onLCP(transportMetric);
};
