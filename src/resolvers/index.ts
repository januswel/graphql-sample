import { DateTimeResolver } from "graphql-scalars";
import {
  getTodoById,
  getTodos,
  addTodo,
  updateTodo,
  deleteTodo,
} from "./todo.js";

export const resolvers = {
  DateTime: DateTimeResolver,
  Query: {
    getTodoById,
    getTodos,
  },
  Mutation: {
    addTodo,
    updateTodo,
    deleteTodo,
  },
};
