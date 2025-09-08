import { PerformanceEntryType } from "../enums";
import { ObserverMgr } from "../lib/observer-mgr";

export function createApiTimingCollector(regex: RegExp, callback: (entry: PerformanceResourceTiming) => void) {
  const mgr = ObserverMgr.getInstance();

  console.trace("api timing collector created");

  const handler = (entry: PerformanceEntry) => {
    console.trace("atc h 1 ", entry);
    if (!(entry instanceof PerformanceResourceTiming)) return;
    console.trace("atc h 2 ", entry);
    if (entry.initiatorType !== "fetch" && entry.initiatorType !== "xmlhttprequest") {
      return;
    }
    console.trace("atc h 3 ", entry);

    if (!regex.test(entry.name)) {
      return;
    }
    console.trace("atc h 4 ", entry);

    callback(entry);
  };

  mgr.observe(PerformanceEntryType.RESOURCE, handler);

  return {
    disconnect: () => mgr.disconnect(PerformanceEntryType.RESOURCE)
  };
}
