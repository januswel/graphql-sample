import { ApolloServer } from "@apollo/server";
import { startStandaloneServer } from "@apollo/server/standalone";
import { GraphQLFileLoader } from "@graphql-tools/graphql-file-loader";
import { loadSchemaSync } from "@graphql-tools/load";
import { addResolversToSchema } from "@graphql-tools/schema";
import path from "path";
import { fileURLToPath } from "url";

const dirName = path.dirname(fileURLToPath(import.meta.url));
const schemaPath = path.normalize(
  path.join(dirName + "/../graphql/schema.graphql")
);
console.log(`load schema from ${schemaPath}`);
const schema = loadSchemaSync(schemaPath, {
  loaders: [new GraphQLFileLoader()],
});

const books = [
  {
    title: "Harry Potter and the Chamber of Secrets",
    author: "J.K. Rowling",
  },
  {
    title: "Jurassic Park",
    author: "Michael Crichton",
  },
];

const resolvers = {
  Query: {
    books: () => books,
  },
};

const server = new ApolloServer({
  schema: addResolversToSchema({ schema, resolvers }),
});

const { url } = await startStandaloneServer(server, {
  listen: {
    port: 4000,
  },
});

console.log(`🚀 Server ready at ${url}`);
