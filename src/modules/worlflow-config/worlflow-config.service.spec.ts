import { Test, TestingModule } from '@nestjs/testing';
import { WorlflowConfigService } from './worlflow-config.service';

describe('WorlflowConfigService', () => {
  let service: WorlflowConfigService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [WorlflowConfigService],
    }).compile();

    service = module.get<WorlflowConfigService>(WorlflowConfigService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
