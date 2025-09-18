import { Engine } from "../engine";
import { PerformanceEntryType } from "../enums";
import { checkValueWithinBounds } from "../lib/check-value-bounds";
import { evaluateSamplingChance } from "../lib/evaluate-sampling";

export function createUserTimingCollector(
  regex: RegExp,
  callback: (entry: PerformanceResourceTiming) => void,
  lowerBound?: number,
  upperBound?: number,
  samplingRate?: number
) {
  const engine = Engine.getInstance();

  const handler = (entry: PerformanceEntry) => {
    if (!(entry instanceof PerformanceResourceTiming)) return;
    if (!regex.test(entry.name)) return;
    if (
      !(
        entry.entryType === PerformanceEntryType.MEASURE &&
        checkValueWithinBounds(entry.duration, lowerBound, upperBound)
      )
    )
      return;
    if (!(entry.entryType === PerformanceEntryType.MEASURE && evaluateSamplingChance(samplingRate ?? 1))) return;

    callback(entry);
  };

  engine.observe(PerformanceEntryType.MEASURE, handler);
  engine.observe(PerformanceEntryType.MARK, handler);

  return {
    disconnect: () => engine.disconnect(PerformanceEntryType.RESOURCE)
  };
}
