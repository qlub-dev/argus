import json from "@rollup/plugin-json";
import { nodeResolve } from "@rollup/plugin-node-resolve";
import terser from "@rollup/plugin-terser";
import typescript from "@rollup/plugin-typescript";

export default [
  {
    input: "src/index.ts",
    output: [
      {
        file: "dist/index.js",
        format: "cjs",
        sourcemap: true
      },
      {
        file: "dist/index.mjs",
        format: "esm",
        sourcemap: true
      }
    ],
    plugins: [nodeResolve(), json(), typescript({ tsconfig: "./tsconfig.json" }), terser()],
    external: ["web-vitals"]
  }
];
