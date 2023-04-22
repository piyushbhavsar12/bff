import { Module } from '@nestjs/common';
import { WorlflowConfigService } from './worlflow-config.service';

@Module({
  providers: [WorlflowConfigService]
})
export class WorlflowConfigModule {}
