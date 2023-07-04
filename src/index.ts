import { ApolloServer } from "@apollo/server";
import { startStandaloneServer } from "@apollo/server/standalone";
import { addResolversToSchema } from "@graphql-tools/schema";

import { schema } from "./schema.js";
import { resolvers } from "./resolvers.js";

const server = new ApolloServer({
  schema: addResolversToSchema({ schema, resolvers }),
});

const { url } = await startStandaloneServer(server, {
  listen: {
    port: 4000,
  },
});

console.log(`🚀 Server ready at ${url}`);
