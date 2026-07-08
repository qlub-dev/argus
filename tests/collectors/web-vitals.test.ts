import { reportWebVitals } from "../../src/collectors/web-vitals";

const onCLS = jest.fn();
const onFCP = jest.fn();
const onINP = jest.fn();
const onLCP = jest.fn();
const onTTFB = jest.fn();

const onCLSAttr = jest.fn();
const onFCPAttr = jest.fn();
const onINPAttr = jest.fn();
const onLCPAttr = jest.fn();
const onTTFBAttr = jest.fn();

jest.mock("web-vitals", () => ({
  onCLS: (...args: unknown[]) => onCLS(...args),
  onFCP: (...args: unknown[]) => onFCP(...args),
  onINP: (...args: unknown[]) => onINP(...args),
  onLCP: (...args: unknown[]) => onLCP(...args),
  onTTFB: (...args: unknown[]) => onTTFB(...args)
}));

jest.mock(
  "web-vitals/attribution",
  () => ({
    onCLS: (...args: unknown[]) => onCLSAttr(...args),
    onFCP: (...args: unknown[]) => onFCPAttr(...args),
    onINP: (...args: unknown[]) => onINPAttr(...args),
    onLCP: (...args: unknown[]) => onLCPAttr(...args),
    onTTFB: (...args: unknown[]) => onTTFBAttr(...args)
  }),
  { virtual: true }
);

const flushMicrotasks = () => new Promise((resolve) => setTimeout(resolve, 0));

