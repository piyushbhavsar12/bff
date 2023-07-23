import { Module } from "@nestjs/common";
import { PrismaService } from "../../global-services/prisma.service";
import { ConversationService } from "./conversation.service";
import { ConfigService } from "@nestjs/config";

@Module({
  controllers: [],
  providers: [
    ConversationService,
    PrismaService,
    ConfigService,
  ],
})
export class ConversationModule {}
