import { Body, Controller, Post, Get } from "@nestjs/common";
import { CreateDocumentDto, SearchQueryDto } from "./embeddings.dto";
import { EmbeddingsService } from "./embeddings.service";
import { document as Document } from "@prisma/client";

@Controller("document")
export class EmbeddingsController {
  constructor(private readonly feedbackService: EmbeddingsService) {}

  @Post()
  async createOrUpdate(
    @Body() createFeedbackDto: CreateDocumentDto | CreateDocumentDto[]
  ): Promise<Document[]> {
    if (!Array.isArray(createFeedbackDto)) {
      createFeedbackDto = [createFeedbackDto];
    }
    return this.feedbackService.createOrUpdate(createFeedbackDto);
  }

  @Post("/searchSimilar")
  async findByCriteria(
    @Body() searchQueryDto: SearchQueryDto
  ): Promise<Document[]> {
    return this.feedbackService.findByCriteria(searchQueryDto);
  }

  //   @Get()
  //   async findAll(): Promise<Document[]> {
  //     return this.feedbackService.findAll();
  //   }
}
