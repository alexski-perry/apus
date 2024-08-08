import { defineConfig } from "tsup";

export default defineConfig({
  tsconfig: "./tsconfig.json",
  entry: ["src/index.ts", "src/Fields.ts", "src/Queries.ts", "src/Stages.ts", "src/Types.ts"],
  format: ["cjs", "esm"],
  dts: true,
});
