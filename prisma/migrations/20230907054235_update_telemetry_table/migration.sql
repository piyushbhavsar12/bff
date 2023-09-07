/*
  Warnings:

  - Added the required column `platform` to the `telemetry_logs` table without a default value. This is not possible if the table is not empty.
  - Made the column `producer` on table `telemetry_logs` required. This step will fail if there are existing NULL values in that column.
  - Made the column `context` on table `telemetry_logs` required. This step will fail if there are existing NULL values in that column.
  - Made the column `eventData` on table `telemetry_logs` required. This step will fail if there are existing NULL values in that column.

*/
-- DropIndex
DROP INDEX "telemetry_logs_createdAt_idx1";

-- AlterTable
ALTER TABLE "telemetry_logs" ADD COLUMN     "platform" TEXT NOT NULL,
ALTER COLUMN "eid" DROP DEFAULT,
ALTER COLUMN "producer" SET NOT NULL,
ALTER COLUMN "context" SET NOT NULL,
ALTER COLUMN "eventData" SET NOT NULL;

-- RenameIndex
ALTER INDEX "telemetry_logs_createdAt_idx" RENAME TO "telemetry_logs_eid_createdAt_key";
