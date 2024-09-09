-- CreateTable
CREATE TABLE "Souce" (
    "id" SERIAL NOT NULL,
    "installID" TEXT NOT NULL,
    "userId" INTEGER,

    CONSTRAINT "Souce_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Souce_installID_key" ON "Souce"("installID");

-- AddForeignKey
ALTER TABLE "Souce" ADD CONSTRAINT "Souce_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
