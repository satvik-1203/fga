/*
  Warnings:

  - A unique constraint covering the columns `[id,name]` on the table `Credential` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Credential_id_name_key" ON "Credential"("id", "name");
