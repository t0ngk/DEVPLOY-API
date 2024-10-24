-- CreateTable
CREATE TABLE "Invite" (
    "id" SERIAL NOT NULL,
    "workspaceId" INTEGER NOT NULL,
    "toUserId" INTEGER,

    CONSTRAINT "Invite_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Invite" ADD CONSTRAINT "Invite_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Invite" ADD CONSTRAINT "Invite_toUserId_fkey" FOREIGN KEY ("toUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
