import { Engine } from "../engine";
import { PerformanceEntryType } from "../enums";
import { checkValueWithinBounds } from "../lib/check-value-bounds";
import { evaluateSamplingChance } from "../lib/evaluate-sampling";

export function createUserTimingCollector(
  id: string,
  callback: (entry: PerformanceEntry) => void,
  lowerBound?: number,
  upperBound?: number,
  samplingRate?: number
) {
  const engine = Engine.getInstance();

  const handler = (entry: PerformanceEntry) => {
    if (!(entry instanceof PerformanceMeasure)) return;
    if (entry.name !== `${id}-duration`) return;
    if (checkValueWithinBounds(entry.duration, lowerBound, upperBound)) return;
    if (evaluateSamplingChance(samplingRate ?? 1)) return;

    callback(entry);
  };

  engine.observe(PerformanceEntryType.MEASURE, handler);

  return {
    disconnect: () => {
      engine.disconnect(PerformanceEntryType.MEASURE);
    }
  };
}
