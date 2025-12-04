export default {
  root: true,
  env: {
    es2022: true,
    node: true,
  },

  parser: "@typescript-eslint/parser",

  parserOptions: {
    ecmaVersion: "latest",
    sourceType: "module",

    project: ["./tsconfig.json", "./packages/*/tsconfig.json"],
  },
  plugins: ["@typescript-eslint"],

  extends: ["eslint:recommended", "plugin:@typescript-eslint/recommended"],

  ignorePatterns: ["node_modules/", "dist/", "coverage/", "**/.weave/**", "**/*.d.ts"],

  rules: {
    // clean TS
    "@typescript-eslint/no-unused-vars": ["error", { argsIgnorePattern: "^_" }],

    // sinnvoll für ESM TypeScript
    "@typescript-eslint/consistent-type-imports": ["warn", { prefer: "type-imports" }],

    // Microservice Frameworks brauchen manchmal any
    "@typescript-eslint/no-explicit-any": "off",

    // stört bei generierten Typen
    "@typescript-eslint/no-empty-interface": "off",
    "@typescript-eslint/ban-types": "off",
  },
};
