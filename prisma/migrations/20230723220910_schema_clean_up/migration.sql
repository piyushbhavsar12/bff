/*
  Warnings:

  - You are about to drop the column `workflowId` on the `conversation` table. All the data in the column will be lost.
  - You are about to drop the `query` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `workflow` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[userId,flowId]` on the table `conversation` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `flowId` to the `conversation` table without a default value. This is not possible if the table is not empty.
  - Added the required column `state` to the `conversation` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "conversation" DROP CONSTRAINT "conversation_workflowId_fkey";

-- DropForeignKey
ALTER TABLE "query" DROP CONSTRAINT "query_conversationId_fkey";

-- DropForeignKey
ALTER TABLE "query" DROP CONSTRAINT "query_workflowId_fkey";

-- DropIndex
DROP INDEX "conversation_workflowId_key";

-- AlterTable
ALTER TABLE "conversation" DROP COLUMN "workflowId",
ADD COLUMN     "flowId" TEXT NOT NULL,
ADD COLUMN     "state" TEXT NOT NULL;

-- DropTable
DROP TABLE "query";

-- DropTable
DROP TABLE "workflow";

-- CreateIndex
CREATE UNIQUE INDEX "conversation_userId_flowId_key" ON "conversation"("userId", "flowId");
