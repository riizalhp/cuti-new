import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

// Lock-in rules for the anti-slop audit. Legacy violations live in
// eslint-suppressions.json (ESLint bulk suppressions); any NEW violation fails lint.
// Regenerate the baseline only after cleanup: `pnpm lint --prune-suppressions`.
const CLASS_LOCKS = [
  {
    // White text on orange-500 is 2.8:1. Primary CTA = cobalt; badge = orange-700.
    pattern: String.raw`(^|\s)bg-orange-500(\s.*)?\stext-white(\s|$)|(^|\s)text-white(\s.*)?\sbg-orange-500(\s|$)`,
    message: "bg-orange-500 + text-white gagal AA (2.8:1). Pakai bg-cobalt-500 untuk CTA atau bg-orange-700 untuk badge.",
  },
  {
    // slate-400 on white/slate-50 is ~2.5:1. Muted text in light mode = slate-500.
    pattern: String.raw`^(?![\s\S]*dark:text-)[\s\S]*(^|\s)text-slate-400(\s|$)`,
    message: "text-slate-400 di light mode gagal AA. Pakai text-slate-500 (+ dark:text-slate-400).",
  },
];

const restrictedSyntax = CLASS_LOCKS.flatMap(({ pattern, message }) => [
  { selector: `Literal[value=/${pattern}/]`, message },
  { selector: `TemplateElement[value.raw=/${pattern}/]`, message },
]);

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    files: ["components/**/*.{ts,tsx}", "app/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          paths: [
            { name: "@/components/ui/gooey-nav", message: "GooeyNav sudah diganti Radix Tabs (@/components/ui/tabs)." },
          ],
        },
      ],
      "no-restricted-syntax": ["error", ...restrictedSyntax],
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    ".cache/**",
    ".data/**",
    "e2e/review/**",
  ]),
]);

export default eslintConfig;
