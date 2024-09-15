/*
  Warnings:

  - You are about to drop the column `userId` on the `Projects` table. All the data in the column will be lost.
  - Added the required column `Projectemail` to the `Projects` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Projects" DROP CONSTRAINT "Projects_userId_fkey";

-- AlterTable
ALTER TABLE "Projects" DROP COLUMN "userId",
ADD COLUMN     "Projectemail" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "Projects" ADD CONSTRAINT "Projects_Projectemail_fkey" FOREIGN KEY ("Projectemail") REFERENCES "User"("email") ON DELETE RESTRICT ON UPDATE CASCADE;
