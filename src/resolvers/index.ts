import { DateTimeResolver } from "graphql-scalars";
import * as Query from "./queries.js";
import * as Mutation from "./mutations.js";
import { TodoResolver } from "./todo.js";

export const resolvers = {
  DateTime: DateTimeResolver,
  Query,
  Mutation,
  Todo: TodoResolver,
};
