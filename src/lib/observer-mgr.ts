import type { PerformanceEntryType } from "../enums";

export class ObserverMgr {
  private static instance: ObserverMgr;
  private observers: Map<PerformanceEntryType, PerformanceObserver>;
  private handlers: Map<PerformanceEntryType, ((entry: PerformanceEntry) => void)[]>;

  private constructor() {
    this.observers = new Map();
    this.handlers = new Map();
  }

  static getInstance() {
    if (!ObserverMgr.instance) {
      ObserverMgr.instance = new ObserverMgr();
    }

    return ObserverMgr.instance;
  }

  observe(type: PerformanceEntryType, handler: (entry: PerformanceEntry) => void) {
    if (!PerformanceObserver.supportedEntryTypes.includes(type)) {
      console.warn(`Entry of type "${type}" is not supported in this browser`);
      return;
    }

    if (!this.handlers.has(type)) this.handlers.set(type, []);
    this.handlers.get(type)!.push(handler);

    if (!this.observers.has(type)) {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          this.handlers.get(type)?.forEach((h) => h(entry));
        }
      });

      observer.observe({ type, buffered: true });
      this.observers.set(type, observer);
    }
  }

  getObserver(type: PerformanceEntryType) {
    return this.observers.get(type);
  }

  disconnect(type?: PerformanceEntryType) {
    if (type) {
      this.observers.get(type)?.disconnect();
      this.observers.delete(type);
      this.handlers.delete(type);
    } else {
      this.observers.forEach((obs) => obs.disconnect());
      this.observers.clear();
      this.handlers.clear();
    }
  }
}
