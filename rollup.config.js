import svelte from "rollup-plugin-svelte";
import commonjs from "@rollup/plugin-commonjs";
import resolve from "@rollup/plugin-node-resolve";
import sveltePreprocess from "svelte-preprocess";
import { terser } from "rollup-plugin-terser";
import typescript from "@rollup/plugin-typescript";
import size from "rollup-plugin-bundle-size";

const plugins = [
  svelte({
    preprocess: sveltePreprocess(),
    compilerOptions: {
      // enable run-time checks when not in production
      dev: false,
    },
  }),

  // If you have external dependencies installed from
  // npm, you'll most likely need these plugins. In
  // some cases you'll need additional configuration -
  // consult the documentation for details:
  // https://github.com/rollup/plugins/tree/master/packages/commonjs
  resolve({
    browser: true,
    dedupe: ["svelte"],
  }),
  commonjs(),
  typescript({
    sourceMap: false,
  }),

  size(),
];

export default [
  {
    input: "packages/svelte-reactive-form/src/index.ts",
    output: [
      {
        file: "packages/svelte-reactive-form/lib/index.min.js",
        format: "iife",
        name: "svelteReactiveForm",
        plugins: [terser()],
      },
      {
        file: "packages/svelte-reactive-form/lib/index.js",
        format: "iife",
        name: "svelteReactiveForm",
      },
      {
        file: "packages/svelte-reactive-form/lib/cjs/index.js",
        format: "cjs",
      },
      {
        file: "packages/svelte-reactive-form/lib/esm/index.js",
        format: "es",
      },
    ],
    plugins,
  },
  {
    input: "packages/rules/src/index.ts",
    output: [
      {
        file: "packages/rules/lib/index.min.js",
        format: "iife",
        name: "svelteReactiveFormRules",
        plugins: [terser()],
      },
      {
        file: "packages/rules/lib/index.js",
        format: "iife",
        name: "svelteReactiveFormRules",
      },
      { file: "packages/rules/lib/cjs/index.js", format: "cjs" },
      { file: "packages/rules/lib/esm/index.js", format: "es" },
    ],
    plugins,
  },
];
