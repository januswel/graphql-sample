import { DateTimeResolver } from "graphql-scalars";
import { resolversFactory } from "./interfaces/graphql/todo.js";
import { todoRepositoryFactory } from "./interfaces/database/todo.js";

const todoRepository = todoRepositoryFactory();
const todoResolvers = resolversFactory(todoRepository);

export const resolvers = {
  DateTime: DateTimeResolver,
  Query: {
    ...todoResolvers.queries,
  },
  Mutation: {
    ...todoResolvers.mutations,
  },
  Todo: todoResolvers.todo,
};
