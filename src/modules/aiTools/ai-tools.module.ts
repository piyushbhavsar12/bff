import { Module } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

@Module({
  providers: [
    ConfigService,
  ],
  controllers: [],
})
export class AiToolsModule {}