import jsdoc from "eslint-plugin-jsdoc";
import importX from "eslint-plugin-import-x";
import tseslint from "typescript-eslint";

const infinitives = {
  advances: "advance",
  builds: "build",
  calculates: "calculate",
  caps: "cap",
  classifies: "classify",
  confirms: "confirm",
  contains: "contain",
  escapes: "escape",
  evaluates: "evaluate",
  filters: "filter",
  formats: "format",
  handles: "handle",
  is: "be",
  labels: "label",
  normalizes: "normalize",
  parses: "parse",
  passes: "pass",
  persists: "persist",
  preserves: "preserve",
  prints: "print",
  prompts: "prompt",
  publishes: "publish",
  reads: "read",
  records: "record",
  rejects: "reject",
  renders: "render",
  reports: "report",
  returns: "return",
  rewrites: "rewrite",
  runs: "run",
  schedules: "schedule",
  selects: "select",
  supports: "support",
  toggles: "toggle",
  validates: "validate",
};

const shouldTitleRule = {
  meta: { fixable: "code", messages: { prefix: "Test titles must start with 'should'." }, type: "suggestion" },
  create(context) {
    return {
      CallExpression(node) {
        if (node.callee.type !== "Identifier" || node.callee.name !== "it") return;
        const title = node.arguments[0];
        if (title?.type !== "Literal" || typeof title.value !== "string" || title.value.startsWith("should ")) return;
        const words = title.value.split(" ");
        const first = words.shift();
        const verb = infinitives[first] ?? first;
        const normalized = first === "does" ? words.join(" ") : [verb, ...words].join(" ");
        context.report({
          node: title,
          messageId: "prefix",
          fix: (fixer) => fixer.replaceText(title, JSON.stringify(`should ${normalized}`)),
        });
      },
    };
  },
};

const testStructureRule = {
  meta: {
    messages: {
      nested: "Each test must be inside a function-level describe nested under the file's root describe.",
      root: "Test files must contain exactly one root describe.",
    },
    type: "suggestion",
  },
  create(context) {
    const isCall = (node, name) => node.type === "CallExpression" && node.callee.type === "Identifier" && node.callee.name === name;
    return {
      "Program:exit"(node) {
        const roots = node.body.filter((statement) => statement.type === "ExpressionStatement" && isCall(statement.expression, "describe"));
        if (roots.length !== 1) context.report({ node, messageId: "root" });
      },
      "CallExpression[callee.name='it']"(node) {
        const describeCount = context.sourceCode.getAncestors(node).filter((ancestor) => isCall(ancestor, "describe")).length;
        if (describeCount < 2) context.report({ node, messageId: "nested" });
      },
    };
  },
};

export default tseslint.config(
  {
    ignores: [".astro/**", "coverage/**", "dist/**", "dist-cli/**", "node_modules/**", "site-dist/**"],
  },
  ...tseslint.configs.recommendedTypeChecked,
  ...tseslint.configs.strictTypeChecked,
  ...tseslint.configs.stylisticTypeChecked,
  {
    files: ["**/*.ts"],
    languageOptions: {
      parserOptions: {
        project: "./tsconfig.eslint.json",
        tsconfigRootDir: import.meta.dirname,
      },
    },
    plugins: {
      "import-x": importX,
      jsdoc,
      project: { rules: { "should-test-title": shouldTitleRule, "test-structure": testStructureRule } },
    },
    rules: {
      "@typescript-eslint/consistent-type-imports": ["error", { fixStyle: "inline-type-imports" }],
      "@typescript-eslint/no-import-type-side-effects": "error",
      "@typescript-eslint/no-non-null-assertion": "off",
      "@typescript-eslint/no-unnecessary-type-parameters": "off",
      "@typescript-eslint/restrict-template-expressions": [
        "error",
        {
          allowBoolean: true,
          allowNumber: true,
        },
      ],
      complexity: ["error", 3],
      "import-x/first": "error",
      "import-x/newline-after-import": "error",
      "import-x/no-duplicates": "error",
      "import-x/order": [
        "error",
        {
          alphabetize: { caseInsensitive: true, order: "asc" },
          groups: ["builtin", "external", "internal", "parent", "sibling", "index", "object", "type"],
          "newlines-between": "never",
        },
      ],
      "max-lines": ["error", { max: 350, skipBlankLines: false, skipComments: false }],
      "max-lines-per-function": ["error", { max: 30, skipBlankLines: false, skipComments: false, IIFEs: true }],
      "jsdoc/require-description": "error",
      "jsdoc/require-jsdoc": [
        "error",
        {
          publicOnly: false,
          require: {
            ArrowFunctionExpression: true,
            FunctionDeclaration: true,
            FunctionExpression: true,
            MethodDefinition: true,
          },
        },
      ],
      "jsdoc/require-param": "error",
      "jsdoc/require-param-description": "error",
      "jsdoc/require-returns": "error",
      "jsdoc/require-returns-description": "error",
      "jsdoc/require-throws": "error",
      "project/should-test-title": "error",
    },
  },
  {
    files: ["**/*.test.ts"],
    rules: { "project/test-structure": "error" },
  },
);
