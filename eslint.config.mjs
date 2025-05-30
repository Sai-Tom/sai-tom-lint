import globals from "globals";
import localRules from "./dist/index.js";

export default [
  {
    files: ["**/*.{js,mjs}"],
    languageOptions: { sourceType: "module" },
  },
  {
    languageOptions: { globals: globals.browser },
  },
  {
    plugins: { "eslint-pulgin-local-rules": localRules },
  },
  {
    rules: {
      "eslint-pulgin-local-rules/align-assignments": [2],
    },
  },
];
