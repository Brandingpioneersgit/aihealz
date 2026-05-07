import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

// TODO: Install `eslint-plugin-security` (`npm i -D eslint-plugin-security`)
// and re-enable the block below to surface unsafe regex / eval patterns.
// import security from 'eslint-plugin-security';

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // {
  //   plugins: { security },
  //   rules: {
  //     'security/detect-object-injection': 'off', // too noisy
  //     'security/detect-unsafe-regex': 'warn',
  //     'security/detect-eval-with-expression': 'error',
  //     'security/detect-non-literal-fs-filename': 'off',
  //   },
  // },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;
