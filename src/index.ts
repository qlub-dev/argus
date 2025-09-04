import { onCLS, onINP, onLCP } from "web-vitals";
import type { Metric } from "web-vitals";

console.log("Argus Initiated");

const sendToAnalytics = (metric: Metric) => {
  const body = JSON.stringify({
    agent: "Argus",
    ...metric
  });

  console.log("Argus log: ", metric);

  // Use `navigator.sendBeacon()` to send the data, which supports
  // sending while the page is unloading.
  navigator.sendBeacon("/analytics", body);
};

export const reportWebVitals = () => {
  onCLS(sendToAnalytics);
  onINP(sendToAnalytics);
  onLCP(sendToAnalytics);
};
