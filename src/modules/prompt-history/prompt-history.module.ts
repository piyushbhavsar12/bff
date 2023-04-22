import { Module } from '@nestjs/common';
import { PromptHistoryService } from './prompt-history.service';

@Module({
  providers: [PromptHistoryService]
})
export class PromptHistoryModule {}
