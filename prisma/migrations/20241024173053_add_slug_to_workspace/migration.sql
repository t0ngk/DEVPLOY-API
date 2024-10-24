/*
  Warnings:

  - A unique constraint covering the columns `[slug]` on the table `Workspace` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `slug` to the `Workspace` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Workspace" DROP CONSTRAINT "Workspace_userId_fkey";

-- AlterTable
ALTER TABLE "Workspace" ADD COLUMN     "slug" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Workspace_slug_key" ON "Workspace"("slug");

-- AddForeignKey
ALTER TABLE "Workspace" ADD CONSTRAINT "Workspace_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
