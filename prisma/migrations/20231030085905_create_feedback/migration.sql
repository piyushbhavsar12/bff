-- CreateTable
CREATE TABLE "feedback" (
    "id" SERIAL NOT NULL,
    "conversationId" UUID,
    "translation" SMALLINT NOT NULL DEFAULT 0,
    "information" SMALLINT NOT NULL DEFAULT 0,
    "chatbotFunctionality" SMALLINT NOT NULL DEFAULT 0,
    "feedback" TEXT,

    CONSTRAINT "feedback_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "feedback_conversationId_key" ON "feedback"("conversationId");

-- AddForeignKey
ALTER TABLE "feedback" ADD CONSTRAINT "feedback_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "conversation"("id") ON DELETE SET NULL ON UPDATE CASCADE;
