import type {
  MutationResolvers,
  QueryResolvers,
  Todo,
} from "../generated/graphql.js";
import { prisma } from "../prisma.js";

// util
async function existenceCheck(id: string): Promise<Todo> {
  const target = await prisma.todo.findUnique({
    where: { id },
  });

  if (!target) {
    throw new Error("Todo with id ${id} is not found");
  }

  return target;
}

// queries
const getTodoById: QueryResolvers["getTodoById"] = async (
  _parent,
  args,
  _context,
  _info
) => {
  const result = await existenceCheck(args.id);

  return result;
};

const getUncompletedTodos: QueryResolvers["getUncompletedTodos"] = async (
  _parent,
  _args,
  _context,
  _info
) => {
  const result = await prisma.todo.findMany({
    where: { isDone: false },
  });

  return result;
};

export const queries = {
  getTodoById,
  getUncompletedTodos,
};

// mutations
const addTodo: MutationResolvers["addTodo"] = async (
  _parent,
  args,
  _context,
  _info
) => {
  const result = await prisma.todo.create({
    data: {
      title: args.input.title,
    },
  });

  return result;
};

const updateTodo: MutationResolvers["updateTodo"] = async (
  _parent,
  args,
  _context,
  _info
) => {
  await existenceCheck(args.id);

  const result = await prisma.todo.update({
    where: { id: args.id },
    data: {
      title: args.input.title || undefined,
      isDone: args.input.isDone || undefined,
    },
  });

  return result;
};

const deleteTodo: MutationResolvers["deleteTodo"] = async (
  _parent,
  args,
  _context,
  _info
) => {
  await existenceCheck(args.id);

  const result = await prisma.todo.delete({
    where: { id: args.id },
  });

  return result;
};

export const mutations = {
  addTodo,
  updateTodo,
  deleteTodo,
};
