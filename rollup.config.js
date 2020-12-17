import fs from "fs";
import glob from "glob";
import svelte from "rollup-plugin-svelte";
import commonjs from "@rollup/plugin-commonjs";
import resolve from "@rollup/plugin-node-resolve";
import sveltePreprocess from "svelte-preprocess";
import typescript from "@rollup/plugin-typescript";
import size from "rollup-plugin-bundle-size";

const root = "packages/";
fs.readdir(root, (err, files) => {
  files.forEach((file) => {
    // fs.readFile(`${root}${file}/package.json`).forEach((each) => {
    //   console.log(each);
    // });
  });
});

glob("**/*.js", {}, function (err, files) {
  // files is an array of filenames.
  // If the `nonull` option is set, and nothing
  // was found, then files is ["**/*.js"]
  // er is an error object or null.
});
export default [
  {
    input: "packages/svelte-reactive-form/src/index.ts",
    output: [
      {
        file: "packages/svelte-reactive-form/lib/index.js",
        format: "iife",
        name: "svelteReactiveForm",
      },
      { file: "packages/svelte-reactive-form/lib/index.cjs", format: "cjs" },
      { file: "packages/svelte-reactive-form/lib/index.mjs", format: "es" },
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
    input: "packages/rules/src/index.ts",
    output: [
      {
        file: "packages/rules/lib/index.js",
        format: "iife",
        name: "svelteReactiveFormRules",
      },
      { file: "packages/rules/lib/index.cjs", format: "cjs" },
      { file: "packages/rules/lib/index.mjs", format: "es" },
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
