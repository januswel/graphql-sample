import { DateTimeResolver } from "graphql-scalars";
import {
  getTodoById,
  getUncompletedTodos,
  addTodo,
  updateTodo,
  deleteTodo,
} from "./todo.js";

export const resolvers = {
  DateTime: DateTimeResolver,
  Query: {
    getTodoById,
    getUncompletedTodos,
  },
  Mutation: {
    addTodo,
    updateTodo,
    deleteTodo,
  },
};
