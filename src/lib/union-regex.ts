export const createUnionRegex = (regexes: RegExp[], flags?: string): RegExp => {
  if (!Array.isArray(regexes) || regexes.length === 0) {
    throw new Error("Provide an array of regexes");
  }

  // collect unique flags if not explicitly passed
  const combinedFlags = flags || [...new Set(regexes.map((r) => r.flags).join(""))].join("");

  // combine sources with alternation
  const source = regexes.map((r) => `(?:${r.source})`).join("|");

  return new RegExp(source, combinedFlags);
};
