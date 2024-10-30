/*
  Warnings:

  - You are about to drop the column `awsAccount` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "awsAccount",
ADD COLUMN     "awsRoleArn" TEXT,
ADD COLUMN     "awsSession" JSONB;
