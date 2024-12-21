-- CreateTable
CREATE TABLE "ServiceUser" (
    "id" TEXT NOT NULL,
    "service" TEXT NOT NULL,
    "serviceUserName" TEXT NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "ServiceUser_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "ServiceUser" ADD CONSTRAINT "ServiceUser_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
