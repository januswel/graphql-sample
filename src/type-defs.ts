import path from "path";
import fs from "fs";

const schemaPath = path.join(path.resolve(), "./graphql/schema.graphql");
console.log(`load schema from ${schemaPath}`);

export const typeDefs = [fs.readFileSync(schemaPath, "utf-8")];
