// eslint.config.mjs
import js from "@eslint/js";
import globals from "globals";

import tsParser from "@typescript-eslint/parser";
import tsPlugin from "@typescript-eslint/eslint-plugin";

import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import importPlugin from "eslint-plugin-import";
import unusedImports from "eslint-plugin-unused-imports";

const tsconfigRootDir = new URL(".", import.meta.url).pathname;

export default [
  { ignores: ["dist", "build", "node_modules"] },

  js.configs.recommended,

  // -------------------------
  // JS / JSX / MJS / CJS files (no type-aware TS rules here)
  // -------------------------
  {
    files: ["**/*.{js,jsx,mjs,cjs}"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
    plugins: {
      react,
      "react-hooks": reactHooks,
      import: importPlugin,
      "unused-imports": unusedImports,
    },
    rules: {
      "react/react-in-jsx-scope": "off",
      "react/prop-types": "off",
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "warn",

      "unused-imports/no-unused-imports": "error",
      "import/no-default-export": "error",
      "import/order": [
        "warn",
        {
          "newlines-between": "always",
          alphabetize: { order: "asc", caseInsensitive: true },
        },
      ],
    },
    settings: { react: { version: "detect" } },
  },

  // -------------------------
  // TS / TSX files (typed linting enabled)
  // -------------------------
  {
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        // ✅ This enables type information for type-aware rules
        project: true,
        tsconfigRootDir,
        ecmaVersion: "latest",
        sourceType: "module",
      },
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
    plugins: {
      "@typescript-eslint": tsPlugin,
      react,
      "react-hooks": reactHooks,
      import: importPlugin,
      "unused-imports": unusedImports,
    },
    rules: {
      // Turn off core no-undef for TS files (TS handles this)
      "no-undef": "off",

      // TS recommended (non-type-aware baseline)
      ...tsPlugin.configs.recommended.rules,

      // React + Hooks
      "react/react-in-jsx-scope": "off",
      "react/prop-types": "off",
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "warn",

      // Allow intentionally unused vars prefixed with "_"
      "@typescript-eslint/no-unused-vars": [
        "warn",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
        },
      ],

      // Enforce: const fn = () => {}
      "func-style": ["error", "expression", { allowArrowFunctions: true }],
      "prefer-const": "error",

      // No default exports
      "import/no-default-export": "error",

      // Arrow components only
      "react/function-component-definition": [
        "error",
        {
          namedComponents: "arrow-function",
          unnamedComponents: "arrow-function",
        },
      ],

      // Ban React.FC (works on types)
      "@typescript-eslint/no-restricted-types": [
        "error",
        {
          types: {
            "React.FC": {
              message: "Avoid React.FC; type props explicitly instead.",
            },
            "React.FunctionComponent": {
              message: "Avoid React.FC; type props explicitly instead.",
            },
          },
        },
      ],

      // Cleanup
      "unused-imports/no-unused-imports": "error",

      "import/order": [
        "warn",
        {
          "newlines-between": "always",
          alphabetize: { order: "asc", caseInsensitive: true },
        },
      ],

      // ✅ Type-aware rules (NOW SAFE)
      "@typescript-eslint/no-floating-promises": "error",
      "@typescript-eslint/no-misused-promises": "error",
      "@typescript-eslint/consistent-type-imports": ["warn", { prefer: "type-imports" }],
    },
    settings: { react: { version: "detect" } },
  },

  // -------------------------
  // Optional: turn OFF typed linting for TS config files not in tsconfig includes
  // (prevents "file not in project" / type-info errors)
  // -------------------------
  {
    files: ["**/*.{config,conf}.ts", "**/vite.config.ts", "**/eslint.config.*"],
    rules: {
      "@typescript-eslint/no-floating-promises": "off",
      "@typescript-eslint/no-misused-promises": "off",
    },
  },
];
