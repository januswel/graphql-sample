/*
  Warnings:

  - The primary key for the `todo` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- AlterTable
ALTER TABLE "todo" DROP CONSTRAINT "todo_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "todo_pkey" PRIMARY KEY ("id");
