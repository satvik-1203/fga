/*
  Warnings:

  - You are about to drop the column `serviceUserName` on the `ServiceUser` table. All the data in the column will be lost.
  - Added the required column `serviceUserId` to the `ServiceUser` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "ServiceUser" DROP COLUMN "serviceUserName",
ADD COLUMN     "serviceUserId" TEXT NOT NULL;
