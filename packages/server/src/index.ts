import { startStandaloneServer } from "@apollo/server/standalone";
import { serverFactory } from "./server.js";

const server = serverFactory("dummy");
const { url } = await startStandaloneServer(server, {
  listen: {
    port: 4000,
  },
});

console.log(`🚀 Server ready at ${url}`);
