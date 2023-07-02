import { getTodoById, getTodos } from "./todo.js";
import { DateTimeResolver } from "graphql-scalars";

export const resolvers = {
  DateTime: DateTimeResolver,
  Query: {
    getTodoById,
    getTodos,
  },
};
