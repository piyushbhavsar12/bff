import { Test, TestingModule } from '@nestjs/testing';
import { ServiceInvokerService } from './service-invoker.service';

describe('ServiceInvokerService', () => {
  let service: ServiceInvokerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ServiceInvokerService],
    }).compile();

    service = module.get<ServiceInvokerService>(ServiceInvokerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
