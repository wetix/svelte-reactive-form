import svelte from "rollup-plugin-svelte";
import commonjs from "@rollup/plugin-commonjs";
import resolve from "@rollup/plugin-node-resolve";
import { terser } from "rollup-plugin-terser";
import sveltePreprocess from "svelte-preprocess";
import typescript from "@rollup/plugin-typescript";
import camelCase from "camelcase";
import pkg from "./package.json";

export default {
  input: "src/index.ts",
  output: [
    {
      format: "iife",
      name: camelCase(pkg.name),
      file: pkg.main,
    },
    { file: pkg.browser, format: "cjs" },
    { file: pkg.module, format: "es" },
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

    // If we're building for production (npm run build
    // instead of npm run dev), minify
    terser(),
  ],
};
