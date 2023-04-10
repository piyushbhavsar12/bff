import { Module } from '@nestjs/common';
import { ServiceInvokerService } from './service-invoker.service';

@Module({
  providers: [ServiceInvokerService]
})
export class ServiceInvokerModule {}
