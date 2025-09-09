import { PerformanceEntryType } from "../enums";
import { checkValueWithinBounds } from "../lib/check-value-bounds";
import { ObserverMgr } from "../lib/observer-mgr";

export function createApiTimingCollector(
  regex: RegExp,
  callback: (entry: PerformanceResourceTiming) => void,
  lowerBound?: number,
  upperBound?: number
) {
  const mgr = ObserverMgr.getInstance();

  const handler = (entry: PerformanceEntry) => {
    if (!(entry instanceof PerformanceResourceTiming)) return;
    if (entry.initiatorType !== "fetch" && entry.initiatorType !== "xmlhttprequest") return;
    if (!regex.test(entry.name)) return;
    if (checkValueWithinBounds(entry.duration, lowerBound, upperBound)) return;

    callback(entry);
  };

  mgr.observe(PerformanceEntryType.RESOURCE, handler);

  return {
    disconnect: () => mgr.disconnect(PerformanceEntryType.RESOURCE)
  };
}
