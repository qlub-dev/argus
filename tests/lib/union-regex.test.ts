import { createUnionRegex } from "../../src/lib/union-regex";

describe("createUnionRegex", () => {
  it("throws if input is not an array", () => {
    expect(() => createUnionRegex("not-an-array" as any)).toThrow("Provide an array of regexes");
  });

  it("throws if array is empty", () => {
    expect(() => createUnionRegex([])).toThrow("Provide an array of regexes");
  });

  it("matches any of the provided regexes", () => {
    const r = createUnionRegex([/cat/, /dog/, /mouse/]);

    expect(r.test("cat")).toBe(true);
    expect(r.test("dog")).toBe(true);
    expect(r.test("mouse")).toBe(true);
    expect(r.test("bird")).toBe(false);
  });

  it("merges flags from all regexes", () => {
    const r = createUnionRegex([/cat/i, /dog/g, /mouse/m]);

    // Combined flags should contain all unique flags
    expect(r.flags).toContain("i");
    expect(r.flags).toContain("g");
    expect(r.flags).toContain("m");
  });

  it("uses explicit flags if provided", () => {
    const r = createUnionRegex([/cat/i, /dog/g], "i");

    expect(r.flags).toBe("i");
    expect(r.test("CAT")).toBe(true); // case insensitive
    expect(r.test("dog")).toBe(true); // still matches "dog"
  });

  it("preserves anchors correctly", () => {
    const r = createUnionRegex([/^hello/, /world$/]);

    expect(r.test("hello there")).toBe(true); // matches ^hello
    expect(r.test("the world")).toBe(true); // matches world$
    expect(r.test("middle world hello")).toBe(false);
  });

  it("handles regexes with groups correctly", () => {
    const r = createUnionRegex([/(red|blue)/, /green/]);

    expect(r.test("red")).toBe(true);
    expect(r.test("blue")).toBe(true);
    expect(r.test("green")).toBe(true);
    expect(r.test("yellow")).toBe(false);
  });

  it("returns regex with correct source", () => {
    const r = createUnionRegex([/foo/, /bar/]);

    // Should wrap each source in non-capturing groups
    expect(r.source).toBe("(?:foo)|(?:bar)");
  });

  it("handles duplicate regexes", () => {
    const r = createUnionRegex([/cat/, /cat/]);

    // Still works
    expect(r.test("cat")).toBe(true);
  });
});
