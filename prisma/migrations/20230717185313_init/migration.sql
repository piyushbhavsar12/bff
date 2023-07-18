-- CreateExtension
CREATE EXTENSION IF NOT EXISTS "vector";

-- CreateTable
CREATE TABLE "query" (
    "id" UUID,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "responseTime" INTEGER NOT NULL,
    "query" TEXT NOT NULL,
    "response" TEXT NOT NULL,
    "queryInEnglish" TEXT NOT NULL,
    "responseInEnglish" TEXT NOT NULL,
    "userId" UUID NOT NULL,
    "reaction" SMALLINT NOT NULL DEFAULT 0,
    "workflowId" INTEGER,
    "conversationId" UUID NOT NULL,
    "isConversationDeleted" BOOLEAN NOT NULL DEFAULT false
);

-- CreateTable
CREATE TABLE "conversation" (
    "id" UUID NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" UUID NOT NULL,
    "workflowId" INTEGER
);

-- CreateTable
CREATE TABLE "workflow" (
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "id" SERIAL NOT NULL,
    "userId" UUID NOT NULL,
    "content" JSONB NOT NULL,
    "queryId" TEXT,
    "conversationId" TEXT,

    CONSTRAINT "workflow_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "config" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "version" INTEGER NOT NULL,
    "data" JSONB NOT NULL,
    "question" TEXT NOT NULL,
    "answer" TEXT NOT NULL,

    CONSTRAINT "config_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "query_workflowId_key" ON "query"("workflowId");

-- CreateIndex
CREATE UNIQUE INDEX "query_userId_createdAt_key" ON "query"("userId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "conversation_workflowId_key" ON "conversation"("workflowId");

-- CreateIndex
CREATE UNIQUE INDEX "conversation_id_key" ON "conversation"("id");

-- AddForeignKey
ALTER TABLE "query" ADD CONSTRAINT "query_workflowId_fkey" FOREIGN KEY ("workflowId") REFERENCES "workflow"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "query" ADD CONSTRAINT "query_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "conversation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "conversation" ADD CONSTRAINT "conversation_workflowId_fkey" FOREIGN KEY ("workflowId") REFERENCES "workflow"("id") ON DELETE SET NULL ON UPDATE CASCADE;
