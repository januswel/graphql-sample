import type {
  MutationResolvers,
  QueryResolvers,
  Todo,
} from "../generated/graphql.js";
import { prisma } from "../prisma.js";

async function existenceCheck(id: string): Promise<Todo> {
  const target = await prisma.todo.findUnique({
    where: { id },
  });

  if (!target) {
    throw new Error("Todo with id ${id} is not found");
  }

  return target;
}

export const getTodoById: QueryResolvers["getTodoById"] = async (
  _parent,
  args,
  _context,
  _info
) => {
  const result = await existenceCheck(args.id);

  return result;
};

export const getTodos: QueryResolvers["getTodos"] = async (
  _parent,
  _args,
  _context,
  _info
) => {
  const todos = await prisma.todo.findMany();

  return todos;
};

export const addTodo: MutationResolvers["addTodo"] = async (
  _parent,
  args,
  _context,
  _info
) => {
  const todo = await prisma.todo.create({
    data: {
      title: args.input.title,
    },
  });

  return todo;
};

export const updateTodo: MutationResolvers["updateTodo"] = async (
  _parent,
  args,
  _context,
  _info
) => {
  await existenceCheck(args.id);

  const todo = await prisma.todo.update({
    where: { id: args.id },
    data: {
      title: args.input.title || undefined,
      isDone: args.input.isDone || undefined,
    },
  });

  return todo;
};

export const deleteTodo: MutationResolvers["deleteTodo"] = async (
  _parent,
  args,
  _context,
  _info
) => {
  await existenceCheck(args.id);

  const todo = await prisma.todo.delete({
    where: { id: args.id },
  });

  return todo;
};
