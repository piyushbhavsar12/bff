import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ServiceInvokerModule } from './service-invoker/service-invoker.module';
import { ConfigParserModule } from './config-parser/config-parser.module';

@Module({
  imports: [ServiceInvokerModule, ConfigParserModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
