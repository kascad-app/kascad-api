module.exports = {
  root: true,
  env: {
    browser: true,
    es2021: true,
  },
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:prettier/recommended",
  ],
  parser: "@typescript-eslint/parser",
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    ecmaVersion: 12,
    sourceType: "module",
  },
  plugins: ["@typescript-eslint", "prettier", "simple-import-sort"],
  rules: {
    "@typescript-eslint/no-unused-vars": [
      "error",
      {
        vars: "all",
        varsIgnorePattern: "^_",
        args: "after-used",
        argsIgnorePattern: "^_",
        ignoreRestSiblings: false,
      },
    ],
    "@typescript-eslint/no-explicit-any": "warn",
    "simple-import-sort/imports": [
      "error",
      {
        groups: [
          /* Style imports */
          ["^.+\\.?(css)$"],

          /*  imports */
          ["^nestjs", "^@nestjs"],

          /* Imports starting with @ */
          ["^@"],

          /* Custom imports */
          [
            "^@components",
            "^@constants",
            "^@contexts",
            "^@hooks",
            "^@misc",
            "^@pages",
            "^@plugins",
            "^@public",
            "^@services",
            "^@stores",
            "^@typesDef",
            "^@utils",
          ],

          /* Parent imports. Put .. last */
          ["^\\.\\.(?!/?$)", "^\\.\\./?$"],

          /* Other relative imports. Put same-folder imports and . last */
          ["^\\./(?=.*/)(?!/?$)", "^\\.(?!/?$)", "^\\./?$"],
        ],
      },
    ],
    "simple-import-sort/exports": "error",
    "import/extensions": [0],
    semi: ["error", "always"],
    quotes: ["error", "double"],
    "no-console": 0,
    "no-control-regex": 0,

    "prettier/prettier": ["error", { endOfLine: "auto", trailingComma: "all" }],
  },
};
