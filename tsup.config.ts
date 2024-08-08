import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts", "src/fields.ts", "src/queries.ts", "src/stages.ts", "src/types.ts"],
  format: ["cjs", "esm"],
  dts: true,
});
