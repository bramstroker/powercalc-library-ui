// eslint.config.mjs
import js from "@eslint/js";
import tsParser from "@typescript-eslint/parser";
import tsPlugin from "@typescript-eslint/eslint-plugin";
import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import globals from "globals";

export default [
  { ignores: ["dist", "build", "node_modules"] },

  js.configs.recommended,

  {
    files: ["**/*.{ts,tsx,js,jsx}"],
    languageOptions: {
      parser: tsParser,
      ecmaVersion: "latest",
      sourceType: "module",
      // Declare environments/globals so 'fetch', 'document', 'URLSearchParams', etc. are defined
      globals: {
        ...globals.browser, // window, document, fetch, URL, URLSearchParams, HTMLElement, etc.
        ...globals.node,    // if you also have Node scripts/import.meta/etc.
      },
    },
    plugins: {
      "@typescript-eslint": tsPlugin,
      react,
      "react-hooks": reactHooks,
    },
    rules: {
      // Turn off core no-undef for TS files (TS handles this)
      "no-undef": "off",

      // TS recommended
      ...tsPlugin.configs.recommended.rules,

      // React + Hooks
      "react/react-in-jsx-scope": "off",
      "react/prop-types": "off",
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "warn",

      // Allow intentionally unused vars prefixed with "_"
      "@typescript-eslint/no-unused-vars": ["warn", {
        argsIgnorePattern: "^_",
        varsIgnorePattern: "^_",
        caughtErrorsIgnorePattern: "^_",
      }],
    },
    settings: { react: { version: "detect" } },
  },
];
