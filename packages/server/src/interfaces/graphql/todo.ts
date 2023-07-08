import type {
  MutationAddTodoArgs,
  MutationDeleteTodoArgs,
  MutationUpdateTodoArgs,
  QueryGetTodoByIdArgs,
  ResolversParentTypes,
  TodoResolvers,
} from "./generated.js";
import * as Todo from "../../entities/todo.js";
import { TodoRepository } from "src/interfaces/database/todo.js";

export interface Resolvers {
  queries: {
    getTodoById: (
      _parent: ResolversParentTypes["Query"],
      args: QueryGetTodoByIdArgs
    ) => Promise<Todo.Entity>;
    getUncompletedTodos: () => Promise<Todo.Entity[]>;
  };
  mutations: {
    addTodo: (
      _parent: ResolversParentTypes["Mutation"],
      args: MutationAddTodoArgs
    ) => Promise<Todo.Entity>;
    updateTodo: (
      _parent: ResolversParentTypes["Mutation"],
      args: MutationUpdateTodoArgs
    ) => Promise<Todo.Entity>;
    deleteTodo: (
      _parent: ResolversParentTypes["Mutation"],
      args: MutationDeleteTodoArgs
    ) => Promise<Todo.Entity>;
  };
  todo: {
    isAbandoned: TodoResolvers["isAbandoned"];
  };
}

export function resolversFactory(todoRepository: TodoRepository): Resolvers {
  // queries
  async function getTodoById(
    _parent: ResolversParentTypes["Query"],
    args: QueryGetTodoByIdArgs
  ) {
    return todoRepository.getTodoById(args.id);
  }

  async function getUncompletedTodos() {
    return todoRepository.getUncompletedTodos();
  }

  // mutations
  async function addTodo(
    _parent: ResolversParentTypes["Mutation"],
    args: MutationAddTodoArgs
  ) {
    return todoRepository.createTodo(args.input);
  }

  async function updateTodo(
    _parent: ResolversParentTypes["Mutation"],
    args: MutationUpdateTodoArgs
  ) {
    return todoRepository.updateTodo({
      id: args.id,
      title: args.input.title || undefined,
      isCompleted: args.input.isCompleted || undefined,
    });
  }

  async function deleteTodo(
    _parent: ResolversParentTypes["Mutation"],
    args: MutationDeleteTodoArgs
  ) {
    return todoRepository.deleteTodo({ id: args.id });
  }

  // todo
  const isAbandoned: TodoResolvers["isAbandoned"] = async (
    parent,
    _args,
    _context,
    _info
  ) => {
    return Todo.isAbandoned(parent);
  };

  return {
    queries: {
      getTodoById,
      getUncompletedTodos,
    },
    mutations: {
      addTodo,
      updateTodo,
      deleteTodo,
    },
    todo: {
      isAbandoned,
    },
  };
}
