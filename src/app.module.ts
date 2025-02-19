import { CacheModule, Module, ValidationPipe } from "@nestjs/common";
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
import { MonitoringController } from "./modules/monitoring/monitoring.controller";
import { CacheProvider } from "./modules/cache/cache.provider";
import { HttpModule } from "@nestjs/axios";
import { LoggerModule } from 'nestjs-pino';
import { HealthModule } from "./modules/health/health.module";
import { MetricsModule } from './metrics/metrics.module';


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
      ttl: 60,
      limit: 10,
    }),
    CacheModule.register(),
    HealthModule,
    MetricsModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    PrismaService,
    ConfigService,
    ConversationService,
    TelemetryService,
    MonitoringController,
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