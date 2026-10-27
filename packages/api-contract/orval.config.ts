import { defineConfig } from "orval";

export default defineConfig({
  weavit: {
    input: "./openapi.json",
    output: {
      client: "zod",
      mode: "single",
      target: "./src/generated/zod.ts",
    },
  },
});
