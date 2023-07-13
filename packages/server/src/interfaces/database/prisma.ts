import { PrismaClient } from "@prisma/client";

export function prismaClientFactory(databaseUrl: string) {
  if (process.env["AWS_REGION"]) {
    return new PrismaClient({
      datasources: {
        db: {
          url: databaseUrl,
        },
      },
    });
  }

  return new PrismaClient();
}
