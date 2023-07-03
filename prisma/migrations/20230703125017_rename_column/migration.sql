/*
  Warnings:

  - You are about to drop the column `isDone` on the `todo` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "todo" DROP COLUMN "isDone",
ADD COLUMN     "isCompleted" BOOLEAN NOT NULL DEFAULT false;
