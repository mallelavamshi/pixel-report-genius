import eslintPluginPrettier from "eslint-plugin-prettier";
import eslintConfigPrettier from "eslint-config-prettier";

export default [
  {
    files: ["**/*.ts", "**/*.tsx", "**/*.js", "**/*.jsx"],
    plugins: {
      prettier: eslintPluginPrettier
    },
    rules: {
      // Enable Prettier rules
      "prettier/prettier": "error",

      // Other ESLint rules
      "react/react-in-jsx-scope": "off", // No need for React import in Next.js
      "@typescript-eslint/no-unused-vars": "warn",
    },

    extends: [
      "eslint:recommended",
      "plugin:react/recommended",
      "plugin:@typescript-eslint/recommended",
      eslintConfigPrettier, // Disables ESLint rules that conflict with Prettier
    ],
  },
];
