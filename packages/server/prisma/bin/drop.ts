import { PrismaClient } from "@prisma/client";
import { getTables } from "./get-tables.js";

const prisma = new PrismaClient();

async function dropAll() {
  const tables = await getTables(prisma);

  await prisma.$executeRawUnsafe(`DROP TABLE ${tables.join(", ")} CASCADE;`);
}

async function drop(tableName: string) {
  await prisma.$executeRawUnsafe(`DROP TABLE ${tableName} CASCADE;`);
}

try {
  if (process.argv[2]) {
    const target = process.argv[2];
    drop(target);
  } else {
    dropAll();
  }
} finally {
  prisma.$disconnect();
}
