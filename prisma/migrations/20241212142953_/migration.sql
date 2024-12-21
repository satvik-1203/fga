-- DropForeignKey
ALTER TABLE "ServiceUser" DROP CONSTRAINT "ServiceUser_userId_fkey";

-- AddForeignKey
ALTER TABLE "ServiceUser" ADD CONSTRAINT "ServiceUser_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
