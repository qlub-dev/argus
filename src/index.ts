import { reportWebVitals } from "./collectors/web-vitals";
import { loadConfigs } from "./configs";
import { handleApiTimingMetricCollection } from "./handlers/api-timing";
import { handleUserTimingMetricCollection } from "./handlers/user-timing";
import type { ArgusConfig, OnReportCb } from "./types";

export class Argus {
  static #instance: Argus | null = null;

  #config: ArgusConfig;
  #apiCollectors: { disconnect: () => void }[] = [];
  #userTimingCollectors: { disconnect: () => void }[] = [];
  #onReport: OnReportCb;

  private constructor(onReport: OnReportCb, config: ArgusConfig) {
    this.#onReport = onReport;
    this.#config = config;
  }

  static getInstance(onReport: OnReportCb, config: ArgusConfig) {
    const _config = loadConfigs(config);
    if (!Argus.#instance) Argus.#instance = new Argus(onReport, _config);
    return Argus.#instance;
  }

  async init(metadata?: Record<string, any>) {
    console.info("Argus: Initiated");
    const _config = this.#config;

    if (this.#config.webVitals?.enabled) {
      const samplingRate = _config?.webVitals?.samplingRate ?? _config?.samplingRate;
      reportWebVitals(this.#onReport, metadata, samplingRate, _config.webVitals?.whitelistedFields);
    }

    if (this.#config.apiTiming?.enabled && Array.isArray(this.#config?.apiTiming.trackers)) {
      this.#config.apiTiming.trackers.forEach((tracker) => {
        const samplingRate = tracker?.samplingRate ?? _config?.apiTiming?.samplingRate ?? _config?.samplingRate;
        this.#apiCollectors.push(
          handleApiTimingMetricCollection(
            tracker,
            this.#onReport,
            metadata,
            samplingRate,
            _config?.apiTiming?.whitelistedFields
          )
        );
      });
    }

    if (this.#config.userTiming?.enabled && Array.isArray(this.#config?.userTiming.trackers)) {
      this.#config.userTiming.trackers.forEach((tracker) => {
        const samplingRate = tracker?.samplingRate ?? _config?.userTiming?.samplingRate ?? _config?.samplingRate;
        this.#userTimingCollectors.push(
          handleUserTimingMetricCollection(
            tracker,
            this.#onReport,
            metadata,
            samplingRate,
            _config?.userTiming?.whitelistedFields
          )
        );
      });
    }
  }

  shutdown() {
    console.info("Argus: Shutdown initiated");
    this.#apiCollectors.forEach((c) => c.disconnect());
    this.#apiCollectors = [];
    this.#userTimingCollectors.forEach((c) => c.disconnect());
    this.#userTimingCollectors = [];
  }
}

export * from "./types";
export { markUserTimingStart, markUserTimingEnd } from "./utils";
