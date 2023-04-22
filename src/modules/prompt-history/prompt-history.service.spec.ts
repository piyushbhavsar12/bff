import { Test, TestingModule } from '@nestjs/testing';
import { PromptHistoryService } from './prompt-history.service';

describe('PromptHistoryService', () => {
  let service: PromptHistoryService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PromptHistoryService],
    }).compile();

    service = module.get<PromptHistoryService>(PromptHistoryService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
