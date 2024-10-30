/*
  Warnings:

  - You are about to drop the column `credentials` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "credentials",
ADD COLUMN     "awsAccount" JSONB;
