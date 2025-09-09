import { reportWebVitals } from "./collectors/web-vitals";
import { loadConfigs } from "./configs";
import { handleApiTimingMetricCollection } from "./handlers/api-timing";
import type { OnReportCb } from "./types";
import type { ArgusConfig } from "./types/configs";

export class Argus {
  static #instance: Argus | null = null;

  #config: ArgusConfig;
  #apiCollectors: { disconnect: () => void }[] = [];
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
    if (this.#config.webVitals?.enabled) reportWebVitals(this.#onReport, metadata);

    if (this.#config.apiTiming?.enabled && Array.isArray(this.#config.apiTiming.trackers)) {
      this.#config.apiTiming.trackers.forEach((tracker) => {
        this.#apiCollectors.push(
          handleApiTimingMetricCollection(
            tracker,
            this.#onReport,
            metadata,
            tracker?.samplingRate ?? this.#config?.samplingRate
          )
        );
      });
    }
  }

  shutdown() {
    this.#apiCollectors.forEach((c) => c.disconnect());
    this.#apiCollectors = [];
  }
}

export * from "./types";
