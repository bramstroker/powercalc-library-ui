// eslint.config.mjs
import js from "@eslint/js";
import tsPlugin from "@typescript-eslint/eslint-plugin";
import tsParser from "@typescript-eslint/parser";
import importPlugin from "eslint-plugin-import-x";
import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import unusedImports from "eslint-plugin-unused-imports";
import globals from "globals";

const tsconfigRootDir = new URL(".", import.meta.url).pathname;

export default [
  // `npm run lint` now covers the whole repository rather than `src/` alone, so everything that is
  // generated or vendored has to be named here.
  {
    ignores: [
      "dist",
      "build",
      "node_modules",
      ".react-router",
      "coverage",
      "playwright-report",
      "test-results",
      "blob-report",
      "public",
    ],
  },

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
    settings: { react: { version: "19.0" } },
  },

  // -------------------------
  // TS / TSX files (typed linting enabled)
  // -------------------------
  {
    // `.mts` is listed explicitly: `vite.config.mts` matched no block at all before, so the build
    // configuration was the one file in the repository nothing linted.
    files: ["**/*.{ts,tsx,mts,cts}"],
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

      // The type-aware ruleset, not the plain `recommended` baseline that was here before. The
      // parser already builds a full program for `project: true` above, so the analysis was being
      // paid for and then largely thrown away — which is how an untyped `await res.json()` spread
      // straight into a typed API response without complaint.
      ...tsPlugin.configs["recommended-type-checked"].rules,

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

      // Throwing a `Response` is how a React Router loader signals a 404 or a redirect — the
      // router catches it and renders the error boundary or performs the navigation. It is the
      // framework's documented control flow, not an error being thrown wrong.
      "@typescript-eslint/only-throw-error": [
        "error",
        { allow: [{ from: "lib", name: "Response" }] },
      ],
    },
    settings: { react: { version: "19.0" } },
  },

  // -------------------------
  // Tests.
  //
  // Fixtures are deliberately untyped JSON and test doubles are deliberately `async` without
  // awaiting anything, so the unsafe-value rules fire constantly on code that is asserting on
  // exactly those shapes. Everything else, including `only-throw-error`, still applies.
  // -------------------------
  {
    files: ["**/*.test.{ts,tsx}", "e2e/**/*.ts"],
    rules: {
      "@typescript-eslint/no-unsafe-assignment": "off",
      "@typescript-eslint/no-unsafe-member-access": "off",
      "@typescript-eslint/no-unsafe-call": "off",
      "@typescript-eslint/no-unsafe-return": "off",
      "@typescript-eslint/no-unsafe-argument": "off",
      "@typescript-eslint/require-await": "off",
    },
  },

  // -------------------------
  // Tooling configuration files.
  //
  // The extension list is spelled out because the previous `**/vite.config.ts` glob never matched
  // this repository's `vite.config.mts`. Each of these tools reads its configuration from a default
  // export, so the project-wide ban on those cannot apply here.
  // -------------------------
  {
    files: ["*.config.{ts,mts,cts,js,mjs,cjs}", "**/*.{config,conf}.{ts,mts,cts}"],
    rules: {
      "import/no-default-export": "off",
      "@typescript-eslint/no-floating-promises": "off",
      "@typescript-eslint/no-misused-promises": "off",
    },
  },

  // React Router discovers these framework modules through their required default exports.
  {
    files: [
      "src/root.tsx",
      "src/routes.ts",
      "src/entry.server.tsx",
      "src/route-modules/**/*.{ts,tsx}",
    ],
    rules: {
      "import/no-default-export": "off",
    },
  },
];
