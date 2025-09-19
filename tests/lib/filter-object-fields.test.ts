import { filterObjectFields } from "../../src/lib/filter-object-fields";

describe("filterObjectFields", () => {
  const sample = { id: 1, name: "Alice", age: 25 };

  it("returns a shallow copy when no allowedKeys are provided", () => {
    const result = filterObjectFields(sample);
    expect(result).toEqual(sample);
    expect(result).not.toBe(sample); // ensure it's a copy, not same reference
  });

  it("returns only the specified keys when allowedKeys are provided", () => {
    const result = filterObjectFields(sample, ["id", "name"]);
    expect(result).toEqual({ id: 1, name: "Alice" });
  });

  it("ignores keys not in source", () => {
    const result = filterObjectFields(sample, ["id", "nonExistent"]);
    expect(result).toEqual({ id: 1 });
  });

  it("returns an empty object if allowedKeys has no matching keys", () => {
    const result = filterObjectFields(sample, ["foo", "bar"]);
    expect(result).toEqual({});
  });

  it("works with an empty source object", () => {
    const result = filterObjectFields({}, ["id"]);
    expect(result).toEqual({});
  });

  it("works with nested objects but does not deep filter", () => {
    const nested = { id: 1, profile: { name: "Alice" } };
    const result = filterObjectFields(nested, ["profile"]);
    expect(result).toEqual({ profile: { name: "Alice" } });
  });
});
