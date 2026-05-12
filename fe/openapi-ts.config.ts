import { defineConfig } from "@hey-api/openapi-ts"

export default defineConfig({
  input: "http://localhost:5150/openapi/v1.json",
  output: {
    entryFile: false,
    path: "app/api/generated",
  },
  plugins: [
    {
      enums: false,
      name: "@hey-api/typescript",
    },
  ],
})
