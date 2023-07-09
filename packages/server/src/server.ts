import { ApolloServer } from "@apollo/server";
import { addResolversToSchema } from "@graphql-tools/schema";

import { schema } from "./schema.js";
import { resolversFactory } from "./resolvers.js";

export function serverFactory(databaseUrl: string) {
  const resolvers = resolversFactory(databaseUrl);
  const server = new ApolloServer({
    schema: addResolversToSchema({ schema, resolvers }),
  });
  return server;
}
