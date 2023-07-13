import { DateTimeResolver } from "graphql-scalars";
import { resolversFactory as todoResolversFactory } from "./interfaces/graphql/todo.js";
import { todoRepositoryFactory } from "./interfaces/database/todo.js";

export function resolversFactory(databaseUrl: string) {
  const todoRepository = todoRepositoryFactory(databaseUrl);
  const todoResolvers = todoResolversFactory(todoRepository);

  const resolvers = {
    DateTime: DateTimeResolver,
    Query: {
      ...todoResolvers.queries,
    },
    Mutation: {
      ...todoResolvers.mutations,
    },
    Todo: todoResolvers.todo,
  };

  return resolvers;
}
