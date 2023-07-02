import type { QueryResolvers } from "../generated/graphql.js";
import { prisma } from "../prisma.js";

export const getTodoById: QueryResolvers["getTodoById"] = async (
  _parent,
  args,
  _context,
  _info
) => {
  console.log(args);
  const todo = await prisma.todo.findUnique({
    where: { id: args.id },
  });

  if (!todo) {
    throw new Error("Todo not found");
  }

  return { ...todo };
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
