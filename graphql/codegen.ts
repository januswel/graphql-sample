import type { CodegenConfig } from "@graphql-codegen/cli";

const config: CodegenConfig = {
  overwrite: true,
  schema: "./graphql/schema.graphql",
  generates: {
    "./src/interfaces/graphql/generated.ts": {
      plugins: ["typescript", "typescript-resolvers"],
    },
  },
};

export default config;
