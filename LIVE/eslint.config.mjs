import eslint from "@eslint/js";
import tseslint from "typescript-eslint";
import jsoncPlugin from "eslint-plugin-jsonc";
import jsoncParser from "jsonc-eslint-parser";
import globals from "globals";

export default [
  {
    files: ["**/*.js"],
    ignores: ["!.*", "**/node_modules/.*"],
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.jest,
        ...globals.es2015,
      },
    },
    rules: {
      ...eslint.configs.recommended.rules,
    },
  },
  {
    files: ["**/*.{ts,tsx}"],
    ignores: ["!.*", "**/node_modules/.*"],
    plugins: {
      "@typescript-eslint": tseslint.plugin,
    },
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        project: true,
        tsconfigRootDir: import.meta.dirname,
      },
      globals: {
        ...globals.browser,
        ...globals.jest,
        ...globals.es2015,
      },
    },
    rules: {
      ...eslint.configs.recommended.rules,
      ...tseslint.configs.recommended.rules,
    },
  },
  {
    files: ["**/*.json", "**/*.jsonc", "**/*.json5"],
    languageOptions: {
      parser: /** @type {*} */ (jsoncParser),
    },
    plugins: {
      jsonc: /** @type {*} */ (jsoncPlugin),
    },
  },
  {
    files: ["**/*.json"],
    rules:
      /** @type {import('eslint').Linter.RulesRecord} */
      (jsoncPlugin.configs["recommended-with-json"].rules),
  },
  {
    files: ["**/*.jsonc"],
    rules:
      /** @type {import('eslint').Linter.RulesRecord} */
      (jsoncPlugin.configs["recommended-with-jsonc"].rules),
  },
  {
    files: ["**/*.json5"],
    rules:
      /** @type {import('eslint').Linter.RulesRecord} */
      (jsoncPlugin.configs["recommended-with-json5"].rules),
  },
];
