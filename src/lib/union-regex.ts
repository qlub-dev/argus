export const createUnionRegex = (regexes: RegExp[], flags?: string): RegExp => {
  if (!Array.isArray(regexes) || regexes.length === 0) throw new Error("Missing regex array");
  const combinedFlags = flags || [...new Set(regexes.map((r) => r.flags).join(""))].join("");
  const source = regexes.map((r) => `(?:${r.source})`).join("|");
  return new RegExp(source, combinedFlags);
};
