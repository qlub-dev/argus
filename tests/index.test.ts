import { handleApiTimingMetricCollection } from "../src/handlers/api-timing";
import { handleUserTimingMetricCollection } from "../src/handlers/user-timing";
import { Argus } from "../src/index";

const webVitalsCollector = { disconnect: jest.fn(), reconnect: jest.fn() };
const reportWebVitalsMock: jest.Mock = jest.fn(() => webVitalsCollector);

jest.mock("../src/collectors/web-vitals", () => ({
  reportWebVitals: (...args: unknown[]) => reportWebVitalsMock(...args)
}));
jest.mock("../src/handlers/api-timing", () => ({
  handleApiTimingMetricCollection: jest.fn(() => ({ disconnect: jest.fn() }))
}));

jest.mock("../src/handlers/user-timing", () => ({
  handleUserTimingMetricCollection: jest.fn(() => ({ disconnect: jest.fn() }))
}));

describe("Argus", () => {
  const onReport = jest.fn();
  const config = {
    webVitals: { enabled: true },
    apiTiming: { enabled: true, trackers: [{ regex: /test/, label: "test-api" }] },
    userTiming: { enabled: true, trackers: [{ id: "checkout-flow" }] }
  };

  beforeEach(() => {
    Argus.resetForTests();
    jest.clearAllMocks();
  });

  it("registers web vitals only once across repeated init calls", async () => {
    const argus = Argus.getInstance(onReport, config);

    await argus.init({ countryCode: "ae" });
    await argus.init({ countryCode: "ae", pagePath: "/bill" });

    expect(reportWebVitalsMock).toHaveBeenCalledTimes(1);
    expect(handleApiTimingMetricCollection).toHaveBeenCalledTimes(1);
    expect(handleUserTimingMetricCollection).toHaveBeenCalledTimes(1);
  });

  it("passes a live metadata getter to api and user timing collectors", async () => {
    const argus = Argus.getInstance(onReport, config);

    await argus.init({ pagePath: "/menu" });
    argus.setMetadata({ pagePath: "/bill" });

    // Unlike the web-vitals resolver, api/user-timing report near-realtime, so they
    // read the *current* metadata via a plain getter, not a measurement-time snapshot.
    const apiGetMetadata = (handleApiTimingMetricCollection as jest.Mock).mock.calls[0][2] as () => Record<
      string,
      unknown
    >;
    const userGetMetadata = (handleUserTimingMetricCollection as jest.Mock).mock.calls[0][2] as () => Record<
      string,
      unknown
    >;

    expect(apiGetMetadata()).toEqual({ pagePath: "/bill" });
    expect(userGetMetadata()).toEqual({ pagePath: "/bill" });

    argus.setMetadata({ pagePath: "/tip" });

    expect(apiGetMetadata()).toEqual({ pagePath: "/tip" });
    expect(userGetMetadata()).toEqual({ pagePath: "/tip" });
  });

  it("removes metadata keys set to undefined", async () => {
    const argus = Argus.getInstance(onReport, { webVitals: { enabled: true } });

    await argus.init({ pagePath: "/menu", orderId: "123" });
    argus.setMetadata({ orderId: undefined });

    const resolveMetadata = reportWebVitalsMock.mock.calls[0][1] as (at?: number) => Record<string, unknown>;
    expect(resolveMetadata()).toEqual({ pagePath: "/menu" });
    expect("orderId" in resolveMetadata()).toBe(false);
  });

  it("re-registers api and user timing collectors after shutdown", async () => {
    const argus = Argus.getInstance(onReport, config);

    await argus.init();
    argus.shutdown();
    await argus.init();

    expect(reportWebVitalsMock).toHaveBeenCalledTimes(1);
    expect(handleApiTimingMetricCollection).toHaveBeenCalledTimes(2);
    expect(handleUserTimingMetricCollection).toHaveBeenCalledTimes(2);
  });

  it("gates web vitals off on shutdown and back on at re-init", async () => {
    const argus = Argus.getInstance(onReport, config);

    await argus.init();
    expect(webVitalsCollector.disconnect).not.toHaveBeenCalled();

    argus.shutdown();
    expect(webVitalsCollector.disconnect).toHaveBeenCalledTimes(1);

    await argus.init();
    expect(webVitalsCollector.reconnect).toHaveBeenCalledTimes(1);
    expect(reportWebVitalsMock).toHaveBeenCalledTimes(1);
  });

  describe("metadata resolver passed to web vitals", () => {
    const withNow = (values: number[]) => {
      const nowSpy = jest.spyOn(performance, "now");
      values.forEach((value) => nowSpy.mockImplementationOnce(() => value));
      return nowSpy;
    };

    afterEach(() => {
      jest.restoreAllMocks();
    });

    it("resolves current metadata for an undefined timestamp", async () => {
      withNow([100]);
      const argus = Argus.getInstance(onReport, { webVitals: { enabled: true } });

      await argus.init({ pagePath: "/menu" });
      argus.setMetadata({ pagePath: "/bill" });

      const resolveMetadata = reportWebVitalsMock.mock.calls[0][1] as (at?: number) => Record<string, unknown>;
      expect(resolveMetadata()).toEqual({ pagePath: "/bill" });
    });

    it("resolves the metadata snapshot current at a past measurement time", async () => {
      withNow([100, 200]);
      const argus = Argus.getInstance(onReport, { webVitals: { enabled: true } });

      await argus.init({ pagePath: "/menu" });
      argus.setMetadata({ pagePath: "/bill" });

      const resolveMetadata = reportWebVitalsMock.mock.calls[0][1] as (at?: number) => Record<string, unknown>;
      expect(resolveMetadata(150)).toEqual({ pagePath: "/menu" });
      expect(resolveMetadata(200)).toEqual({ pagePath: "/bill" });
    });

    it("falls back to the earliest snapshot for a timestamp predating all history", async () => {
      withNow([100]);
      const argus = Argus.getInstance(onReport, { webVitals: { enabled: true } });

      await argus.init({ pagePath: "/menu" });

      const resolveMetadata = reportWebVitalsMock.mock.calls[0][1] as (at?: number) => Record<string, unknown>;
      expect(resolveMetadata(0)).toEqual({ pagePath: "/menu" });
    });

    it("falls back to current metadata when history is empty", async () => {
      const argus = Argus.getInstance(onReport, { webVitals: { enabled: true } });

      await argus.init();

      const resolveMetadata = reportWebVitalsMock.mock.calls[0][1] as (at?: number) => Record<string, unknown>;
      expect(resolveMetadata(123)).toEqual({});
    });

    it("does not grow history on shallow-equal setMetadata calls", async () => {
      // A shallow-equal setMetadata() call returns before reading performance.now(),
      // so only two of these three queued timestamps are ever consumed.
      withNow([100, 200, 999]);

      const argus = Argus.getInstance(onReport, { webVitals: { enabled: true } });
      await argus.init({ pagePath: "/menu" }); // consumes 100
      argus.setMetadata({ pagePath: "/menu" }); // shallow-equal, no history append, no now() call
      argus.setMetadata({ pagePath: "/bill" }); // distinct, consumes 200

      const resolveMetadata = reportWebVitalsMock.mock.calls[0][1] as (at?: number) => Record<string, unknown>;
      expect(resolveMetadata(150)).toEqual({ pagePath: "/menu" });
      expect(resolveMetadata(200)).toEqual({ pagePath: "/bill" });
    });

    it("evicts the oldest snapshot once the history cap is exceeded", async () => {
      const HISTORY_LIMIT = 50;
      let tick = 0;
      jest.spyOn(performance, "now").mockImplementation(() => tick);

      const argus = Argus.getInstance(onReport, { webVitals: { enabled: true } });
      tick = 0;
      await argus.init({ pagePath: "/page-0" });

      for (let i = 1; i <= HISTORY_LIMIT; i++) {
        tick = i;
        argus.setMetadata({ pagePath: `/page-${i}` });
      }

      const resolveMetadata = reportWebVitalsMock.mock.calls[0][1] as (at?: number) => Record<string, unknown>;
      // Snapshot at t=0 (/page-0) has been evicted; the oldest remaining is t=1 (/page-1).
      expect(resolveMetadata(0)).toEqual({ pagePath: "/page-1" });
    });
  });
});
