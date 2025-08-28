const { defineConfig, globalIgnores } = require("eslint/config");

const globals = require("globals");
const typescriptEslint = require("@typescript-eslint/eslint-plugin");
const unusedImports = require("eslint-plugin-unused-imports");
const js = require("@eslint/js");

const { FlatCompat } = require("@eslint/eslintrc");

const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
  allConfig: js.configs.all
});

module.exports = defineConfig([
  {
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node
      },

      ecmaVersion: "latest",
      sourceType: "module",

      parserOptions: {
        ecmaFeatures: {
          jsx: true
        },

        parser: "@typescript-eslint/parser"
      }
    },

    extends: compat.extends("plugin:@typescript-eslint/recommended"),

    settings: {
      react: {
        version: "18.0"
      }
    },

    plugins: {
      "@typescript-eslint": typescriptEslint,
      "unused-imports": unusedImports
    },

    rules: {
      "@typescript-eslint/ban-types": "off",
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/ban-ts-comment": "off",
      "no-console": "warn",
      "unused-imports/no-unused-imports": "error",
      "max-lines": ["error", 300],
      "@typescript-eslint/consistent-type-imports": "error"
    }
  },
  globalIgnores(["dist/*", "node_modules/*", "**/pnpm-lock.yaml", "eslint.config.js"])
]);
