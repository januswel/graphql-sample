import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function addTodos() {
  await prisma.todo.upsert({
    where: { id: "bf7hbgnuqtxekqlhnqelfyso" },
    update: {},
    create: {
      id: "bf7hbgnuqtxekqlhnqelfyso",
      title: "Learn Prisma",
      isCompleted: true,
    },
  });
  await prisma.todo.upsert({
    where: { id: "q0lj8euq8ryd5mf0ue3lyn90" },
    update: {},
    create: {
      id: "q0lj8euq8ryd5mf0ue3lyn90",
      title: "Learn GraphQL",
      updatedAt: new Date("2021-08-01T00:00:00.000Z"),
    },
  });
  await prisma.todo.upsert({
    where: { id: "x01oeid70f5hr6j20i92pvnt" },
    update: {},
    create: { id: "x01oeid70f5hr6j20i92pvnt", title: "Write todo app" },
  });
}

try {
  addTodos();
} finally {
  prisma.$disconnect();
}
