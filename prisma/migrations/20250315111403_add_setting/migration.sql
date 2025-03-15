-- CreateTable
CREATE TABLE "Setting" (
    "id" SERIAL NOT NULL,
    "baseUrl" TEXT NOT NULL DEFAULT 'localhost',
    "reservePort" INTEGER NOT NULL DEFAULT 5000,
    "reservePortEnd" INTEGER NOT NULL DEFAULT 6000,
    "defaultApplictionQuota" INTEGER NOT NULL DEFAULT 5,
    "defaultDatabaseQuota" INTEGER NOT NULL DEFAULT 2,

    CONSTRAINT "Setting_pkey" PRIMARY KEY ("id")
);
