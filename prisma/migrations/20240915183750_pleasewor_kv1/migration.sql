/*
  Warnings:

  - You are about to drop the column `Projectemail` on the `Projects` table. All the data in the column will be lost.
  - Added the required column `userID` to the `Projects` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Projects" DROP CONSTRAINT "Projects_Projectemail_fkey";

-- AlterTable
ALTER TABLE "Projects" DROP COLUMN "Projectemail",
ADD COLUMN     "userID" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "Projects" ADD CONSTRAINT "Projects_userID_fkey" FOREIGN KEY ("userID") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
