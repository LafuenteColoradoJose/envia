import js from "@eslint/js";
import angular from "@angular-eslint/eslint-plugin";
import angularTemplate from "@angular-eslint/eslint-plugin-template";
import angularParser from "@angular-eslint/template-parser";
import tsParser from "@typescript-eslint/parser";
import tsPlugin from "@typescript-eslint/eslint-plugin";
import jsdoc from "eslint-plugin-jsdoc";
import preferArrow from "eslint-plugin-prefer-arrow";

export default [
  {
    ignores: [
      "**/node_modules/**",
      "**/dist/**",
      "**/www/**",
      "**/.angular/**",
      "**/coverage/**",
    ],
  },
  {
    files: ["**/*.ts"],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        project: [
          "./tsconfig.json",
          "./tsconfig.app.json",
          "./tsconfig.spec.json",
        ],
        tsconfigRootDir: import.meta.dirname,
        sourceType: "module",
      },
    },
    plugins: {
      "@angular-eslint": angular,
      "@typescript-eslint": tsPlugin,
      jsdoc,
      "prefer-arrow": preferArrow,
    },
    rules: {
      ...js.configs.recommended.rules,
      ...angular.configs.recommended.rules,
      ...tsPlugin.configs.recommended.rules,
      "@angular-eslint/directive-selector": [
        "error",
        { type: "attribute", prefix: "app", style: "camelCase" },
      ],
      "@angular-eslint/component-selector": [
        "error",
        { type: "element", prefix: "app", style: "kebab-case" },
      ],
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/no-unused-vars": [
        "warn",
        { argsIgnorePattern: "^_" },
      ],
      "prefer-arrow/prefer-arrow-functions": [
        "warn",
        { allowNamedFunctions: true },
      ],
    },
  },
  {
    files: ["**/*.html"],
    languageOptions: { parser: angularParser },
    plugins: { "@angular-eslint/template": angularTemplate },
    rules: { ...angularTemplate.configs.recommended.rules },
  },
];
