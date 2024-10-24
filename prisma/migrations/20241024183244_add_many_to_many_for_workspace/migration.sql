/*
  Warnings:

  - You are about to drop the column `userId` on the `Workspace` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Permission" DROP CONSTRAINT "Permission_userId_fkey";

-- DropForeignKey
ALTER TABLE "Permission" DROP CONSTRAINT "Permission_workspaceId_fkey";

-- DropForeignKey
ALTER TABLE "Workspace" DROP CONSTRAINT "Workspace_userId_fkey";

-- AlterTable
ALTER TABLE "Workspace" DROP COLUMN "userId";

-- CreateTable
CREATE TABLE "UserOfWorkspace" (
    "role" "Role" NOT NULL,
    "userId" INTEGER NOT NULL,
    "workspaceId" INTEGER NOT NULL,

    CONSTRAINT "UserOfWorkspace_pkey" PRIMARY KEY ("userId","workspaceId")
);

-- AddForeignKey
ALTER TABLE "Permission" ADD CONSTRAINT "Permission_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Permission" ADD CONSTRAINT "Permission_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserOfWorkspace" ADD CONSTRAINT "UserOfWorkspace_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserOfWorkspace" ADD CONSTRAINT "UserOfWorkspace_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;
