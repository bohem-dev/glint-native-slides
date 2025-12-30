// eslint.config.mjs
import tsparser from "@typescript-eslint/parser";
import obsidianmd from "eslint-plugin-obsidianmd";
import { defineConfig } from "eslint/config";

export default defineConfig([
  {
    ignores: [
      "/*.*",             // Ignore ALL files in the root (main.js, configs, json, etc.)
      "LICENSE",          // Ignore License (since it has no extension)
      "node_modules/**",  // Ignore dependencies
      "dist/**"           // Ignore dist folder if created
    ]
  },

  ...obsidianmd.configs.recommended,

  {
    files: ["**/*.ts", "**/*.tsx"],
    languageOptions: {
      parser: tsparser,
      parserOptions: {
        project: "./tsconfig.json",
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      "no-undef": "off",
      "@typescript-eslint/no-explicit-any": "warn",
    },
  },
]);