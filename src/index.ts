import { reportWebVitals } from "./collectors/web-vitals";
import type { WebVitalsCollector } from "./collectors/web-vitals";
import { loadConfigs } from "./configs";
import { handleApiTimingMetricCollection } from "./handlers/api-timing";
import { handleUserTimingMetricCollection } from "./handlers/user-timing";
import isShallowEqual from "./lib/equality-check-shallow";
import type {
  ArgusConfig,
  MetadataGetter,
  MetadataResolver,
  MetadataSnapshot,
  OnReportCb,
  TrackerCollector,
  TrackerSection
} from "./types";

// Bounds the metadata history kept for resolving web-vital reports back to their
// measurement time. Under sustained high-frequency setMetadata() calls (well
// beyond ordinary route-change cadence), the oldest snapshots are evicted; a
// still-unflushed CLS/INP measured before all remaining snapshots then resolves
// to the oldest one kept, which can misattribute it forward to a later page.
// Rarer and self-correcting compared to the flush-time misattribution this
// history exists to fix, so it's accepted rather than engineered away.
const METADATA_HISTORY_LIMIT = 50;

export class Argus {
  static #instance: Argus | null = null;

  #config: ArgusConfig;
  #apiCollectors: TrackerCollector[] = [];
  #userTimingCollectors: TrackerCollector[] = [];
  #webVitalsCollector: WebVitalsCollector | null = null;
  #onReport: OnReportCb;
  #metadata: Record<string, any> = {};
  #metadataHistory: MetadataSnapshot[] = [];
  #getMetadata: MetadataGetter = () => this.#metadata;
  #resolveMetadata: MetadataResolver = (at) => this.#resolveMetadataAt(at);

  private constructor(onReport: OnReportCb, config: ArgusConfig) {
    this.#onReport = onReport;
    this.#config = config;
  }

  static getInstance(onReport: OnReportCb, config: ArgusConfig) {
    const _config = loadConfigs(config);
    if (!Argus.#instance) Argus.#instance = new Argus(onReport, _config);
    return Argus.#instance;
  }

  /** Resets the singleton. For unit tests only. */
  static resetForTests() {
    Argus.#instance?.shutdown();
    Argus.#instance = null;
  }

  /**
   * Merges the given fields into the metadata attached to every subsequent report.
   * Set a key to `undefined` to remove it. API/user-timing reports always read the
   * current (live) metadata. Web-vital reports are resolved against a history of
   * snapshots so each metric is attributed to the metadata that was current at the
   * moment it was *measured*, not when it eventually flushes — CLS/INP in
   * particular report once, late (typically on tab hide), covering the whole page
   * view up to that point. See `METADATA_HISTORY_LIMIT` for the eviction tradeoff.
   */
  setMetadata(metadata: Record<string, any>) {
    const merged: Record<string, any> = { ...this.#metadata, ...metadata };
    Object.keys(merged).forEach((key) => {
      if (merged[key] === undefined) delete merged[key];
    });
    this.#metadata = merged;

    const previous = this.#metadataHistory[this.#metadataHistory.length - 1];
    if (previous && isShallowEqual(previous.metadata, merged)) return;

    this.#metadataHistory.push({ at: performance.now(), metadata: merged });
    if (this.#metadataHistory.length > METADATA_HISTORY_LIMIT) this.#metadataHistory.shift();
  }

  #resolveMetadataAt(at?: number): Record<string, any> {
    if (at === undefined || this.#metadataHistory.length === 0) return this.#metadata;

    let resolved = this.#metadataHistory[0].metadata;
    for (const snapshot of this.#metadataHistory) {
      if (snapshot.at > at) break;
      resolved = snapshot.metadata;
    }
    return resolved;
  }

  async init(metadata?: Record<string, any>) {
    if (metadata) {
      this.setMetadata(metadata);
    }

    const _config = this.#config;

    if (_config.webVitals?.enabled) {
      if (this.#webVitalsCollector) {
        this.#webVitalsCollector.reconnect();
      } else {
        const samplingRate = _config?.webVitals?.samplingRate ?? _config?.samplingRate;
        this.#webVitalsCollector = reportWebVitals(
          this.#onReport,
          this.#resolveMetadata,
          samplingRate,
          _config.webVitals?.whitelistedFields,
          _config.webVitals?.attribution
        );
      }
    }

    this.#registerTrackers(_config.apiTiming, this.#apiCollectors, handleApiTimingMetricCollection);
    this.#registerTrackers(_config.userTiming, this.#userTimingCollectors, handleUserTimingMetricCollection);
  }

  #registerTrackers<T extends { samplingRate?: number }>(
    section: TrackerSection<T> | undefined,
    collectors: TrackerCollector[],
    handleCollection: (
      tracker: T,
      onReport: OnReportCb,
      getMetadata: MetadataGetter,
      samplingRate?: number,
      whitelistedFields?: string[]
    ) => TrackerCollector
  ) {
    if (!section?.enabled || collectors.length !== 0 || !Array.isArray(section.trackers)) return;

    section.trackers.forEach((tracker) => {
      const samplingRate = tracker?.samplingRate ?? section.samplingRate ?? this.#config?.samplingRate;
      collectors.push(
        handleCollection(tracker, this.#onReport, this.#getMetadata, samplingRate, section.whitelistedFields)
      );
    });
  }

  shutdown() {
    this.#webVitalsCollector?.disconnect();
    this.#apiCollectors.forEach((c) => c.disconnect());
    this.#apiCollectors = [];
    this.#userTimingCollectors.forEach((c) => c.disconnect());
    this.#userTimingCollectors = [];
  }
}

export * from "./types";
export { markUserTimingStart, markUserTimingEnd } from "./utils";
