import { Test, TestingModule } from '@nestjs/testing';
import { ConfigParserService } from './config-parser.service';

describe('ConfigParserService', () => {
  let service: ConfigParserService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ConfigParserService],
    }).compile();

    service = module.get<ConfigParserService>(ConfigParserService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
