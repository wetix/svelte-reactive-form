import commonjs from "@rollup/plugin-commonjs";
import resolve from "@rollup/plugin-node-resolve";
import typescript from "@rollup/plugin-typescript";
import size from "rollup-plugin-bundle-size";

export default {
  input: "src/index.ts",
  output: [
    { file: "index.js", format: "iife", name: "svelteReactiveFormRules" },
    { file: "index.cjs", format: "cjs" },
    { file: "index.mjs", format: "es" },
  ],
  plugins: [
    typescript({
      sourceMap: false,
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

    size(),

    // If we're building for production (npm run build
    // instead of npm run dev), minify
    // terser(),
  ],
};
