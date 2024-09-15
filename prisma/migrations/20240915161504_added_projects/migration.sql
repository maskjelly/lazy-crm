-- CreateEnum
CREATE TYPE "TaskStatus" AS ENUM ('Completed', 'Working', 'Pending');

-- CreateTable
CREATE TABLE "Projects" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,

    CONSTRAINT "Projects_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Tasks" (
    "id" SERIAL NOT NULL,
    "taskDetails" TEXT NOT NULL,
    "taskId" INTEGER NOT NULL,
    "taskUpdate" "TaskStatus" NOT NULL,

    CONSTRAINT "Tasks_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Projects" ADD CONSTRAINT "Projects_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Tasks" ADD CONSTRAINT "Tasks_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "Projects"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
