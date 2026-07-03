import { prepareMetric } from "../src/utils";

describe("prepareMetric", () => {
  it("flattens a nested attribution object onto the top level", () => {
    const result = prepareMetric(
      {
        name: "LCP",
        value: 100,
        attribution: { target: "body", timeToFirstByte: 10, navigationEntry: { raw: true } }
      },
      { type: "web-vital", label: "LCP" }
    );

    expect(result.target).toBe("body");
    expect(result.timeToFirstByte).toBe(10);
    expect(result.navigationEntry).toEqual({ raw: true });
    expect(result.attribution).toBeUndefined();
  });

  it("lets filterKeys select individual flattened attribution fields", () => {
    const result = prepareMetric(
      {
        name: "LCP",
        value: 100,
        attribution: { target: "body", timeToFirstByte: 10, navigationEntry: { raw: true } }
      },
      { type: "web-vital", label: "LCP" },
      ["event", "value", "target", "timeToFirstByte"]
    );

    expect(result).toEqual({
      event: "perf-web-vital-LCP",
      value: 100,
      target: "body",
      timeToFirstByte: 10
    });
  });

  it("is a no-op when the metric has no attribution field", () => {
    const result = prepareMetric({ name: "api", duration: 50 }, { type: "api-timing" });

    expect(result.attribution).toBeUndefined();
    expect(result.duration).toBe(50);
    expect(result.name).toBe("api");
  });

  it("keeps metadata precedence over flattened attribution fields on key collision", () => {
    const result = prepareMetric(
      { name: "LCP", attribution: { label: "from-attribution" } },
      { label: "from-metadata" }
    );

    expect(result.label).toBe("from-metadata");
  });
});
