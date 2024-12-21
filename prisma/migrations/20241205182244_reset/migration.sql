/*
  Warnings:

  - You are about to drop the column `orgId` on the `User` table. All the data in the column will be lost.
  - You are about to drop the `Credential` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Org` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Credential" DROP CONSTRAINT "Credential_orgId_fkey";

-- DropForeignKey
ALTER TABLE "User" DROP CONSTRAINT "User_orgId_fkey";

-- AlterTable
ALTER TABLE "User" DROP COLUMN "orgId",
ADD COLUMN     "awsRoleArn" TEXT,
ADD COLUMN     "awsSession" JSONB;

-- DropTable
DROP TABLE "Credential";

-- DropTable
DROP TABLE "Org";
