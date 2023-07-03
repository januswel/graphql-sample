import { loadSchemaSync } from "@graphql-tools/load";
import { GraphQLFileLoader } from "@graphql-tools/graphql-file-loader";
import path from "path";

const GRAPHQL_SCHEMA_PATH = "./graphql/schema.graphql";
const schemaPath = path.resolve(GRAPHQL_SCHEMA_PATH);
console.log(`loading schema from ${schemaPath}`);

export const schema = loadSchemaSync(schemaPath, {
  loaders: [new GraphQLFileLoader()],
});
