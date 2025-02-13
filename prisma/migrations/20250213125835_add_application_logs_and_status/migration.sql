/*
  Warnings:

  - Added the required column `logs` to the `Appication` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "Status" AS ENUM ('notStarted', 'inProgress', 'Deployed', 'Failed');

-- AlterTable
ALTER TABLE "Appication" ADD COLUMN     "logs" JSONB NOT NULL,
ADD COLUMN     "status" "Status" NOT NULL DEFAULT 'notStarted';
