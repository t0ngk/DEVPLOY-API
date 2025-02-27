/*
  Warnings:

  - You are about to drop the column `config` on the `Database` table. All the data in the column will be lost.
  - Added the required column `databaseName` to the `Database` table without a default value. This is not possible if the table is not empty.
  - Added the required column `password` to the `Database` table without a default value. This is not possible if the table is not empty.
  - Added the required column `username` to the `Database` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Database" DROP COLUMN "config",
ADD COLUMN     "databaseName" TEXT NOT NULL,
ADD COLUMN     "password" TEXT NOT NULL,
ADD COLUMN     "username" TEXT NOT NULL;
