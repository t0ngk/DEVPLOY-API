/*
  Warnings:

  - Added the required column `port` to the `Database` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `Database` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Database" ADD COLUMN     "port" INTEGER NOT NULL,
ADD COLUMN     "userId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "applicationQuota" INTEGER NOT NULL DEFAULT 5,
ADD COLUMN     "databaseQuota" INTEGER NOT NULL DEFAULT 2;

-- AddForeignKey
ALTER TABLE "Database" ADD CONSTRAINT "Database_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
