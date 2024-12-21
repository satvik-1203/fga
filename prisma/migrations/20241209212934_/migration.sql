/*
  Warnings:

  - A unique constraint covering the columns `[orgId,name]` on the table `Credential` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "Credential_id_name_key";

-- CreateIndex
CREATE UNIQUE INDEX "Credential_orgId_name_key" ON "Credential"("orgId", "name");
