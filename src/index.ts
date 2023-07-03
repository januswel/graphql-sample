import { ApolloServer } from "@apollo/server";
import { startStandaloneServer } from "@apollo/server/standalone";

import { resolvers } from "./resolvers/index.js";
import { schema } from "./schema.js";
import { addResolversToSchema } from "@graphql-tools/schema";

const server = new ApolloServer({
  schema: addResolversToSchema({ schema, resolvers }),
});

const { url } = await startStandaloneServer(server, {
  listen: {
    port: 4000,
  },
});

console.log(`🚀 Server ready at ${url}`);