describe("reportWebVitals", () => {
  const onReport = jest.fn();

  afterEach(() => {
    // resetAllMocks (not clearAllMocks) — every reportWebVitals() call re-registers
    // all five metric handlers unconditionally, so a leftover mockImplementation from
    // an earlier test would otherwise fire again here.
    jest.resetAllMocks();
  });

  it("registers the base handlers by default", () => {
    reportWebVitals(onReport, undefined, 1, undefined, false);

    expect(onCLS).toHaveBeenCalledTimes(1);
    expect(onFCP).toHaveBeenCalledTimes(1);
    expect(onINP).toHaveBeenCalledTimes(1);
    expect(onLCP).toHaveBeenCalledTimes(1);
    expect(onTTFB).toHaveBeenCalledTimes(1);

    expect(onCLSAttr).not.toHaveBeenCalled();
    expect(onFCPAttr).not.toHaveBeenCalled();
    expect(onINPAttr).not.toHaveBeenCalled();
    expect(onLCPAttr).not.toHaveBeenCalled();
    expect(onTTFBAttr).not.toHaveBeenCalled();
  });

  it("dynamically registers the attribution handlers when enabled", async () => {
    reportWebVitals(onReport, undefined, 1, undefined, true);

    await flushMicrotasks();

    expect(onCLSAttr).toHaveBeenCalledTimes(1);
    expect(onFCPAttr).toHaveBeenCalledTimes(1);
    expect(onINPAttr).toHaveBeenCalledTimes(1);
    expect(onLCPAttr).toHaveBeenCalledTimes(1);
    expect(onTTFBAttr).toHaveBeenCalledTimes(1);

    expect(onCLS).not.toHaveBeenCalled();
    expect(onFCP).not.toHaveBeenCalled();
    expect(onINP).not.toHaveBeenCalled();
    expect(onLCP).not.toHaveBeenCalled();
    expect(onTTFB).not.toHaveBeenCalled();
  });

  it("falls back to the base handlers and warns if the attribution import fails", async () => {
    const warnSpy = jest.spyOn(console, "warn").mockImplementation(() => undefined);
    onCLSAttr.mockImplementationOnce(() => {
      throw new Error("boom");
    });

    reportWebVitals(onReport, undefined, 1, undefined, true);

    await flushMicrotasks();

    expect(warnSpy).toHaveBeenCalledTimes(1);
    expect(onCLS).toHaveBeenCalledTimes(1);
    expect(onFCP).toHaveBeenCalledTimes(1);
    expect(onINP).toHaveBeenCalledTimes(1);
    expect(onLCP).toHaveBeenCalledTimes(1);
    expect(onTTFB).toHaveBeenCalledTimes(1);

    warnSpy.mockRestore();
  });

  it("resolves metadata by the metric's measurement time, not report time", () => {
    // Two metadata "snapshots" keyed by measurement time, exactly like Argus's
    // history-backed resolver would produce for two setMetadata() calls.
    const resolveMetadata = jest.fn((at?: number) =>
      at !== undefined && at < 500 ? { pagePath: "/menu" } : { pagePath: "/bill" }
    );

    onLCP.mockImplementation((cb: (metric: unknown) => void) => {
      cb({ name: "LCP", value: 1200, rating: "good", entries: [{ startTime: 100 }] });
    });

    reportWebVitals(onReport, resolveMetadata, 1, ["event", "value", "pagePath"], false);

    expect(resolveMetadata).toHaveBeenCalledWith(100);
    expect(onReport).toHaveBeenCalledWith(
      expect.objectContaining({ event: "perf-web-vital-LCP", value: 1200, pagePath: "/menu" })
    );

    // The metric measured at t=100 is reported here, well after metadata moved on to /bill,
    // but the payload must still reflect the page active when it was actually measured.
    onLCP.mock.calls[0][0]({ name: "LCP", value: 1200, rating: "good", entries: [{ startTime: 100 }] });
    expect(onReport).toHaveBeenLastCalledWith(
      expect.objectContaining({ event: "perf-web-vital-LCP", value: 1200, pagePath: "/menu" })
    );
  });

  it("resolves CLS by the largest layout-shift entry's startTime, not the first or last", () => {
    const resolveMetadata = jest.fn(() => ({}));

    onCLS.mockImplementation((cb: (metric: unknown) => void) => {
      cb({
        name: "CLS",
        value: 0.3,
        rating: "good",
        entries: [
          { startTime: 100, value: 0.05 },
          { startTime: 300, value: 0.2 }, // largest — this is the timestamp that should be used
          { startTime: 500, value: 0.05 }
        ]
      });
    });

    reportWebVitals(onReport, resolveMetadata, 1, undefined, false);

    expect(resolveMetadata).toHaveBeenCalledWith(300);
  });

  it("resolves INP and FCP by the first entry's startTime", () => {
    const resolveMetadata = jest.fn(() => ({}));

    onINP.mockImplementation((cb: (metric: unknown) => void) => {
      cb({ name: "INP", value: 200, rating: "good", entries: [{ startTime: 750 }] });
    });
    onFCP.mockImplementation((cb: (metric: unknown) => void) => {
      cb({ name: "FCP", value: 1000, rating: "good", entries: [{ startTime: 900 }] });
    });

    reportWebVitals(onReport, resolveMetadata, 1, undefined, false);

    expect(resolveMetadata).toHaveBeenCalledWith(750);
    expect(resolveMetadata).toHaveBeenCalledWith(900);
  });

  it("resolves TTFB to timestamp 0 (the navigation entry's startTime, always exactly 0)", () => {
    const resolveMetadata = jest.fn(() => ({}));

    onTTFB.mockImplementation((cb: (metric: unknown) => void) => {
      cb({ name: "TTFB", value: 50, rating: "good", entries: [{ startTime: 0 }] });
    });

    reportWebVitals(onReport, resolveMetadata, 1, undefined, false);

    expect(resolveMetadata).toHaveBeenCalledWith(0);
  });

  it("resolves an undefined timestamp when a metric has no entries", () => {
    const resolveMetadata = jest.fn(() => ({}));

    onCLS.mockImplementation((cb: (metric: unknown) => void) => {
      cb({ name: "CLS", value: 0, rating: "good", entries: [] });
    });

    reportWebVitals(onReport, resolveMetadata, 1, undefined, false);

    expect(resolveMetadata).toHaveBeenCalledWith(undefined);
  });

  it("falls back to current metadata when no resolver is provided (empty history)", () => {
    onLCP.mockImplementation((cb: (metric: unknown) => void) => {
      cb({ name: "LCP", value: 1200, rating: "good", entries: [{ startTime: 100 }] });
    });

    reportWebVitals(onReport, undefined, 1, ["event", "value"], false);

    expect(onReport).toHaveBeenCalledWith(expect.objectContaining({ event: "perf-web-vital-LCP", value: 1200 }));
  });

  it("resolves each metric independently across a simulated bfcache restore", () => {
    // Simulates two metric instances from the same registered handler — as web-vitals
    // produces on a bfcache restore — measured on either side of a metadata change.
    const resolveMetadata = jest.fn((at?: number) => (at === 100 ? { pagePath: "/menu" } : { pagePath: "/bill" }));

    // Only capture the registered handler here — don't fire it on registration —
    // so the two manual invocations below are the only reports produced.
    reportWebVitals(onReport, resolveMetadata, 1, ["event", "pagePath"], false);

    const handler = onLCP.mock.calls[0][0];
    handler({ name: "LCP", value: 1000, rating: "good", entries: [{ startTime: 100 }] });
    handler({ name: "LCP", value: 900, rating: "good", entries: [{ startTime: 900 }] }); // post-restore instance

    expect(onReport).toHaveBeenNthCalledWith(1, expect.objectContaining({ pagePath: "/menu" }));
    expect(onReport).toHaveBeenNthCalledWith(2, expect.objectContaining({ pagePath: "/bill" }));
  });

  it("stops reporting after disconnect and resumes after reconnect", () => {
    onLCP.mockImplementation((cb: (metric: unknown) => void) => {
      cb({ name: "LCP", value: 1200, rating: "good" });
    });

    const collector = reportWebVitals(onReport, undefined, 1, undefined, false);
    expect(onReport).toHaveBeenCalledTimes(1);

    collector.disconnect();
    onLCP.mock.calls[0][0]({ name: "LCP", value: 1300, rating: "good" });
    expect(onReport).toHaveBeenCalledTimes(1);

    collector.reconnect();
    onLCP.mock.calls[0][0]({ name: "LCP", value: 1400, rating: "good" });
    expect(onReport).toHaveBeenCalledTimes(2);
  });

  it("flattens attribution fields onto the payload and lets whitelistedFields filter them", async () => {
    const fakeLcpMetric = {
      name: "LCP",
      value: 2500,
      rating: "good",
      attribution: {
        target: "body > img",
        timeToFirstByte: 100,
        navigationEntry: { raw: "heavy-entry" }
      }
    };

    onLCPAttr.mockImplementation((cb: (metric: unknown) => void) => cb(fakeLcpMetric));

    reportWebVitals(onReport, undefined, 1, ["event", "value", "target", "timeToFirstByte"], true);

    await flushMicrotasks();

    expect(onReport).toHaveBeenCalledTimes(1);
    const payload = onReport.mock.calls[0][0];

    expect(payload).toEqual({
      event: "perf-web-vital-LCP",
      value: 2500,
      target: "body > img",
      timeToFirstByte: 100
    });
    expect(payload.attribution).toBeUndefined();
    expect(payload.navigationEntry).toBeUndefined();
  });
});
