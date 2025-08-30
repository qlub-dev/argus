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
    plugins: [typescript({ tsconfig: "./tsconfig.json" }), nodeResolve(), terser()],
    external: ["web-vitals"]
  }
];
