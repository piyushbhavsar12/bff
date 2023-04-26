import { Module } from "@nestjs/common";
import { FAQController } from "./faq.controller";
import { FAQService } from "./faq.service";
import { PrismaService } from "../../global-services/prisma.service";
import { APP_PIPE } from "@nestjs/core";
import { ValidationPipe } from "@nestjs/common";

@Module({
  providers: [
    FAQService,
    PrismaService,
    {
      provide: APP_PIPE,
      useClass: ValidationPipe,
    },
  ],
  controllers: [FAQController],
})
export class FAQModule {}
