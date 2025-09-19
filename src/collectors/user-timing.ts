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
    console.log("argus user timing entry 1 ", entry);
    if (!(entry instanceof PerformanceMeasure)) return;
    console.log("argus user timing entry 2 ");
    if (entry.name !== `${id}-duration`) return;
    console.log("argus user timing entry 3 ");
    if (!checkValueWithinBounds(entry.duration, lowerBound, upperBound)) return;
    console.log("argus user timing entry 4 ");
    if (evaluateSamplingChance(samplingRate ?? 1)) return;
    console.log("argus user timing entry 5 ");
    callback(entry);
  };

  engine.observe(PerformanceEntryType.MEASURE, handler);

  return {
    disconnect: () => {
      engine.disconnect(PerformanceEntryType.MEASURE);
    }
  };
}
