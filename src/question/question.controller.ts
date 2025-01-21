import { Controller, Get, Query, BadRequestException } from '@nestjs/common';
import { QuestionsService } from './question.service';

@Controller('questions')
export class QuestionsController {
  constructor(private readonly questionsService: QuestionsService) {}

  @Get('fetchdbresponse')
  async fetchDbResponse(@Query('question') question: string) {
    if (!question) {
      throw new BadRequestException('Question parameter is required.');
    }

    return await this.questionsService.fetchResponse(question);
  }
}