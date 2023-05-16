import { Module, ValidationPipe } from "@nestjs/common";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { ServiceInvokerModule } from "./modules/service-invoker/service-invoker.module";
import { ConfigParserModule } from "./modules/config-parser/config-parser.module";
import { PrismaService } from "./global-services/prisma.service";
import { FeedbackModule } from "./modules/feedback/feedback.module";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { EmbeddingsModule } from "./modules/embeddings/embeddings.module";
import { UserModule } from "./modules/user/user.module";
import { FAQModule } from "./modules/faq/faq.module";
import { TelemetryService } from "./global-services/telemetry.service";
import { EmbeddingsService } from "./modules/embeddings/embeddings.service";
import { PromptHistoryService } from "./modules/prompt-history/prompt-history.service";
import { APP_PIPE } from "@nestjs/core";
import { CustomLogger } from "./common/logger";

@Module({
  imports: [
    ConfigModule.forRoot(),
    ServiceInvokerModule,
    ConfigParserModule,
    FeedbackModule,
    EmbeddingsModule,
    FAQModule,
    UserModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    PrismaService,
    ConfigService,
    TelemetryService,
    EmbeddingsService,
    PromptHistoryService,
    {
      provide: APP_PIPE,
      useClass: ValidationPipe,
    },
    CustomLogger
  ],
})
export class AppModule {}
