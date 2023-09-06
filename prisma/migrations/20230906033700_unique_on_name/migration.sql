/*
  Warnings:

  - A unique constraint covering the columns `[name]` on the table `Metrics` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Metrics_name_key" ON "Metrics"("name");
