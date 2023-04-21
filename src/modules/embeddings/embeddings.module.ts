import { Module } from "@nestjs/common";
import { EmbeddingsService } from "./embeddings.service";
import { EmbeddingsController } from "./embeddings.controller";
import { PrismaService } from "../../global-services/prisma.service";
import { ConfigService } from "@nestjs/config";

@Module({
  providers: [EmbeddingsService, PrismaService, ConfigService],
  controllers: [EmbeddingsController],
})
export class EmbeddingsModule {}
