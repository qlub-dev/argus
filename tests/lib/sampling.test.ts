import { evaluateSamplingChance } from "../../src/lib/evaluate-sampling";

describe("shouldSample", () => {
  const originalRandom = Math.random;

  afterEach(() => {
    Math.random = originalRandom; // restore after each test
  });

  it("returns false if rate <= 0", () => {
    expect(evaluateSamplingChance(0)).toBe(false);
    expect(evaluateSamplingChance(-0.5)).toBe(false);
  });

  it("returns true if rate >= 1", () => {
    expect(evaluateSamplingChance(1)).toBe(true);
    expect(evaluateSamplingChance(2)).toBe(true);
  });

  it("returns true when Math.random() < rate", () => {
    Math.random = jest.fn().mockReturnValue(0.2); // deterministic
    expect(evaluateSamplingChance(0.5)).toBe(true); // 0.2 < 0.5
  });

  it("returns false when Math.random() >= rate", () => {
    Math.random = jest.fn().mockReturnValue(0.8);
    expect(evaluateSamplingChance(0.5)).toBe(false); // 0.8 >= 0.5
  });

  it("calls Math.random only when rate is between 0 and 1", () => {
    const mock = jest.fn().mockReturnValue(0.3);
    Math.random = mock;

    evaluateSamplingChance(0); // boundary
    evaluateSamplingChance(1); // boundary
    evaluateSamplingChance(0.5); // inside range → should call random

    expect(mock).toHaveBeenCalledTimes(1);
  });
});
