import js from "@eslint/js";

export default [
  js.configs.recommended,
  {
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: {
        Audio: "readonly",
        L: "readonly",
        cancelAnimationFrame: "readonly",
        console: "readonly",
        document: "readonly",
        Math: "readonly",
        Promise: "readonly",
        requestAnimationFrame: "readonly",
        window: "readonly",
        navigator: "readonly",
        process: "readonly",
        setTimeout: "readonly",
        setInterval: "readonly"
      }
    },
    rules: {
      "no-unused-vars": "warn",
      "no-undef": "error",
      "eqeqeq": "warn",
      "curly": "error"
    }
  }
];
