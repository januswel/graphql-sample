import { ApolloServer } from "@apollo/server";
import { addResolversToSchema } from "@graphql-tools/schema";

import { schema } from "./schema.js";
import { resolvers } from "./resolvers.js";

export const server = new ApolloServer({
  schema: addResolversToSchema({ schema, resolvers }),
});
