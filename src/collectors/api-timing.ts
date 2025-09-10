import { Engine } from "../engine";
import { PerformanceEntryType } from "../enums";
import { checkValueWithinBounds } from "../lib/check-value-bounds";
import { evaluateSamplingChance } from "../lib/evaluate-sampling";

export function createApiTimingCollector(
  regex: RegExp,
  callback: (entry: PerformanceResourceTiming) => void,
  lowerBound?: number,
  upperBound?: number,
  samplingRate?: number
) {
  const engine = Engine.getInstance();

  const handler = (entry: PerformanceEntry) => {
    if (!(entry instanceof PerformanceResourceTiming)) return;
    if (entry.initiatorType !== "fetch" && entry.initiatorType !== "xmlhttprequest") return;
    if (!regex.test(entry.name)) return;
    if (!checkValueWithinBounds(entry.duration, lowerBound, upperBound)) return;
    if (!evaluateSamplingChance(samplingRate ?? 1)) return;

    callback(entry);
  };

  engine.observe(PerformanceEntryType.RESOURCE, handler);

  return {
    disconnect: () => engine.disconnect(PerformanceEntryType.RESOURCE)
  };
}
