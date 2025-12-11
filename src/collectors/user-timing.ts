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

  console.info("Argus: User timimg collector initiation");
  const handler = (entry: PerformanceEntry) => {
    console.info("Argus: user timing handler called a");
    if (!(entry instanceof PerformanceMeasure)) return;
    if (entry.name !== `${id}-duration`) return;
    if (!checkValueWithinBounds(entry.duration, lowerBound, upperBound)) return;
    if (!evaluateSamplingChance(samplingRate ?? 1)) return;
    console.info("Argus: user timing handler called b");
    callback(entry);
  };

  engine.observe(PerformanceEntryType.MEASURE, handler);

  return {
    disconnect: () => {
      console.info("Argus: user timing handler disconnected");
      engine.disconnect(PerformanceEntryType.MEASURE);
    }
  };
}
