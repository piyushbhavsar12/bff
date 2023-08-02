-- AlterTable
ALTER TABLE "User" ADD COLUMN     "identifier" TEXT,
ADD COLUMN     "isVerified" BOOLEAN NOT NULL DEFAULT false;
