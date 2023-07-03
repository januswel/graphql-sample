import type {
  MutationAddTodoArgs,
  MutationDeleteTodoArgs,
  MutationUpdateTodoArgs,
  QueryGetTodoByIdArgs,
  ResolversParentTypes,
  TodoResolvers,
} from "../generated/graphql.js";
import { prisma } from "../prisma.js";
import * as Todo from "../entities/todo.js";

// util
async function existenceCheck(id: string) {
  const target = await prisma.todo.findUnique({
    where: { id },
  });

  if (!target) {
    throw new Error("Todo with id ${id} is not found");
  }

  return target;
}

// queries
export async function getTodoById(
  _parent: ResolversParentTypes["Query"],
  args: QueryGetTodoByIdArgs
) {
  const result = await existenceCheck(args.id);

  return result;
}

export async function getUncompletedTodos() {
  const result = await prisma.todo.findMany({
    where: { isCompleted: false },
  });

  return result;
}

// mutations
export async function addTodo(
  _parent: ResolversParentTypes["Mutation"],
  args: MutationAddTodoArgs
) {
  const result = await prisma.todo.create({
    data: {
      title: args.input.title,
    },
  });

  return result;
}

export async function updateTodo(
  _parent: ResolversParentTypes["Mutation"],
  args: MutationUpdateTodoArgs
) {
  await existenceCheck(args.id);

  const result = await prisma.todo.update({
    where: { id: args.id },
    data: {
      title: args.input.title || undefined,
      isCompleted: args.input.isCompleted || undefined,
    },
  });

  return result;
}

export async function deleteTodo(
  _parent: ResolversParentTypes["Mutation"],
  args: MutationDeleteTodoArgs
) {
  await existenceCheck(args.id);

  const result = await prisma.todo.delete({
    where: { id: args.id },
  });

  return result;
}

// todo
export const isAbandoned: TodoResolvers["isAbandoned"] = async (
  parent,
  _args,
  _context,
  _info
) => {
  return Todo.isAbandoned(parent);
};

export const TodoResolver = {
  isAbandoned,
};
