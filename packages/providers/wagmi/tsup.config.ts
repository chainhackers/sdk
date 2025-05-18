import { defineConfig } from "tsup";

declare const process: {
  env: {
    NODE_ENV: string;
  };
};

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["esm", "cjs"],
  dts: {
    compilerOptions: {
      incremental: false,
      noUnusedLocals: false,
    },
  },
  splitting: true,
  clean: true,
  shims: true,
  outDir: "dist",
  minify: process.env.NODE_ENV === "production",
  sourcemap: true,
  bundle: true,
  outExtension: ({ format }) => ({
    js: format === "esm" ? ".mjs" : ".cjs",
  }),
  treeshake: true,
  esbuildOptions(options) {
    options.alias = {
      "@betswirl/sdk-core": "@chainhackers/sdk-core",
    };
  },
});
