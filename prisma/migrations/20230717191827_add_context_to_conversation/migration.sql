/*
  Warnings:

  - Added the required column `context` to the `conversation` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "conversation" ADD COLUMN     "context" JSONB NOT NULL;
