import { createApiTimingCollector } from "./collectors/api-timing";
import { reportWebVitals } from "./collectors/web-vitals";
import { loadConfigs } from "./configs";
import type { OnReportCb } from "./types";
import type { ArgusConfig } from "./types/configs";
import { prepareMetric } from "./utils";

export class Argus {
  static #instance: Argus | null = null;

  #config!: ArgusConfig;
  #apiCollectors: { disconnect: () => void }[] = [];
  #onReport: OnReportCb;

  private constructor(onReport: OnReportCb) {
    this.#onReport = onReport;
  }

  static getInstance(onReport?: OnReportCb) {
    if (!Argus.#instance) {
      if (!onReport) {
        throw new Error("Argus is not initialized yet. You must provide an onReport callback the first time.");
      }
      Argus.#instance = new Argus(onReport);
    }
    return Argus.#instance;
  }

  async init(metadata?: Record<string, any>) {
    this.#config = loadConfigs();

    if (this.#config.webVitals?.enabled) reportWebVitals(this.#onReport, metadata);

    if (this.#config.apiTiming?.enabled && Array.isArray(this.#config.apiTiming.trackers)) {
      this.#config.apiTiming.trackers.forEach((tracker) => {
        const regex = tracker.regex instanceof RegExp ? tracker.regex : new RegExp(tracker.regex);

        const handler = (entry: PerformanceResourceTiming) => {
          const jsonEntry = entry.toJSON();
          const payload = prepareMetric(jsonEntry, {
            ...metadata,
            ...(tracker?.label ? { label: tracker?.label } : {})
          });

          this.#onReport(payload);
          console.log("root api metrics entry", entry, " regex ", regex, " payload ", payload);
        };

        const collector = createApiTimingCollector(regex, handler, tracker?.lowerBound, tracker?.upperBound);

        this.#apiCollectors.push(collector);
      });
    }
  }

  shutdown() {
    this.#apiCollectors.forEach((c) => c.disconnect());
    this.#apiCollectors = [];
  }
}
