import { PrismaClient } from "@prisma/client";
import { getTables } from "./get-tables.js";

const prisma = new PrismaClient();

async function trancateAll() {
  const tables = await getTables(prisma);

  await prisma.$executeRawUnsafe(
    `TRUNCATE TABLE ${tables.join(", ")} CASCADE;`
  );
}

async function trancate(tableName: string) {
  await prisma.$executeRawUnsafe(`TRUNCATE TABLE ${tableName} CASCADE;`);
}

try {
  if (process.argv[2]) {
    const target = process.argv[2];
    trancate(target);
  } else {
    trancateAll();
  }
} finally {
  prisma.$disconnect();
}
