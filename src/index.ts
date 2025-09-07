import { onCLS, onINP, onLCP } from "web-vitals";
import type { Metric } from "web-vitals";
import type { TransportCallback } from "./types";

console.log("Argus Initiated");

const prepareMetric = (metric: Record<string, any>) => {
  return {
    agent: "Argus",
    preparation_time: new Date().getTime(),
    ...metric
  };
};

const generateTransporter = (transporterCallback: TransportCallback) => (metric: Metric) => {
  const metricPayload = prepareMetric(metric);

  console.log("Argus log: ", metric);

  transporterCallback(metricPayload);
};

export const reportWebVitals = (transporter: TransportCallback) => {
  const transportMetric = generateTransporter(transporter);

  onCLS(transportMetric);
  onINP(transportMetric);
  onLCP(transportMetric);
};
