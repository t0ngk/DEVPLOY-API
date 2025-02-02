/*
  Warnings:

  - Made the column `souceId` on table `Appication` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "Appication" DROP CONSTRAINT "Appication_souceId_fkey";

-- AlterTable
ALTER TABLE "Appication" ALTER COLUMN "souceId" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "Appication" ADD CONSTRAINT "Appication_souceId_fkey" FOREIGN KEY ("souceId") REFERENCES "Souce"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
