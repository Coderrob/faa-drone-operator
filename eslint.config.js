import jsdoc from "eslint-plugin-jsdoc";
import tseslint from "typescript-eslint";

export default tseslint.config(
  {
    ignores: [
      ".astro/**",
      "coverage/**",
      "dist/**",
      "dist-cli/**",
      "node_modules/**",
      "site-dist/**",
    ],
  },
  ...tseslint.configs.recommended,
  {
    files: ["**/*.ts"],
    plugins: { jsdoc },
    rules: {
      complexity: ["error", 3],
      "max-lines": ["error", { max: 350, skipBlankLines: false, skipComments: false }],
      "max-lines-per-function": ["error", { max: 30, skipBlankLines: false, skipComments: false, IIFEs: true }],
      "jsdoc/require-description": "error",
      "jsdoc/require-jsdoc": ["error", {
        publicOnly: false,
        require: {
          ArrowFunctionExpression: true,
          FunctionDeclaration: true,
          FunctionExpression: true,
          MethodDefinition: true,
        },
      }],
      "jsdoc/require-param": "error",
      "jsdoc/require-param-description": "error",
      "jsdoc/require-returns": "error",
      "jsdoc/require-returns-description": "error",
      "jsdoc/require-throws": "error",
    },
  },
);
