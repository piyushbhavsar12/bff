// monitoring.module.ts
import { Module, OnModuleInit, Global, DynamicModule } from '@nestjs/common';
import { MonitoringService } from './monitoring.service';
import { PrismaService } from 'src/global-services/prisma.service';
import { MonitoringController } from './monitoring.controller';
import { CacheModule } from '@nestjs/cache-manager';
import * as redisStore from 'cache-manager-redis-store';

@Global()
@Module({
  imports: [
    CacheModule.register({
      isGlobal: true,
      store: redisStore,
      host: process.env.REDIS_HOST,
      port: process.env.REDIS_PORT,
    }),
  ],
  providers: [MonitoringService, PrismaService],
  exports: [MonitoringService],
  controllers: [MonitoringController],
})
export class MonitoringModule implements OnModuleInit {
  constructor(private readonly monitoringService: MonitoringService) {}

  async onModuleInit() {
    await this.monitoringService.initializeAsync();
  }

  static forRoot(options?: any): DynamicModule {
    return {
      module: MonitoringModule,
      providers: [
        {
          provide: 'CONFIG_OPTIONS',
          useValue: options,
        },
      ],
      exports: [MonitoringService],
    };
  }
}