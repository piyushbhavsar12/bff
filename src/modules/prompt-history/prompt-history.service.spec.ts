import { Test, TestingModule } from "@nestjs/testing";
import { PromptHistoryService } from "./prompt-history.service";
import { PrismaService } from "../../global-services/prisma.service";
import { ConfigService } from "@nestjs/config";

describe("PromptHistoryService", () => {
  let service: PromptHistoryService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PromptHistoryService, PrismaService, ConfigService],
    }).compile();

    service = module.get<PromptHistoryService>(PromptHistoryService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });
});
