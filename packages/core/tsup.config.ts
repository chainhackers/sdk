import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["esm","cjs"],
  dts: {
    compilerOptions: {
      incremental: false,
      noUnusedLocals: false,
    },
  },
  sourcemap: true,
  clean: true,
});
