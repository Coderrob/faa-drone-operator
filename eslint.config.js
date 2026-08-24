import jsdoc from "eslint-plugin-jsdoc";
import tseslint from "typescript-eslint";

const infinitives = {
  advances: "advance", builds: "build", calculates: "calculate", caps: "cap",
  classifies: "classify", confirms: "confirm", contains: "contain", escapes: "escape",
  evaluates: "evaluate", filters: "filter", formats: "format", handles: "handle",
  is: "be", labels: "label", normalizes: "normalize", parses: "parse",
  passes: "pass", persists: "persist", preserves: "preserve", prints: "print",
  prompts: "prompt", publishes: "publish", reads: "read", records: "record",
  rejects: "reject", renders: "render", reports: "report", returns: "return",
  rewrites: "rewrite", runs: "run", schedules: "schedule", selects: "select",
  supports: "support", toggles: "toggle", validates: "validate",
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
        context.report({ node: title, messageId: "prefix", fix: (fixer) => fixer.replaceText(title, JSON.stringify(`should ${normalized}`)) });
      },
    };
  },
};

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
    plugins: { jsdoc, project: { rules: { "should-test-title": shouldTitleRule } } },
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
      "project/should-test-title": "error",
    },
  },
);
