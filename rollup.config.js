import svelte from "rollup-plugin-svelte";
import commonjs from "@rollup/plugin-commonjs";
import resolve from "@rollup/plugin-node-resolve";
import sveltePreprocess from "svelte-preprocess";
import typescript from "@rollup/plugin-typescript";
import size from "rollup-plugin-bundle-size";

export default [
  {
    input: "src/index.ts",
    output: [
      { file: "index.cjs", format: "cjs" },
      { file: "index.js", format: "es" },
    ],
    plugins: [
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

      // If we're building for production (npm run build
      // instead of npm run dev), minify
      // terser(),
    ],
  },
  {
    input: "src/rules/index.ts",
    output: [
      { file: "rules/index.cjs", format: "cjs" },
      { file: "rules/index.js", format: "es" },
    ],
    plugins: [
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

      // If we're building for production (npm run build
      // instead of npm run dev), minify
      // terser(),
    ],
  },
];
