import { Module, ValidationPipe } from "@nestjs/common";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { PrismaService } from "./global-services/prisma.service";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { UserModule } from "./modules/user/user.module";
import { APP_GUARD, APP_PIPE } from "@nestjs/core";
import { CustomLogger } from "./common/logger";
import { ConversationService } from "./modules/conversation/conversation.service";
import { ConversationModule } from "./modules/conversation/conversation.module";
import { PrometheusModule } from "@willsoto/nestjs-prometheus";
import { RateLimiterGuard } from './rate-limiter.guard';
import { ThrottlerModule } from '@nestjs/throttler';
import { MonitoringModule } from "./modules/monitoring/monitoring.module";
import { PromptModule } from "./xstate/prompt/prompt.module";
import { TelemetryModule } from "./modules/telemetry/telemetry.module";
import { TelemetryService } from "./modules/telemetry/telemetry.service";

@Module({
  imports: [
    ConfigModule.forRoot(),
    UserModule,
    ConversationModule,
    MonitoringModule,
    PrometheusModule.register({
      defaultMetrics:{
        enabled: false
      }
    }),
    PromptModule,
    TelemetryModule,
    ThrottlerModule.forRoot({
      ttl: 60, // Time in seconds for the window (e.g., 60 seconds)
      limit: 10, // Maximum requests per window
    }),
  ],
  controllers: [AppController],
  providers: [
    AppService,
    PrismaService,
    ConfigService,
    ConversationService,
    TelemetryService,
    {
      provide: APP_PIPE,
      useClass: ValidationPipe,
    },
    CustomLogger,
    {
      provide: APP_GUARD,
      useClass: RateLimiterGuard,
    },
  ],
})
export class AppModule {}