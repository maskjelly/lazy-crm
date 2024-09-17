/*
  Warnings:

  - You are about to drop the column `projectId` on the `Tasks` table. All the data in the column will be lost.
  - Added the required column `taskId` to the `Tasks` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Tasks" DROP CONSTRAINT "Tasks_projectId_fkey";

-- AlterTable
ALTER TABLE "Tasks" DROP COLUMN "projectId",
ADD COLUMN     "taskId" INTEGER NOT NULL,
ALTER COLUMN "taskUpdate" DROP DEFAULT;

-- AddForeignKey
ALTER TABLE "Tasks" ADD CONSTRAINT "Tasks_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "Projects"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
