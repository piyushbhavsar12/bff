-- CreateTable
CREATE TABLE "feedback" (
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "id" SERIAL NOT NULL,
    "review" TEXT,
    "rating" INTEGER,
    "phoneNumber" TEXT NOT NULL,

    CONSTRAINT "feedback_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "feedback_phoneNumber_key" ON "feedback"("phoneNumber");
