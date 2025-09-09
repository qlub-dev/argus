import { PerformanceEntryType } from "../enums";
import { ObserverMgr } from "../lib/observer-mgr";

export function createApiTimingCollector(regex: RegExp, callback: (entry: PerformanceResourceTiming) => void) {
  const mgr = ObserverMgr.getInstance();

  const handler = (entry: PerformanceEntry) => {
    if (!(entry instanceof PerformanceResourceTiming)) return;
  
    if (entry.initiatorType !== "fetch" && entry.initiatorType !== "xmlhttprequest") {
      return;
    }

    if (!regex.test(entry.name)) {
      return;
    }

    callback(entry);
  };

  mgr.observe(PerformanceEntryType.RESOURCE, handler);

  return {
    disconnect: () => mgr.disconnect(PerformanceEntryType.RESOURCE)
  };
}
