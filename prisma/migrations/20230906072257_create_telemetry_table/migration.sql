-- Enable the uuid-ossp extension in the current database.
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Verify that the extension is enabled.
SELECT * FROM pg_extension WHERE extname = 'uuid-ossp';

-- Create the main telemetry_logs table
CREATE TABLE telemetry_logs (
  eid UUID NOT NULL DEFAULT uuid_generate_v4(),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT NOW(),
  "eventType" TEXT NOT NULL,
  "eventName" TEXT NOT NULL,
  "producer" JSONB,
  "context" JSONB,
  "sessionId" UUID NOT NULL,
  "eventData" JSONB,
  "errorType" TEXT,
  tags JSONB
);

-- CreateIndex
CREATE UNIQUE INDEX "telemetry_logs_createdAt_idx" ON "telemetry_logs"("eid", "createdAt");

-- Install TimescaleDB extension
CREATE EXTENSION IF NOT EXISTS timescaledb CASCADE; SELECT create_hypertable('telemetry_logs', 'createdAt', 'eid', 4);