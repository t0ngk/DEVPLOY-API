-- AlterTable
ALTER TABLE "Appication" ADD COLUMN     "souceId" INTEGER;

-- AddForeignKey
ALTER TABLE "Appication" ADD CONSTRAINT "Appication_souceId_fkey" FOREIGN KEY ("souceId") REFERENCES "Souce"("id") ON DELETE SET NULL ON UPDATE CASCADE;
