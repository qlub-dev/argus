module.exports = {
  extends: ["@commitlint/config-conventional"],
  rules: {
    "header-max-length": [0, "always", 72],
    "type-enum": [
      2,
      "always",
      ["build", "chore", "ci", "docs", "feat", "fix", "patch", "perf", "refactor", "revert", "style", "test", "wip"]
    ]
  },
  ignores: [
    (commit) => commit.includes("[skip ci]") // Ignore semantic-release commits
  ]
};
