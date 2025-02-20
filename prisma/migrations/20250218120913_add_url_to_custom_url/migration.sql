/*
  Warnings:

  - Added the required column `url` to the `Appication` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Appication" ADD COLUMN     "url" TEXT NOT NULL;
