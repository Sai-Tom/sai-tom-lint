import alignAssignment from "../dist/index.js";
import typescriptParser from "@typescript-eslint/parser";

export default [
  {
    files: ["**/*.ts"],
    languageOptions: { 
      parser: typescriptParser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
      }
    },
  },
  {
    files: ["**/*.js", "**/*.mjs"],
    languageOptions: { 
      sourceType: "module",
      parserOptions: {
        ecmaVersion: 'latest',
      }
    },
  },
  {
    plugins: { 
      "align-assignment": alignAssignment 
    },
  },
  {
    rules: {
      "align-assignment/align-assignments": ["error"],
      "align-assignment/align-object-properties": ["error"],
    },
  },
]; 