import { Module, ValidationPipe } from "@nestjs/common";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { ServiceInvokerModule } from "./modules/service-invoker/service-invoker.module";
import { ConfigParserModule } from "./modules/config-parser/config-parser.module";
import { PrismaService } from "./global-services/prisma.service";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { UserModule } from "./modules/user/user.module";
import { APP_PIPE } from "@nestjs/core";
import { CustomLogger } from "./common/logger";

@Module({
  imports: [
    ConfigModule.forRoot(),
    ServiceInvokerModule,
    ConfigParserModule,
    UserModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    PrismaService,
    ConfigService,
    {
      provide: APP_PIPE,
      useClass: ValidationPipe,
    },
    CustomLogger
  ],
})
export class AppModule {}
