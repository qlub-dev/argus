module.exports = {
  env: {
    browser: true,
    node: true,
    es2022: true
  },
  ignorePatterns: ["dist/*", "node_modules/*", "pnpm-lock.yaml"],
  extends: ["plugin:@typescript-eslint/recommended"],
  parserOptions: {
    ecmaFeatures: {
      jsx: true
    },
    parser: "@typescript-eslint/parser",
    ecmaVersion: "latest",
    sourceType: "module"
  },
  settings: {
    react: {
      version: "18.0"
    }
  },
  plugins: ["@typescript-eslint", "unused-imports"],
  rules: {
    "@typescript-eslint/ban-types": "off",
    "@typescript-eslint/no-explicit-any": "off",
    "@typescript-eslint/ban-ts-comment": "off",
    "no-console": "warn",
    "unused-imports/no-unused-imports": "error",
    "max-lines": ["error", 300],
    "@typescript-eslint/consistent-type-imports": "error"
  }
};
