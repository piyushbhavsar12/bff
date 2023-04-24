import { Module } from "@nestjs/common";
import { EmbeddingsService } from "./embeddings.service";
import { EmbeddingsController } from "./embeddings.controller";
import { PrismaService } from "src/global-services/prisma.service";
import { ConfigService } from "@nestjs/config";
import { APP_PIPE } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';

@Module({
  providers: [
    EmbeddingsService, 
    PrismaService, 
    ConfigService,
    {
      provide: APP_PIPE,
      useClass: ValidationPipe,
    }
  ],
  controllers: [EmbeddingsController],
})
export class EmbeddingsModule {}
