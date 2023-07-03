import { DateTimeResolver } from "graphql-scalars";
import * as Todo from "./todo.js";

export const resolvers = {
  DateTime: DateTimeResolver,
  Query: {
    ...Todo.queries,
  },
  Mutation: {
    ...Todo.mutations,
  },
};
