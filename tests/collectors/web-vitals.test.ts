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
    jest.clearAllMocks();
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
});
