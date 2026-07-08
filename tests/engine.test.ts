import { Engine } from "../src/engine";
import { PerformanceEntryType } from "../src/enums";

const observerCallbacks: PerformanceObserverCallback[] = [];

class MockPerformanceObserver {
  static supportedEntryTypes = ["resource", "measure"];

  constructor(callback: PerformanceObserverCallback) {
    observerCallbacks.push(callback);
  }

  observe() {}

  disconnect() {}
}

(globalThis as any).PerformanceObserver = MockPerformanceObserver;

const deliver = (callbackIndex: number, entries: Partial<PerformanceEntry>[]) => {
  observerCallbacks[callbackIndex](
    { getEntries: () => entries } as PerformanceObserverEntryList,
    undefined as unknown as PerformanceObserver
  );
};

describe("Engine", () => {
  it("does not replay buffered entries delivered before a disconnect", () => {
    const engine = Engine.getInstance();

    const firstHandler = jest.fn();
    engine.observe(PerformanceEntryType.RESOURCE, firstHandler);

    const oldEntry = { startTime: 100 };
    deliver(0, [oldEntry]);
    expect(firstHandler).toHaveBeenCalledWith(oldEntry);

    jest.spyOn(performance, "now").mockReturnValue(500);
    engine.disconnect(PerformanceEntryType.RESOURCE);

    const secondHandler = jest.fn();
    engine.observe(PerformanceEntryType.RESOURCE, secondHandler);

    const newEntry = { startTime: 600 };
    deliver(1, [oldEntry, newEntry]);

    expect(secondHandler).toHaveBeenCalledTimes(1);
    expect(secondHandler).toHaveBeenCalledWith(newEntry);
  });
});
