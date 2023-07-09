import { PrismaClient } from "@prisma/client";
import { Entity } from "../../entities/todo.js";
import { prismaClientFactory } from "./prisma.js";

export interface CreateTodoArgs {
  title: string;
}

export interface UpdateTodoArgs {
  id: string;
  title?: string;
  isCompleted?: boolean;
}

export interface DeleteTodoArgs {
  id: string;
}

export interface TodoRepository {
  getUncompletedTodos(): Promise<Entity[]>;
  getTodoById(id: string): Promise<Entity>;
  createTodo(args: CreateTodoArgs): Promise<Entity>;
  updateTodo(args: UpdateTodoArgs): Promise<Entity>;
  deleteTodo(args: DeleteTodoArgs): Promise<Entity>;
}

async function getUncompletedTodos(prisma: PrismaClient) {
  const todos = await prisma.todo.findMany({
    where: { isCompleted: false },
  });
  return todos;
}

async function getTodoById(prisma: PrismaClient, id: string) {
  const todo = await prisma.todo.findUnique({
    where: { id },
  });

  if (!todo) {
    throw new Error(`Todo with id ${id} is not found`);
  }

  return todo;
}

async function createTodo(prisma: PrismaClient, args: CreateTodoArgs) {
  const todo = await prisma.todo.create({
    data: {
      title: args.title,
    },
  });
  return todo;
}

async function updateTodo(prisma: PrismaClient, args: UpdateTodoArgs) {
  getTodoById(prisma, args.id);

  const todo = await prisma.todo.update({
    where: { id: args.id },
    data: {
      title: args.title || undefined,
      isCompleted: args.isCompleted || undefined,
    },
  });
  return todo;
}

async function deleteTodo(prisma: PrismaClient, args: DeleteTodoArgs) {
  getTodoById(prisma, args.id);

  const todo = await prisma.todo.delete({
    where: { id: args.id },
  });
  return todo;
}

export function todoRepositoryFactory(databaseUrl: string): TodoRepository {
  const prismaClient = prismaClientFactory(databaseUrl);
  return {
    getUncompletedTodos: () => getUncompletedTodos(prismaClient),
    getTodoById: (id) => getTodoById(prismaClient, id),
    createTodo: (args) => createTodo(prismaClient, args),
    updateTodo: (args) => updateTodo(prismaClient, args),
    deleteTodo: (args) => deleteTodo(prismaClient, args),
  };
}
