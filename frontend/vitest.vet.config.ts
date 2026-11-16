import { defineConfig, mergeConfig } from "vitest/config";
import baseConfig from "./vitest.config";

// Casos para revisión veterinaria: necesitan la base local, por eso no
// corren con `npm run test`. Ver scripts/vet-cases/vet-cases.vet.ts.
export default mergeConfig(
  baseConfig,
  defineConfig({
    test: {
      include: ["scripts/vet-cases/**/*.vet.ts"],
    },
  })
);
