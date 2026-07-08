import { onCLS, onFCP, onINP, onLCP, onTTFB } from "web-vitals";
import type { CLSMetric, Metric } from "web-vitals";
import { evaluateSamplingChance } from "../lib/evaluate-sampling";
import type { MetadataResolver, OnReportCb } from "../types";
import { prepareMetric } from "../utils";

export const METRIC_HANDLERS = [onCLS, onINP, onLCP, onFCP, onTTFB];

export type WebVitalsCollector = {
  disconnect: () => void;
  reconnect: () => void;
};

/**
 * Extracts the timestamp at which a web-vital metric was actually measured, so its
 * report can be attributed to the page active at that moment rather than at flush
 * time. CLS/INP in particular report once, late (typically on tab hide), covering
 * the whole page view up to that point.
 */
const getMeasurementTime = (metric: Metric): number | undefined => {
  const { entries } = metric;
  if (!entries || entries.length === 0) return undefined;

  if (metric.name === "CLS") {
    // Entries are the layout shifts contributing to the winning session window;
    // the largest shift dominates the score, matching how web-vitals/attribution
    // itself derives `largestShiftTime`.
    const shifts = (metric as CLSMetric).entries;
    return shifts.reduce((largest, shift) => (shift.value > largest.value ? shift : largest)).startTime;
  }

  // INP: entries[0] is the interaction itself (any additional tied entries share
  // the same startTime). LCP: web-vitals reassigns `entries = [entry]` on every
  // update rather than accumulating, so it is always a single entry. FCP: the
  // paint entry's real timestamp. TTFB: the navigation entry's startTime, which
  // is always exactly 0 by spec (the timeline origin) — this correctly resolves
  // to the earliest metadata snapshot (the landing page).
  return entries[0].startTime;
};

const generateReportHandler =
  (onReportCb: OnReportCb, resolveMetadata: MetadataResolver, samplingRate?: number, whitelistedFields?: string[]) =>
  (metric: Metric) => {
    if (!evaluateSamplingChance(samplingRate ?? 1)) return;
    const metricPayload = prepareMetric(
      metric,
      { ...resolveMetadata(getMeasurementTime(metric)), label: metric.name, type: "web-vital" },
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
  resolveMetadata: MetadataResolver = () => ({}),
  samplingRate?: number,
  whitelistedFields?: string[],
  attribution?: boolean
): WebVitalsCollector => {
  // The web-vitals package has no unsubscribe API, so disconnect() gates reporting
  // off instead of tearing the handlers down; reconnect() resumes without
  // re-registering (re-registering would immediately re-report already-final metrics).
  let enabled = true;
  const reportHandler = generateReportHandler(onReport, resolveMetadata, samplingRate, whitelistedFields);
  const gatedHandler = (metric: Metric) => {
    if (!enabled) return;
    reportHandler(metric);
  };

  if (attribution) {
    registerAttributionHandlers(gatedHandler);
  } else {
    METRIC_HANDLERS.forEach((register) => register(gatedHandler));
  }

  return {
    disconnect: () => {
      enabled = false;
    },
    reconnect: () => {
      enabled = true;
    }
  };
};
