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

export function todoRepositoryFactory(databaseUrl: string): TodoRepository {
  const prisma = prismaClientFactory(databaseUrl);

  async function getUncompletedTodos() {
    const todos = await prisma.todo.findMany({
      where: { isCompleted: false },
    });
    return todos;
  }

  async function getTodoById(id: string) {
    const todo = await prisma.todo.findUnique({
      where: { id },
    });

    if (!todo) {
      throw new Error(`Todo with id ${id} is not found`);
    }

    return todo;
  }

  async function createTodo(args: CreateTodoArgs) {
    const todo = await prisma.todo.create({
      data: {
        title: args.title,
      },
    });
    return todo;
  }

  async function updateTodo(args: UpdateTodoArgs) {
    getTodoById(args.id);

    const todo = await prisma.todo.update({
      where: { id: args.id },
      data: {
        title: args.title || undefined,
        isCompleted: args.isCompleted || undefined,
      },
    });
    return todo;
  }

  async function deleteTodo(args: DeleteTodoArgs) {
    getTodoById(args.id);

    const todo = await prisma.todo.delete({
      where: { id: args.id },
    });
    return todo;
  }

  return {
    getUncompletedTodos,
    getTodoById,
    createTodo,
    updateTodo,
    deleteTodo,
  };
}
