import { Module } from "@nestjs/common";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { ServiceInvokerModule } from "./modules/service-invoker/service-invoker.module";
import { ConfigParserModule } from "./modules/config-parser/config-parser.module";
import { PrismaService } from "./global-services/prisma.service";
import { FeedbackModule } from "./modules/feedback/feedback.module";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { UserModule } from "./modules/user/user.module";
import { FAQModule } from "./modules/faq/faq.module";

@Module({
  imports: [
    ConfigModule.forRoot(),
    ServiceInvokerModule, ConfigParserModule, FeedbackModule, FAQModule, UserModule],
  controllers: [AppController],
  providers: [AppService, PrismaService, ConfigService],
})
export class AppModule {}
