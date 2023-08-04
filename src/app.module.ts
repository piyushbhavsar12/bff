import { Module, ValidationPipe } from "@nestjs/common";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { PrismaService } from "./global-services/prisma.service";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { UserModule } from "./modules/user/user.module";
import { APP_PIPE } from "@nestjs/core";
import { CustomLogger } from "./common/logger";
import { ConversationService } from "./modules/conversation/conversation.service";
import { ConversationModule } from "./modules/conversation/conversation.module";
import { PrometheusModule } from "@willsoto/nestjs-prometheus";

@Module({
  imports: [
    ConfigModule.forRoot(),
    UserModule,
    ConversationModule,
    PrometheusModule.register()
  ],
  controllers: [AppController],
  providers: [
    AppService,
    PrismaService,
    ConfigService,
    ConversationService,
    {
      provide: APP_PIPE,
      useClass: ValidationPipe,
    },
    CustomLogger
  ],
})
export class AppModule {}
