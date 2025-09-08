import { createApiTimingCollector } from "./collectors/api-timing";
import { reportWebVitals } from "./collectors/web-vitals";
import { loadConfigs } from "./configs";
import type { OnReportCb } from "./types";
import type { ArgusConfig } from "./types/configs";
import { prepareMetric } from "./utils";

export class Argus {
  #config!: ArgusConfig;
  #apiCollectors: { disconnect: () => void }[] = [];
  #onReport: OnReportCb;

  constructor(onReport: OnReportCb) {
    this.#onReport = onReport;
  }

  async init(metadata?: Record<string, any>) {
    this.#config = await loadConfigs();

    if (this.#config.webVitals?.enabled) {
      reportWebVitals(this.#onReport, metadata);
    }

    if (this.#config.apiTiming?.enabled && Array.isArray(this.#config.apiTiming.trackers)) {
      this.#config.apiTiming.trackers.forEach((tracker: { regex: RegExp }) => {
        const regex = new RegExp(tracker.regex);
        const collector = createApiTimingCollector(regex, (entry) => {
          const payload = prepareMetric(entry, metadata);
          this.#onReport(payload);
        });
        this.#apiCollectors.push(collector);
      });
    }
  }

  shutdown() {
    this.#apiCollectors.forEach((c) => c.disconnect());
    this.#apiCollectors = [];
  }
}
