import { checkValueWithinBounds } from "../../src/lib/check-value-bounds";

describe("isValueInRange", () => {
  test("returns true when value is within inclusive lower and upper bounds", () => {
    expect(checkValueWithinBounds(5, 1, 10)).toBe(true);
  });

  test("returns true when value equals lower bound", () => {
    expect(checkValueWithinBounds(1, 1, 10)).toBe(true);
  });

  test("returns true when value equals upper bound", () => {
    expect(checkValueWithinBounds(10, 1, 10)).toBe(true);
  });

  test("returns false when value is below lower bound", () => {
    expect(checkValueWithinBounds(0, 1, 10)).toBe(false);
  });

  test("returns false when value is above upper bound", () => {
    expect(checkValueWithinBounds(11, 1, 10)).toBe(false);
  });

  test("returns true when only lower bound is provided and value >= lower bound", () => {
    expect(checkValueWithinBounds(5, 3)).toBe(true);
    expect(checkValueWithinBounds(3, 3)).toBe(true);
  });

  test("returns false when only lower bound is provided and value < lower bound", () => {
    expect(checkValueWithinBounds(2, 3)).toBe(false);
  });

  test("returns true when only upper bound is provided and value <= upper bound", () => {
    expect(checkValueWithinBounds(5, undefined, 7)).toBe(true);
    expect(checkValueWithinBounds(7, undefined, 7)).toBe(true);
  });

  test("returns false when only upper bound is provided and value > upper bound", () => {
    expect(checkValueWithinBounds(8, undefined, 7)).toBe(false);
  });

  test("returns true when no bounds are provided", () => {
    expect(checkValueWithinBounds(100)).toBe(true);
    expect(checkValueWithinBounds(-50)).toBe(true);
  });
});
